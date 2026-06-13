<?php

use App\Http\Controllers\DashboardController;
use App\Models\User;
use Buki\AutoRoute\Facades\Route;

Route::view('/', 'welcome')->name('home');
Route::middleware(['auth', 'verified', 'access'])->group(function () {

    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::auto('/user', 'UsersController', ['name' => 'user']);
    Route::auto('/subscribe', 'SubscribeController', ['name' => 'subscribe']);
    Route::auto('/plan', 'PlanController', ['name' => 'plan']);
    Route::auto('/cashout', 'CashoutController', ['name' => 'cashout']);
    Route::auto('/payment', 'PaymentController', ['name' => 'payment']);
    Route::auto('/affiliate', 'AffiliateController', ['name' => 'affiliate']);
    Route::auto('/activity', 'ActivityController', ['name' => 'activity']);
    Route::auto('/discount', 'DiscountController', ['name' => 'discount']);
});

require __DIR__.'/settings.php';
