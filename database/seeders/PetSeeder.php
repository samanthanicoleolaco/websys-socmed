<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pet;
use App\Models\User;

class PetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get users to assign pets to
        $users = User::all();
        
        // Sample pet data
        $pets = [
            [
                'name' => 'Max',
                'age' => 3,
                'breed' => 'Golden Retriever',
                'photo' => 'pets/max.jpg',
                'bio' => 'Friendly and energetic golden who loves playing fetch!',
            ],
            [
                'name' => 'Luna',
                'age' => 2,
                'breed' => 'Siamese Cat',
                'photo' => 'pets/luna.jpg',
                'bio' => 'Elegant and curious Siamese cat who loves to explore.',
            ],
            [
                'name' => 'Charlie',
                'age' => 5,
                'breed' => 'Beagle',
                'photo' => 'pets/charlie.jpg',
                'bio' => 'Adventurous beagle with a great sense of smell!',
            ],
            [
                'name' => 'Bella',
                'age' => 1,
                'breed' => 'Persian Cat',
                'photo' => 'pets/bella.jpg',
                'bio' => 'Fluffy Persian kitten who loves cuddles.',
            ],
            [
                'name' => 'Rocky',
                'age' => 4,
                'breed' => 'German Shepherd',
                'photo' => 'pets/rocky.jpg',
                'bio' => 'Loyal and intelligent German Shepherd.',
            ],
            [
                'name' => 'Milo',
                'age' => 2,
                'breed' => 'French Bulldog',
                'photo' => 'pets/milo.jpg',
                'bio' => 'Playful French bulldog who loves snuggling.',
            ],
            [
                'name' => 'Lucy',
                'age' => 3,
                'breed' => 'Maine Coon',
                'photo' => 'pets/lucy.jpg',
                'bio' => 'Gentle giant Maine Coon with a sweet personality.',
            ],
            [
                'name' => 'Cooper',
                'age' => 6,
                'breed' => 'Labrador Retriever',
                'photo' => 'pets/cooper.jpg',
                'bio' => 'Friendly lab who loves swimming and retrieving.',
            ],
        ];

        // Assign pets to users
        foreach ($pets as $index => $petData) {
            $user = $users[$index % $users->count()];
            $user->pets()->create($petData);
        }
    }
}
