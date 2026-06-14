<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AnakController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ChallengeHistoryController;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\CompletedSkillController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SkillActivityController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\PilarController;
use App\Http\Controllers\WorksheetController;
use App\Models\Activity;
use App\Services\LocalImageGeneratorService;
use App\Services\StoryGeneratorService;
use App\Actions\PlanAction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/stories/generate', function (Request $request, StoryGeneratorService $stories, LocalImageGeneratorService $images) {
    $theme = (string) $request->query('theme', 'kebersamaan');
    $childName = (string) $request->query('child_name', 'Anak');
    $pagesCount = (int) $request->query('pages_count', 4);
    if ($pagesCount < 1) $pagesCount = 1;
    if ($pagesCount > 24) $pagesCount = 24;
    $generateImages = (bool) $request->query('generate_images', false);
    $withAi = (bool) $request->query('with_ai', false);
    $save = (bool) $request->query('save', false);

    if ($withAi) {
        $generated = $stories->generateWithAI($theme, $childName, $pagesCount);
        $pages = $generated['pages'];
    } else {
        $generated = $stories->generate($theme, $childName);
        $pagesRaw = array_slice($generated['pages'], 0, $pagesCount);
        $pages = [];
        foreach ($pagesRaw as $index => $page) {
            $pages[] = [
                'num' => $index + 1,
                'text' => $page['text'],
            ];
        }
    }

    $title = $generated['title'];
    $slug = Str::slug($title) . '-' . Str::random(5);
    $moral = $generated['moral'];

    $response = [
        'title' => $title,
        'slug' => $slug,
        'moral' => $moral,
        'pages' => $pages,
        'theme' => $theme,
        'child_name' => $childName,
        'source' => $generated['source'] ?? 'template',
    ];

    if ($save) {
        $activity = Activity::create([
            'type' => 'storytelling',
            'title' => $title,
            'slug' => $slug,
            'desc' => $title . ' - Cerita tentang ' . $theme . ' untuk anak.',
            'image' => null,
            'moral' => $moral,
            'ages' => range(3, 8),
            'skills' => [],
            'data' => ['pages' => $pages],
            'sort_order' => 0,
            'active' => true,
            'views' => 0,
            'status' => 'approved',
        ]);

        if ($generateImages && $activity) {
            $savedPages = [];
            foreach ($pages as $page) {
                $num = (int) ($page['num'] ?? 1);
                $savedPages[] = [
                    'num' => $num,
                    'text' => $page['text'],
                    'image' => 'https://backend.test/storage/images/stories/' . $activity->id . '/' . str_pad((string)$num, 2, '0', STR_PAD_LEFT) . '.png',
                ];
            }
            $activity->data = array_merge($activity->data ?? [], ['pages' => $savedPages]);
            $activity->image = 'https://backend.test/storage/images/stories/' . $activity->id . '/01.png';
            $activity->save();
            $pages = $savedPages;
        }

        $response['activity_id'] = $activity->id;
        $response['saved'] = true;
    } elseif ($generateImages) {
        $tempId = time();
        foreach ($pages as &$page) {
            $num = (int) ($page['num'] ?? 1);
            $page['image'] = 'https://backend.test/storage/images/stories/' . $tempId . '/' . str_pad((string)$num, 2, '0', STR_PAD_LEFT) . '.png';
        }
        unset($page);
    }

    return response()->json($response);
})->name('stories.generate');

Route::get('/stories/preview', function (Request $request, LocalImageGeneratorService $images) {
    $pages = $request->query('pages', []);
    if (!is_array($pages)) $pages = [$pages];
    $generateImages = (bool) $request->query('generate_images', false);

    if ($generateImages) {
        foreach ($pages as &$page) {
            $prompt = is_array($page) ? trim($page['text'] ?? '') : trim((string) $page);
            if (is_array($page) && isset($page['text'])) {
                $page['image'] = $images->generate($prompt);
            }
        }
        unset($page);
    }

    return response()->json([
        'pages' => $pages,
    ]);
})->name('stories.preview');

