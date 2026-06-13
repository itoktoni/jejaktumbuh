<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->verified_at) {
            return response()->json([
                'message' => 'Akun belum terverifikasi. Silakan verifikasi terlebih dahulu.',
                'needs_verification' => true,
                'verification_gateway' => config('langkahkecil.verification.gateway', 'whatsapp'),
            ], 403);
        }

        return $next($request);
    }
}
