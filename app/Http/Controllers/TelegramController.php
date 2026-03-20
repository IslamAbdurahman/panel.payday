<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessTelegramUpdate;
use Illuminate\Http\Request;

class TelegramController extends Controller
{
    public function handle(Request $request)
    {
        $update = $request->all();

        // Darhol 200 qaytarish — Telegram timeout ko'rmasin
        // Bot javobi response dan KEYIN background da ishlaydi
        dispatch(new ProcessTelegramUpdate($update))->afterResponse();

        return response('OK', 200);
    }
}
