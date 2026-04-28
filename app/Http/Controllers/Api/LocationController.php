<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    private const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
    private const USER_AGENT = 'Petverse/1.0 (https://github.com/samanthanicoleolaco/websys-socmed)';

    public function search(Request $request)
    {
        $query = trim((string) $request->query('q', ''));
        if (mb_strlen($query) < 3) {
            return response()->json([]);
        }

        $cacheKey = 'nominatim:search:' . sha1(mb_strtolower($query));
        $results = Cache::remember($cacheKey, now()->addHours(6), function () use ($query) {
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
                'Accept' => 'application/json',
            ])->timeout(8)->get(self::NOMINATIM_BASE . '/search', [
                'format' => 'json',
                'q' => $query,
                'limit' => 8,
                'addressdetails' => 1,
            ]);

            if (!$response->successful()) {
                return [];
            }

            return collect($response->json() ?? [])->map(fn ($item) => [
                'id' => $item['place_id'] ?? null,
                'display_name' => $item['display_name'] ?? '',
                'lat' => $item['lat'] ?? null,
                'lon' => $item['lon'] ?? null,
            ])->all();
        });

        return response()->json($results);
    }

    public function nearby(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        if (!is_numeric($lat) || !is_numeric($lon)) {
            return response()->json([]);
        }

        $latF = (float) $lat;
        $lonF = (float) $lon;
        $cacheKey = sprintf('nominatim:nearby:%.3f:%.3f', $latF, $lonF);

        $results = Cache::remember($cacheKey, now()->addHours(1), function () use ($latF, $lonF) {
            $viewbox = sprintf('%F,%F,%F,%F', $lonF - 0.05, $latF - 0.05, $lonF + 0.05, $latF + 0.05);
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
                'Accept' => 'application/json',
            ])->timeout(8)->get(self::NOMINATIM_BASE . '/search', [
                'format' => 'json',
                'lat' => $latF,
                'lon' => $lonF,
                'bounded' => 1,
                'limit' => 6,
                'viewbox' => $viewbox,
            ]);

            if (!$response->successful()) {
                return [];
            }

            return collect($response->json() ?? [])->map(fn ($item) => [
                'id' => $item['place_id'] ?? null,
                'display_name' => $item['display_name'] ?? '',
                'lat' => $item['lat'] ?? null,
                'lon' => $item['lon'] ?? null,
            ])->all();
        });

        return response()->json($results);
    }
}