// OpenAI-compatible endpoint for AI tools (Aider, Cursor, Windsurf, Cline, etc.)
Route::post('/openai/v1/chat/completions', function (Request $request, StoryGeneratorService $stories, LocalImageGeneratorService $images) {
    $body = $request->all();
    $stream = !empty($body['stream']) && $body['stream'] === true;

    $messages = $body['messages'] ?? [];
    $lastMessage = end($messages);
    $userPrompt = is_array($lastMessage) ? ($lastMessage['content'] ?? '') : '';

    $theme = 'kebersamaan';
    $childName = 'Anak';
    $pagesCount = 4;
    $generateImages = false;

    if (preg_match('/tema[:\s]+([a-z_]+)/i', $userPrompt, $m)) {
        $theme = strtolower(trim($m[1]));
    }
    if (preg_match('/nama[:\s]+([A-Za-z]+)/i', $userPrompt, $m)) {
        $childName = trim($m[1]);
    }
    if (preg_match('/pages?[:\s]+(\d+)/i', $userPrompt, $m)) {
        $pagesCount = (int) $m[1];
        if ($pagesCount < 2) $pagesCount = 2;
        if ($pagesCount > 8) $pagesCount = 8;
    }
    if (stripos($userPrompt, 'gambar') !== false || stripos($userPrompt, 'image') !== false) {
        $generateImages = true;
    }

    if ($stream) {
        return response()->stream(function () use ($stories, $images, $theme, $childName, $pagesCount, $generateImages) {
            $generated = $stories->generate($theme, $childName);
            $pages = array_slice($generated['pages'], 0, $pagesCount);
            $renumbered = [];
            foreach ($pages as $index => $page) {
                $renumbered[] = [
                    'num' => $index + 1,
                    'text' => $page['text'],
                ];
            }
            if ($generateImages) {
                $tempId = time();
                foreach ($renumbered as &$page) {
                    $num = (int) ($page['num'] ?? 1);
                    $page['image'] = 'https://backend.test/storage/images/stories/' . $tempId . '/' . str_pad((string)$num, 2, '0', STR_PAD_LEFT) . '.png';
                }
                unset($page);
            }

            $content = json_encode([
                'title' => $generated['title'],
                'moral' => $generated['moral'],
                'pages' => $renumbered,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $chunk = json_encode([
                'id' => 'chatcmpl-' . Str::random(8),
                'object' => 'chat.completion.chunk',
                'created' => time(),
                'model' => 'story-generator',
                'choices' => [[
                    'index' => 0,
                    'delta' => ['content' => $content],
                    'finish_reason' => 'stop',
                ]],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            echo "data: {$chunk}\n\n";
            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    $generated = $stories->generate($theme, $childName);
    $pages = array_slice($generated['pages'], 0, $pagesCount);
    $renumbered = [];
    foreach ($pages as $index => $page) {
        $renumbered[] = [
            'num' => $index + 1,
            'text' => $page['text'],
        ];
    }
    if ($generateImages) {
        $tempId = time();
        foreach ($renumbered as &$page) {
            $num = (int) ($page['num'] ?? 1);
            $page['image'] = 'https://backend.test/storage/images/stories/' . $tempId . '/' . str_pad((string)$num, 2, '0', STR_PAD_LEFT) . '.png';
        }
        unset($page);
    }

    $content = json_encode([
        'title' => $generated['title'],
        'moral' => $generated['moral'],
        'pages' => $renumbered,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    return response()->json([
        'id' => 'chatcmpl-' . Str::random(8),
        'object' => 'chat.completion',
        'created' => time(),
        'model' => 'story-generator',
        'choices' => [
            [
                'index' => 0,
                'message' => [
                    'role' => 'assistant',
                    'content' => $content,
                ],
                'finish_reason' => 'stop',
            ],
        ],
        'usage' => [
            'prompt_tokens' => max(1, (int) (strlen($userPrompt) / 4)),
            'completion_tokens' => max(1, (int) (strlen($content) / 4)),
            'total_tokens' => max(2, (int) ((strlen($userPrompt) + strlen($content)) / 4)),
        ],
    ]);
})->name('openai.stories.completions');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/config', function () {
    return response()->json([
        'forgot_gateway' => config('langkahkecil.verification.forgot_gateway', 'whatsapp'),
        'verification_gateway' => config('langkahkecil.verification.gateway', 'whatsapp'),
        'app_name' => config('app.name', 'Jejak Tumbuh'),
    ]);
});

Route::get('/plans', function () {
    $plans = \App\Models\Plan::where('plan_status', 1)
        ->orderBy('plan_harga')
        ->get()
        ->map(function ($p) {
            $periodEnum = \App\PeriodEnum::tryFrom($p->plan_periode);
            return [
                'id' => $p->plan_id,
                'name' => $p->plan_nama,
                'description' => $p->plan_keterangan,
                'value' => $p->plan_value,
                'price' => $p->plan_harga,
                'fee' => $p->plan_fee,
                'color' => $p->plan_color,
                'recommended' => (bool) $p->plan_recomended,
                'period' => $p->plan_periode,
                'period_label' => $periodEnum?->description() ?? $p->plan_periode,
                'interval' => $p->plan_interval,
            ];
        });

    return response()->json(['plans' => $plans]);
})->name('plans.index');

Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
Route::get('/activities/types', [ActivityController::class, 'types'])->name('activities.types');
Route::get('/activities/popular', [ActivityController::class, 'popular'])->name('activities.popular');
Route::get('/activities/{slug}', [ActivityController::class, 'show'])->name('activities.show');
Route::post('/activities/{id}/view', [ActivityController::class, 'trackView'])->name('activities.view');

Route::get('/pilars', [PilarController::class, 'index'])->name('pilars.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/activities/{id}', [ActivityController::class, 'update'])->name('activities.update');
    Route::get('/me', [AuthController::class, 'me'])->name('me');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/send-verification', [AuthController::class, 'sendVerification'])->name('verification.send');
    Route::post('/verify', [AuthController::class, 'verify'])->name('verification.verify');

    Route::middleware('verified')->group(function () {
        Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
        Route::put('/password', [AuthController::class, 'changePassword'])->name('password.change');
        Route::put('/affiliate-code', [AuthController::class, 'updateAffiliateCode'])->name('affiliate.update');
        Route::post('/rekening', [AuthController::class, 'updateRekening'])->name('rekening.update');
        Route::post('/cashout', [AuthController::class, 'requestCashout'])->name('cashout.request');
        Route::get('/cashouts', [AuthController::class, 'cashoutList'])->name('cashout.list');
        Route::get('/referrals', [AuthController::class, 'referralList'])->name('referrals.list');
        Route::get('/discounts', [DiscountController::class, 'index'])->name('discounts.index');
        Route::post('/discounts', [DiscountController::class, 'store'])->name('discounts.store');
        Route::delete('/discounts/{id}', [DiscountController::class, 'destroy'])->name('discounts.destroy');
        Route::post('/purchase-plan', PlanAction::class . '@purchase')->name('purchase.plan');
        Route::get('/validate-plan', PlanAction::class . '@validatePlan')->name('validate.plan');

        Route::prefix('payments')->group(function () {
            Route::post('/', [PaymentController::class, 'create'])->name('payments.create');
            Route::get('/{id}', [PaymentController::class, 'status'])->name('payments.status');
            Route::post('/{id}/settle', [PaymentController::class, 'settle'])->name('payments.settle');
            Route::post('/{id}/cancel', [PaymentController::class, 'cancel'])->name('payments.cancel');
            Route::get('/', [PaymentController::class, 'history'])->name('payments.history');
            Route::post('/validate-discount', [PaymentController::class, 'validateDiscount'])->name('payments.validate-discount');
        });

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
            Route::put('/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
            Route::put('/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
            Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
            Route::delete('/', [NotificationController::class, 'clearAll'])->name('notifications.clear-all');
        });

        Route::get('/anak', [AnakController::class, 'index'])->name('anak.index');
        Route::post('/anak', [AnakController::class, 'store'])->name('anak.store');
        Route::put('/anak/{anakId}', [AnakController::class, 'update'])->name('anak.update');
        Route::delete('/anak/{anakId}', [AnakController::class, 'destroy'])->name('anak.destroy');
        Route::post('/sync', [AnakController::class, 'sync'])->name('anak.sync');

        Route::post('/anak/{anakId}/skills', [SkillController::class, 'store'])->name('anak.skills.store');
        Route::put('/anak/{anakId}/skills/{skillId}', [SkillController::class, 'update'])->name('anak.skills.update');
        Route::delete('/anak/{anakId}/skills/{skillId}', [SkillController::class, 'destroy'])->name('anak.skills.destroy');

        Route::put('/activities/{id}', [ActivityController::class, 'update'])->name('activities.update');

        Route::post('/anak/{anakId}/activities', [SkillActivityController::class, 'store'])->name('anak.activities.store');
        Route::delete('/anak/{anakId}/activities/{activityId}', [SkillActivityController::class, 'destroy'])->name('anak.activities.destroy');
        Route::put('/anak/{anakId}/activities/{activityId}/toggle', [SkillActivityController::class, 'toggle'])->name('anak.activities.toggle');

        Route::post('/anak/{anakId}/completed-skills', [CompletedSkillController::class, 'store'])->name('anak.completed-skills.store');
        Route::delete('/anak/{anakId}/completed-skills/{key}', [CompletedSkillController::class, 'destroy'])->name('anak.completed-skills.destroy');

        Route::post('/anak/{anakId}/challenges', [ChallengeController::class, 'store'])->name('anak.challenges.store');
        Route::put('/anak/{anakId}/challenges/{challengeId}', [ChallengeController::class, 'update'])->name('anak.challenges.update');
        Route::delete('/anak/{anakId}/challenges/{challengeId}', [ChallengeController::class, 'destroy'])->name('anak.challenges.destroy');

        Route::post('/anak/{anakId}/challenge-history', [ChallengeHistoryController::class, 'store'])->name('anak.challenge-history.store');

        Route::post('/anak/{anakId}/checklists', [ChecklistController::class, 'store'])->name('anak.checklists.store');
        Route::put('/anak/{anakId}/checklists/{checklistId}', [ChecklistController::class, 'update'])->name('anak.checklists.update');
        Route::delete('/anak/{anakId}/checklists/{checklistId}', [ChecklistController::class, 'destroy'])->name('anak.checklists.destroy');

        Route::post('/anak/{anakId}/schedules', [ScheduleController::class, 'store'])->name('anak.schedules.store');
        Route::put('/anak/{anakId}/schedules/{scheduleId}', [ScheduleController::class, 'update'])->name('anak.schedules.update');
        Route::delete('/anak/{anakId}/schedules/{scheduleId}', [ScheduleController::class, 'destroy'])->name('anak.schedules.destroy');

        Route::post('/anak/{anakId}/worksheets', [WorksheetController::class, 'store'])->name('anak.worksheets.store');
        Route::delete('/anak/{anakId}/worksheets/{worksheetId}', [WorksheetController::class, 'destroy'])->name('anak.worksheets.destroy');

        Route::get('/anak/{anakId}/evaluations', [EvaluationController::class, 'index'])->name('anak.evaluations.index');
        Route::get('/evaluations/{evaluationId}', [EvaluationController::class, 'show'])->name('evaluations.show');
        Route::post('/evaluations/{evaluationId}/finalize', [EvaluationController::class, 'finalize'])->name('evaluations.finalize');
    });
});
