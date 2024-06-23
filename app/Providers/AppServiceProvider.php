<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

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
        Inertia::share([
            'locale' => function () {
                return app()->getLocale();
            },
            'language' => function () {
                if (!file_exists(resource_path('lang/' . app()->getLocale() . '.json'))) {
                    return [];
                }

                return json_decode(
                    file_get_contents(resource_path('lang/' . app()->getLocale() . '.json')),
                    true
                );
            },
        ]);
    }
}
