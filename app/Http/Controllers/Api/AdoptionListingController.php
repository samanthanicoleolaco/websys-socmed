<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdoptionListing;
use App\Models\AdoptionApplication;
use App\Models\Pet;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdoptionListingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'available']);
    }

    public function index(Request $request)
    {
        $query = AdoptionListing::with('user')
            ->where('is_available', true)
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
        $listings = AdoptionListing::with(['user', 'pet'])
            ->where('is_available', true)
            ->latest()
            ->get();

        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pet_id'       => 'nullable|exists:pets,id',
            'pet_name'     => 'required|string|max:100',
            'breed'        => 'required|string|max:100',
            'age'          => 'required|string|max:50',
            'description'  => 'required|string|max:2000',
            'location'     => 'required|string|max:255',
            'image'        => 'required|image|max:10240',
            'contact_info' => 'required|string|max:500',
            'requirements' => 'nullable|string|max:1000',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('adoptions', 'public');
        }

        $contactInfo = $request->input('contact_info');

        $listing = AdoptionListing::create([
            'user_id'      => Auth::id(),
            'pet_id'       => $request->input('pet_id'),
            'pet_name'     => $request->input('pet_name'),
            'breed'        => $request->input('breed'),
            'age'          => $request->input('age'),
            'description'  => $request->description,
            'location'     => $request->location,
            'image'        => $imagePath,
            'contact_email'=> filter_var($contactInfo, FILTER_VALIDATE_EMAIL) ? $contactInfo : Auth::user()->email,
            'contact_phone'=> !filter_var($contactInfo, FILTER_VALIDATE_EMAIL) ? $contactInfo : '',
            'is_available' => true,
        ]);

        return response()->json($listing, 201);
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
            'is_available' => 'sometimes|boolean',
            'description' => 'sometimes|required|string|max:2000',
        ]);

        $adoptionListing->update($request->only(['is_available', 'description']));
        return response()->json($adoptionListing);
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

    /**
     * POST /api/adoption-listings/{adoptionListing}/apply
     * Submit an adoption application.
     */
    public function apply(Request $request, AdoptionListing $adoptionListing)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:120',
            'email'   => 'required|email',
            'phone'   => 'required|string|max:30',
            'message' => 'required|string|max:1000',
        ]);
        $data['adoption_listing_id'] = $adoptionListing->id;
        $data['user_id'] = Auth::id();
        AdoptionApplication::create($data);

        Notification::createNotification(
            $adoptionListing->user_id,
            'adoption_application',
            'Adoption application received',
            "Someone wants to adopt {$adoptionListing->pet_name}.",
            $adoptionListing,
            ['listing_id' => $adoptionListing->id]
        );

        return response()->json(['message' => 'Application submitted!']);
    }
}
