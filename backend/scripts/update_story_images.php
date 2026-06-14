<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Activity;

$activity = Activity::orderByDesc('id')->first();

if (!$activity) {
    echo "No activities found\n";
    exit(1);
}

$pages = $activity->data['pages'] ?? [];
$total = count($pages);
$id = $activity->id;

foreach ($pages as $index => $page) {
    $num = $index + 1;
    $page['image'] = "https://backend.test/storage/images/stories/{$id}/" . str_pad((string)$num, 2, '0', STR_PAD_LEFT) . ".png";
    $pages[$index] = $page;
}

$activity->data = array_merge($activity->data ?? [], ['pages' => $pages]);
$activity->image = 'https://backend.test/storage/images/stories/' . $id . '/01.png';
$activity->save();

echo "Updated activity ID: {$id}\n";
echo "Title: {$activity->title}\n";
echo "Pages count: {$total}\n";
echo "Page 1: " . ($pages[0]['image'] ?? 'none') . "\n";
echo "Page 2: " . ($pages[1]['image'] ?? 'none') . "\n";
echo "Page {$total}: " . ($pages[$total-1]['image'] ?? 'none') . "\n";
