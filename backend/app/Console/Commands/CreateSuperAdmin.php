<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdmin extends Command
{
    protected $signature = 'hawa:admin-create {username?}';

    protected $description = 'Create or reset the initial Hawa super admin account';

    public function handle(): int
    {
        $username = $this->argument('username') ?: $this->ask('Admin username');
        if (! is_string($username) || trim($username) === '') {
            $this->error('A username is required.');

            return self::FAILURE;
        }

        $password = $this->secret('Admin password');
        if (! is_string($password) || mb_strlen($password) < 12) {
            $this->error('Use a password with at least 12 characters.');

            return self::FAILURE;
        }

        $user = User::withoutGlobalScope('active_records')->updateOrCreate(
            ['username' => mb_strtolower(trim($username))],
            ['password' => Hash::make($password), 'role' => 'SUPER_ADMIN', 'disabled_at' => null, 'archived_at' => null],
        );

        $this->info("Super admin {$user->username} is ready.");

        return self::SUCCESS;
    }
}
