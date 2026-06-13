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
use App\Actions\PlanAction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
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
Route::get('/activities/{slug}', [ActivityController::class, 'show'])->name('activities.show');

Route::get('/pilars', [PilarController::class, 'index'])->name('pilars.index');

Route::middleware('auth:sanctum')->group(function () {
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
        Route::post('/anak/{anakId}/evaluations', [EvaluationController::class, 'store'])->name('anak.evaluations.store');
        Route::delete('/anak/{anakId}/evaluations/{evalId}', [EvaluationController::class, 'destroy'])->name('anak.evaluations.destroy');
    });
});

Route::post('webhook', function(){
    $request = request()->all();
    Log::info($request);
});

Route::get('test', function(){
    dd(now()->format('Y-m-d H:i:s'));
});
