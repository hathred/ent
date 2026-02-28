<?php
declare(strict_types=1);
/**
 * catgod.thearchdaemon.org — Analysis API
 * api/analysis.php
 *
 * GET — Retrieve analysis results
 *        ?type=density       Filter by analysis type
 *        ?type=frobenius     Tensor decomposition results
 *        ?type=curve         Mana curve analysis
 *        ?type=synergy       Card synergy mapping
 *
 * POST — Store a new analysis run (admin only)
 *
 * Shared across: catgod, catgod-density, catgodstats, mtgdatadensity
 * Each subdomain queries the same catgod_analysis table with different type filters.
 *
 * TODO: Phase 2 Builds #11-15
 *   - catgod:          type = 'overview', 'curve', 'roles'
 *   - catgod-density:  type = 'density', 'frobenius'
 *   - catgodstats:     type = 'winrate', 'matchup', 'curve'
 *   - mtgdatadensity:  type = 'tensor', 'frobenius', 'decomposition'
 *
 * @see db_schema.sql: catgod_analysis
 */

require_once __DIR__ . '/../../shared/php/db.php';
require_once __DIR__ . '/../../shared/php/response.php';

use GoldHat\DB;
use GoldHat\Response;

$config = require __DIR__ . '/../config.php';
$pdo = DB::get($config['db']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = isset($_GET['type']) ? trim($_GET['type']) : null;
    // TODO: SELECT from catgod_analysis WHERE analysis_type = :type
    Response::ok([
        'analysis' => [],
        'type'     => $type,
        'message'  => 'Analysis API — not yet implemented. Phase 2.',
    ]);
} else {
    Response::error('Method not allowed', 405);
}
