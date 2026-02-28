<?php
declare(strict_types=1);
/**
 * pc-vs-iot.goldhatconsulting.com — Arena Scores API
 * api/scores.php
 *
 * GET  — Returns all scores (optionally filtered by round_id or contender_id)
 * POST — Record a new score (admin only)
 *
 * Query params:
 *   ?round_id=N       Filter by round
 *   ?contender_id=N   Filter by contender
 *   ?axis=throughput   Filter by scoring axis
 *
 * TODO: Phase 1 Build #9
 *   - Wire to arena_scores, arena_rounds, arena_contenders tables
 *   - Add PUT for score corrections
 *   - Add aggregate endpoints (leaderboard, per-round summary)
 *   - Tensor math scoring integration from existing arena JS
 *
 * @see UI Policy §18, Phase 1 #9
 * @see db_schema.sql: arena_contenders, arena_rounds, arena_scores
 */

require_once __DIR__ . '/../../shared/php/db.php';
require_once __DIR__ . '/../../shared/php/response.php';
require_once __DIR__ . '/../../shared/php/audit.php';

use GoldHat\DB;
use GoldHat\Response;
use GoldHat\Audit;

$config = require __DIR__ . '/../config.php';
$pdo = DB::get($config['db']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // TODO: Build query with optional filters
    // $roundId     = isset($_GET['round_id']) ? (int)$_GET['round_id'] : null;
    // $contenderId = isset($_GET['contender_id']) ? (int)$_GET['contender_id'] : null;
    // $axis        = isset($_GET['axis']) ? trim($_GET['axis']) : null;

    Response::ok([
        'scores'  => [],  // TODO: query arena_scores with JOINs
        'message' => 'Arena scores API — not yet implemented. Phase 1, Build #9.',
    ]);

} elseif ($method === 'POST') {
    // TODO: Validate admin auth, accept score payload, insert into arena_scores
    // Required fields: round_id, contender_id, axis, score
    // Optional: notes

    Response::error('Score recording not yet implemented.', 501);

} else {
    Response::error('Method not allowed', 405);
}
