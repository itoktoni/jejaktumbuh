<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\PlanFeature;
use App\Models\Subscribe;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::truncate();
        Subscribe::truncate();

         $plan = [
            [
                'plan_nama' => 'Free Trial 3 Hari',
                'plan_status' => 1,
                'plan_keterangan' => '1 Anak Free untuk 3 hari',
                'plan_value' => 1,
                'plan_harga' => 0,
                'plan_fee' => 0,
                'plan_periode' => '10d',
                'plan_color' => 'rgb(178, 190, 181)',
                'plan_interval' => '3d',
                'plan_recomended' => 0,
            ],
            [
                'plan_nama' => '1 Bulanan',
                'plan_status' => 1,
                'plan_keterangan' => '10 Anak untuk 1 Bulan',
                'plan_value' => 10,
                'plan_harga' => 99000,
                'plan_fee' => 0,
                'plan_periode' => '1m',
                'plan_color' => 'rgb(109, 190, 123)',
                'plan_interval' => '1m',
                'plan_recomended' => 0,
            ],
            [
                'plan_nama' => '3 Bulan',
                'plan_status' => 1,
                'plan_keterangan' => '10 Anak untuk 3 Bulan',
                'plan_value' => 10,
                'plan_harga' => 275000,
                'plan_fee' => 0,
                'plan_periode' => '3m',
                'plan_color' => 'rgb(255, 152, 0)',
                'plan_interval' => '3m',
                'plan_recomended' => 0,
            ],
             [
                'plan_nama' => '6 Bulan',
                'plan_status' => 1,
                'plan_keterangan' => '10 Anak untuk 6 Bulan',
                'plan_value' => 10,
                'plan_harga' => 395000,
                'plan_fee' => 0,
                'plan_periode' => '6m',
                'plan_color' => 'rgb(33, 150, 243)',
                'plan_interval' => '6m',
                'plan_recomended' => 1,
            ],
            [
                'plan_nama' => '12 Bulan',
                'plan_status' => 1,
                'plan_keterangan' => '10 Anak untuk 12 Bulan',
                'plan_value' => 10,
                'plan_harga' => 990000,
                'plan_fee' => 0,
                'plan_periode' => '1y',
                'plan_color' => 'rgb(233, 30, 99)',
                'plan_interval' => '1y',
                'plan_recomended' => '0',
            ],
        ];

        Plan::insert($plan);

    }
}
