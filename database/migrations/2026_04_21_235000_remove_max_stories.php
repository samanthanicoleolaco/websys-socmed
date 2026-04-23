<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class RemoveMaxStories extends Migration
{
    public function up()
    {
        $maxUserIds = DB::table('pets')
            ->where('name', 'Max')
            ->pluck('user_id');

        if ($maxUserIds->isNotEmpty()) {
            DB::table('stories')
                ->whereIn('user_id', $maxUserIds)
                ->delete();
        }
    }

    public function down()
    {
        // No rollback needed for data deletion
    }
}
