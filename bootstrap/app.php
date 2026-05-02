<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // ✅ Telegram webhook uchun CSRF istisno
        $middleware->validateCsrfTokens(except: [
            'telegram/handle'
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

function telegramlog($text)
{
    $token = "7763950049:AAFyTjSgv47GC-76zSez6Q9pPzNNYPH6kqA";
    $chat_id = "531110501";
    try {
        $telegram = new \Telegram\Bot\Api($token);

        // Agar $text array bo'lsa uni string qilamiz, string bo'lsa o'zini yuboramiz
        $message = is_array($text) || is_object($text)
            ? json_encode($text, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            : $text;

        $telegram->sendMessage([
            'chat_id' => $chat_id,
            'text' => $message,
            // 'parse_mode' => 'html' ni o'chirib turgan ma'qul, chunki {} belgilar HTML xatosi berishi mumkin
        ]);

        return 1;
    } catch (\Exception $exception) {
        \Illuminate\Support\Facades\Log::error('Telegram API Error: ' . $exception->getMessage());
        return $exception->getMessage();
    }
}
