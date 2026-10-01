<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

// Dedicated test worker: never connect to the application or production database.
putenv('APP_ENV=testing');
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
$database = config('database.connections.'.config('database.default').'.database');
if (! str_ends_with((string) $database, '_test')) {
    throw new RuntimeException('Concurrency workers require an isolated test database.');
}
$data = json_decode(base64_decode($argv[1]), true, 512, JSON_THROW_ON_ERROR);
$request = Request::create('/api/orders', 'POST', [], [], [], ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'HTTP_X_IDEMPOTENCY_KEY' => $data['key']], json_encode($data['payload']));
$response = $kernel->handle($request);
echo json_encode(['status' => $response->getStatusCode(), 'data' => json_decode($response->getContent(), true)]);
$kernel->terminate($request,$response);
