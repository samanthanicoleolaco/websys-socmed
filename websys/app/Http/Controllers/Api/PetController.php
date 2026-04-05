<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pet;
use Illuminate\Support\Facades\Auth;

class PetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    /**
     * Display a listing of pets with search and pagination
     */
    public function index(Request $request)
    {
        $query = Pet::with('user');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('breed', 'like', '%' . $search . '%')
                  ->orWhere('bio', 'like', '%' . $search . '%');
            });
        }

        $pets = $query->paginate(15);

        return response()->json($pets);
    }

    /**
     * Store a newly created pet
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:50',
            'breed' => 'required|string|max:255',
            'photo' => 'nullable|string',
            'bio' => 'nullable|string|max:1000',
        ]);

        $pet = Auth::user()->pets()->create($validated);

        return response()->json($pet->load('user'), 201);
    }

    /**
     * Display the specified pet
     */
    public function show(Pet $pet)
    {
        return response()->json($pet->load(['user', 'posts' => function ($query) {
            $query->latest()->limit(10);
        }]));
    }

    /**
     * Update the specified pet
     */
    public function update(Request $request, Pet $pet)
    {
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'age' => 'sometimes|required|integer|min:0|max:50',
            'breed' => 'sometimes|required|string|max:255',
            'photo' => 'sometimes|nullable|string',
            'bio' => 'sometimes|nullable|string|max:1000',
        ]);

        $pet->update($validated);

        return response()->json($pet->load('user'));
    }

    /**
     * Remove the specified pet
     */
    public function destroy(Pet $pet)
    {
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pet->delete();

        return response()->json(['message' => 'Pet deleted successfully']);
    }
}
