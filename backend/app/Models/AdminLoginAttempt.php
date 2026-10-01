<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class AdminLoginAttempt extends Model
{
    use HasStringId;

    protected $table = 'admin_login_attempts';

    protected $guarded = [];

    protected $attributes = ['successful' => false];

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['successful' => 'boolean', 'created_at' => 'datetime'];
    }
}
