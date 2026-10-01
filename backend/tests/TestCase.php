<?php

namespace Tests;

abstract class TestCase extends \Illuminate\Foundation\Testing\TestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();
        $database = config('database.connections.'.config('database.default').'.database');
        if ($database !== ':memory:' && ! str_ends_with((string) $database, '_test')) {
            throw new \RuntimeException('Backend tests require a dedicated database ending in _test.');
        }

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/']);
    }
}
