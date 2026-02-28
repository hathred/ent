<?php
declare(strict_types=1);
/**
 * pc-vs-iot.goldhatconsulting.com — Arena Contenders API
 * api/contenders.php
 *
 * GET  — List all contenders (or filter by ?active=1)
 * POST — Add a new contender (admin only)
 *
 * TODO: Phase 1 Build #9
 *   - Migrate existing hardcoded contender data to arena_contenders table
 *   - Include specs JSON (CPU, RAM, storage, connectivity)
 *   - Include strengths/risks JSON for the arena display
 *   - PUT for editing contender profiles
 *
 * @see db_schema.sql: arena_contenders
 */

require_once __DIR__ . '/../../shared/php/db.php';
require_once __DIR__ . '/../../shared/php/response.php';

use GoldHat\DB;
use GoldHat\Response;

$config = require __DIR__ . '/../config.php';
$pdo = DB::get($config['db']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // TODO: SELECT from arena_contenders, optionally WHERE is_active = 1
    Response::ok([
        'contenders' => [],
        'message'    => 'Contenders API — not yet implemented. Phase 1, Build #9.',
    ]);
} else {
    Response::error('Method not allowed', 405);
}
