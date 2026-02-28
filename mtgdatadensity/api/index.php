<?php
declare(strict_types=1);
/**
 * mtgdatadensity.thearchdaemon.org — API Index
 * GET api/index.php
 *
 * Returns available endpoints for this subdomain.
 * All API endpoints return JSON.
 *
 * TODO: Phase 2 — Implement domain-specific endpoints:
 *   - GET  /api/[resource].php        → list/read
 *   - POST /api/[resource].php        → create
 *   - PUT  /api/[resource].php?id=N   → update
 *   - DELETE /api/[resource].php?id=N → delete
 *
 * @see UI Policy §21 (v3.0 Forward Compatibility)
 *      Every DB-backed site exposes /api/ endpoints returning JSON.
 *      These become the API consumed by the v3.0 headless front-end.
 */

require_once __DIR__ . '/../../shared/php/response.php';

use GoldHat\Response;

Response::ok([
    'domain'   => 'mtgdatadensity.thearchdaemon.org',
    'version'  => '2.0.0',
    'endpoints' => [
        // TODO: Register endpoints as they are built
    ],
]);
