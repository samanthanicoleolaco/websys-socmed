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
            ],
            [
                'name' => 'Popular Pet',
                'icon' => '⭐',
                'description' => 'Reached 100 followers',
                'category' => 'social',
            ],
            [
                'name' => 'Contest Winner',
                'icon' => '🏆',
                'description' => 'Won a weekly contest',
                'category' => 'contest',
            ],
            [
                'name' => 'Active Commenter',
                'icon' => '💬',
                'description' => 'Made 50 comments',
                'category' => 'social',
            ],
            [
                'name' => 'Photo Pro',
                'icon' => '📸',
                'description' => 'Posted 25 photos',
                'category' => 'content',
            ],
            [
                'name' => 'Helper',
                'icon' => '🤝',
                'description' => 'Helped 10 pets find homes',
                'category' => 'adoption',
            ],
            [
                'name' => 'Trick Master',
                'icon' => '🎪',
                'description' => 'Won 3 trick contests',
                'category' => 'contest',
            ],
            [
                'name' => 'Social Butterfly',
                'icon' => '🦋',
                'description' => 'Followed 50 pets',
                'category' => 'social',
            ],
            [
                'name' => 'Early Adopter',
                'icon' => '🌟',
                'description' => 'Joined in the first month',
                'category' => 'special',
            ],
            [
                'name' => 'Contest Participant',
                'icon' => '🎯',
                'description' => 'Entered 5 contests',
                'category' => 'contest',
            ],
        ];

        foreach ($badges as $badge) {
            Badge::create($badge);
        }
    }
}
