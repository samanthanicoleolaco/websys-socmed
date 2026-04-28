<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Sample badges for gamification
        $badges = [
            [
                'name' => 'First Post',
                'icon' => '📝',
                'description' => 'Created your first post',
                'category' => 'social',
                'rarity' => 'Common',
                'gradient' => 'bg-gradient-orange',
            ],
            [
                'name' => 'Popular Pet',
                'icon' => '⭐',
                'description' => 'Reached 100 followers',
                'category' => 'social',
                'rarity' => 'Rare',
                'gradient' => 'bg-gradient-pink',
            ],
            [
                'name' => 'Contest Winner',
                'icon' => '🏆',
                'description' => 'Won a weekly contest',
                'category' => 'contest',
                'rarity' => 'Epic',
                'gradient' => 'bg-gradient-purple',
            ],
            [
                'name' => 'Active Commenter',
                'icon' => '💬',
                'description' => 'Made 50 comments',
                'category' => 'social',
                'rarity' => 'Common',
                'gradient' => 'bg-gradient-orange',
            ],
            [
                'name' => 'Photo Pro',
                'icon' => '📸',
                'description' => 'Posted 25 photos',
                'category' => 'content',
                'rarity' => 'Rare',
                'gradient' => 'bg-gradient-pink',
            ],
            [
                'name' => 'Helper',
                'icon' => '🤝',
                'description' => 'Helped 10 pets find homes',
                'category' => 'adoption',
                'rarity' => 'Rare',
                'gradient' => 'bg-gradient-blue',
            ],
            [
                'name' => 'Trick Master',
                'icon' => '🎪',
                'description' => 'Won 3 trick contests',
                'category' => 'contest',
                'rarity' => 'Epic',
                'gradient' => 'bg-gradient-purple',
            ],
            [
                'name' => 'Social Butterfly',
                'icon' => '🦋',
                'description' => 'Followed 50 pets',
                'category' => 'social',
                'rarity' => 'Common',
                'gradient' => 'bg-gradient-orange',
            ],
            [
                'name' => 'Early Adopter',
                'icon' => '🌟',
                'description' => 'Joined in the first month',
                'category' => 'special',
                'rarity' => 'Legendary',
                'gradient' => 'bg-gradient-gold',
            ],
            [
                'name' => 'Contest Participant',
                'icon' => '🎯',
                'description' => 'Entered 5 contests',
                'category' => 'contest',
                'rarity' => 'Common',
                'gradient' => 'bg-gradient-orange',
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['name' => $badge['name']],
                $badge
            );
        }

        Badge::whereNull('rarity')->orWhere('rarity', '')->update([
            'rarity' => 'Common',
            'gradient' => 'bg-gradient-orange',
        ]);
    }
}
