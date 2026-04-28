<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessagesAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_my_conversations_request_is_unauthorized(): void
    {
        $this->getJson('/api/my-conversations')
            ->assertUnauthorized();
    }
}
