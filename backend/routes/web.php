<?php

use App\Http\Controllers\Api\UploadController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::get('/', function () {
    return response()->json(['application' => 'Hawa backend', 'status' => 'ok']);
});

Route::get('/uploads/{path}', [UploadController::class, 'show'])->where('path', '.*')
    ->withoutMiddleware([
        StartSession::class,
        ShareErrorsFromSession::class,
        ValidateCsrfToken::class,
        PreventRequestForgery::class,
    ]);
