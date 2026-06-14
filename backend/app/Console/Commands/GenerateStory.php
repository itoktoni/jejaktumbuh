<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Services\StoryGeneratorService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateStory extends Command
{
    protected $signature = 'generate:story
        {theme : Story theme (e.g. kebersamaan, kejujuran, kemandirian, kisah_nabi)}
        {--child= : Child name (auto-generated if empty)}
        {--pages= : Number of pages (default 5)}
        {--ages= : Target ages, e.g. 7 means [6,7,8,9,10] or comma-separated 3,4,5,6,7,8}
        {--agama= : Religion tag (e.g. islam, kristen, katholik, hindu, budha)}';

    protected $description = 'Generate a children story with AI and save to database';

    public function handle(StoryGeneratorService $service): int
    {
        $theme = $this->argument('theme');
        $pagesCount = (int) ($this->option('pages') ?: 16);

        $ages = $this->parseAges($this->option('ages'));
        $agama = $this->option('agama') ? strtolower(trim($this->option('agama'))) : null;
        $childName = $this->option('child') ?: null;

        $this->info("Generating story with AI...");
        $this->line("Theme   : {$theme}");
        $this->line("Child   : " . ($childName ?: '-'));
        $this->line("Pages   : {$pagesCount}");
        $this->line("Ages    : " . implode(',', $ages));
        $this->line("Agama   : " . ($agama ?: '-'));
        $this->newLine();

        $result = $service->generateWithAI($theme, $childName ?: 'Anak', $pagesCount, null, $ages);

        $title = $result['title'];
        $moral = $result['moral'] ?? '';
        $desc = $result['desc'] ?? '';

        $slug = Str::slug($title) . '-' . Str::random(5);

        $pages = [];
        $pagesForPrompt = [];
        foreach ($result['pages'] as $index => $page) {
            $pagesForPrompt[] = [
                'num' => $index,
                'text' => $page['text'] ?? '',
            ];
            if ($index === 0) continue;
            $pages[] = [
                'num' => $index,
                'text' => $page['text'] ?? '',
            ];
        }

        $pagesJson = json_encode($pagesForPrompt, JSON_UNESCAPED_UNICODE);

        $prompt = "create image canvas 9000 x 9000 pixel\n\n";
        $prompt .= "- Buat 16 gambar persegi terpisah (2250×2250)\n\n";
        $prompt .= "- Perbandingan setiap gambar cerita dengan rasio 1 : 1\n\n";
        $prompt .= "- Lalu susun ke kanvas 9000×9000 menggunakan template grid tetap.\n\n";
        $prompt .= "- Total {$pagesCount} panel\n\n";
        $prompt .= "- Perfect square ratio 1:1 for every panel\n\n";
        $prompt .= "- No merged panels,No oversized panels,No rounded corners.\n\n";
        $prompt .= "- Straight vertical and horizontal grid lines only.\n\n";
        $prompt .= "- Pure white divider lines between panels.\n\n";
        $prompt .= "- No outer border around canvas.\n\n";
        $prompt .= "- No objects crossing panel boundaries.\n\n";
        $prompt .= "- Every scene fully contained inside its own panel.\n\n";
        $prompt .= "- Reading order left-to-right, top-to-bottom.\n\n";
        $prompt .= "- Pixar 3D cartoon style, bright colorful daylight, kid friendly.\n\n";
        $prompt .= "- Panel 1 cover with title centered.\n\n";
        $prompt .= "- jangan text / tulisan di dalam gambar kecuali cover\n\n";
        $prompt .= "- border antar panel warna putih\n\n";
        $prompt .= "- Dirancang agar bisa dipotong otomatis menggunakan rasio 1 : 1\n\n";
        $prompt .= "- halaman pertama cover dengan tulisan text judul cerita yang menarik dan besar di tengah\n\n";
        $prompt .= "pages : {$pagesJson}\n";
        $prompt .= "title : {$title}\n";
        $prompt .= "theme : {$desc}\n";
        $prompt .= "moral : {$moral}";

        $activity = Activity::create([
            'type' => 'storytelling',
            'title' => $title,
            'slug' => $slug,
            'desc' => $desc ?: 'Cerita anak tentang ' . $theme,
            'image' => 'cover.png',
            'moral' => $moral,
            'ages' => $ages,
            'skills' => [],
            'data' => ['pages' => $pages],
            'sort_order' => 0,
            'active' => true,
            'views' => 0,
            'status' => 'pending',
            'agama' => $agama ? [$agama] : [],
            'created_by' => 1,
            'prompt' => $prompt,
            'notes' => null,
            'creator' => null,
        ]);

        $this->info("=== {$title} ===");
        $this->newLine();

        if ($desc) {
            $this->line("Desc: {$desc}");
            $this->newLine();
        }

        foreach ($pages as $page) {
            $this->line("  [{$page['num']}] {$page['text']}");
        }

        $this->newLine();

        if ($moral) {
            $this->comment("Moral: {$moral}");
        }

        $this->newLine();
        $this->info("Saved to database! Activity ID: {$activity->id}");

        return self::SUCCESS;
    }

    private function parseAges(?string $input): array
    {
        if (empty($input)) {
            return range(3, 8);
        }

        if (str_contains($input, ',')) {
            return array_map('intval', array_filter(explode(',', $input), fn($v) => is_numeric($v)));
        }

        $age = (int) $input;
        $min = max(1, $age - 1);
        $max = min(10, $age + 3);
        return range($min, $max);
    }
}
