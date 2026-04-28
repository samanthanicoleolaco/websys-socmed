<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdoptionListing;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdoptionListingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    public function index(Request $request)
    {
        $query = AdoptionListing::with('pet:id,name,breed,age,photo,location,bio')
            ->where('status', 'available')
            ->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $query->whereHas('pet', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->get('search') . '%')
                  ->orWhere('breed', 'like', '%' . $request->get('search') . '%');
            });
        }

        $listings = $query->paginate(20);
        return response()->json($listings);
    }

    public function available()
    {
        $listings = AdoptionListing::with('pet:id,name,breed,age,photo,location,bio')
            ->where('status', 'available')
            ->latest()
            ->take(12)
            ->get();

        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'description' => 'required|string|max:2000',
            'location' => 'required|string|max:255',
            'image' => 'nullable|image|max:10240',
            'requirements' => 'nullable|string|max:1000',
            'contact_info' => 'required|string|max:500',
        ]);

        $pet = Pet::findOrFail($request->pet_id);
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('adoptions', 'public');
        }

        $listing = AdoptionListing::create([
            'pet_id' => $request->pet_id,
            'user_id' => Auth::id(),
            'description' => $request->description,
            'location' => $request->location,
            'image' => $imagePath,
            'requirements' => $request->requirements,
            'contact_info' => $request->contact_info,
            'status' => 'available',
        ]);

        return response()->json($listing->load('pet'), 201);
    }

    public function show(AdoptionListing $adoptionListing)
    {
        $adoptionListing->load(['pet', 'user']);
        return response()->json($adoptionListing);
    }

    public function update(Request $request, AdoptionListing $adoptionListing)
    {
        if ($adoptionListing->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'sometimes|required|in:available,adopted,withdrawn',
            'description' => 'sometimes|required|string|max:2000',
        ]);

        $adoptionListing->update($request->only(['status', 'description']));
        return response()->json($adoptionListing->load('pet'));
    }

    public function destroy(AdoptionListing $adoptionListing)
    {
        if ($adoptionListing->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($adoptionListing->image) {
            Storage::disk('public')->delete($adoptionListing->image);
        }

        $adoptionListing->delete();
        return response()->json(['message' => 'Listing deleted successfully']);
    }
}
