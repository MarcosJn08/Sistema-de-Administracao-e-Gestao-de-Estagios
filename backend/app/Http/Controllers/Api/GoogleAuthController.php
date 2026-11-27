<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\GoogleAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly GoogleAuthService $googleAuthService
    ) {}

    public function redirect(): RedirectResponse|JsonResponse
    {
        $redirectUrl = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'url' => $redirectUrl,
            ]);
        }

        return redirect()->away($redirectUrl);
    }

    public function callback(Request $request): UserResource|JsonResponse
    {
        try {
            if ($request->has('code')) {
                $googleUser = Socialite::driver('google')->stateless()->user();
            } elseif ($request->has('token') || $request->has('access_token')) {
                $token = $request->input('token') ?? $request->input('access_token');
                $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);
            } else {
                $googleUser = Socialite::driver('google')->stateless()->user();
            }

            $authentication = $this->googleAuthService->autenticarOuProvisionar($googleUser);

            $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

            if ($request->wantsJson()) {
                $resource = (new UserResource($authentication['user']))->additional([
                    'success' => true,
                    'message' => 'Autenticação via Google realizada com sucesso.',
                    'token' => $authentication['token'],
                    'token_type' => $authentication['token_type'],
                    'expires_at' => $authentication['expires_at'],
                    'errors' => [],
                ]);

                return $resource->response()->setStatusCode(200);
            }

            $query = http_build_query([
                'token' => $authentication['token'],
                'expires_at' => $authentication['expires_at'],
                'role' => $authentication['user']->role,
            ]);

            return redirect()->away("{$frontendUrl}/sage/login?{$query}");
        } catch (\Illuminate\Validation\ValidationException $e) {
            $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
            $mensagem = $e->validator->errors()->first('email') ?? $e->getMessage();

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $mensagem,
                    'errors' => $e->errors(),
                ], 422);
            }

            $query = http_build_query(['auth_error' => $mensagem]);
            return redirect()->away("{$frontendUrl}/sage/login?{$query}");
        } catch (\Exception $e) {
            $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
            $msgOriginal = $e->getMessage();

            if (str_contains($msgOriginal, 'invalid_grant') || str_contains($msgOriginal, 'Client error')) {
                $mensagemAmigavel = 'O código de autorização expirou ou já foi utilizado. Por favor, tente fazer login novamente.';
            } else {
                $mensagemAmigavel = 'Falha na autenticação via Google: ' . $msgOriginal;
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $mensagemAmigavel,
                    'errors' => ['google' => [$mensagemAmigavel]],
                ], 400);
            }

            $query = http_build_query(['auth_error' => $mensagemAmigavel]);
            return redirect()->away("{$frontendUrl}/sage/login?{$query}");
        }
    }
}
