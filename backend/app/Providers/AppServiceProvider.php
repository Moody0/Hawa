<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('testing') && config('database.default') === 'sqlite') {
            DB::connection()->getPdo()->sqliteCreateCollation('utf8mb4_0900_bin', static fn (string $left, string $right): int => strcmp($left, $right));
        }
    }
}
