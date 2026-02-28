<?php
declare(strict_types=1);
/**
 * catgod.thearchdaemon.org — Cards API
 * api/cards.php
 *
 * GET  — List all cards in the Guenhwyvar deck
 *         ?type=creature    Filter by card type
 *         ?role=removal     Filter by role (from roles JSON)
 *         ?cmc_min=3        Filter by converted mana cost
 *         ?cmc_max=5
 * POST — Add/update a card (admin only)
 *
 * Shared across: catgod, catgod-density, catgodclaws, catgodstats
 * All four subdomains read from the same catgod_cards table.
 *
 * TODO: Phase 2 Build #11-14
 *   - Migrate existing deck data to catgod_cards table
 *   - Support bulk import from CSV/JSON
 *   - Tags and roles as JSON columns for flexible querying
 *   - Synergy mapping for catgodclaws
 *
 * @see db_schema.sql: catgod_cards
 */

require_once __DIR__ . '/../../shared/php/db.php';
require_once __DIR__ . '/../../shared/php/response.php';

use GoldHat\DB;
use GoldHat\Response;

$config = require __DIR__ . '/../config.php';
$pdo = DB::get($config['db']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // TODO: Build query with optional filters
    // JSON_CONTAINS(roles, '"removal"') for role filtering
    Response::ok([
        'cards'   => [],
        'message' => 'Cards API — not yet implemented. Phase 2, Build #11.',
    ]);
} else {
    Response::error('Method not allowed', 405);
}
