<?php
declare(strict_types=1);
/**
 * staging.goldhatconsulting.com — Admin Panel
 * admin/index.php
 *
 * Protected by .htaccess Basic Auth (see admin/.htaccess).
 * Loads data via PDO from config.php.
 *
 * TODO: Phase 0 — Build admin interface:
 *   - Dashboard with recent activity from admin_audit_log
 *   - CRUD for domain-specific tables
 *   - Export to CSV
 *   - Pagination + search
 *
 * @see UI Policy §14 (Admin Pages)
 * @see shared/php/db.php, shared/php/audit.php
 */

require_once __DIR__ . '/../../shared/php/db.php';
require_once __DIR__ . '/../../shared/php/audit.php';

use GoldHat\DB;
use GoldHat\Audit;

// Load config
$config = require __DIR__ . '/../config.php';

// Check admin is enabled
if (!($config['admin']['enabled'] ?? false)) {
    http_response_code(503);
    echo '<h1>Admin panel not yet enabled</h1>';
    echo '<p>Set admin.enabled = true in config.php when ready.</p>';
    exit;
}

$pdo = DB::get($config['db']);

// TODO: Build admin UI using Cowboy Noir components
// For now: basic data dump
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Admin | Staging Environment</title>
  <link rel="stylesheet" href="../goldhat.css"/>
</head>
<body>
  <div class="shell" style="grid-template-columns:1fr">
    <main class="main" id="main">
      <div class="container">
        <h1>Admin: Staging Environment</h1>
        <p class="kicker">Protected panel for staging.goldhatconsulting.com</p>
        <div class="callout warn">
          <p><strong>TODO:</strong> Build admin interface per UI Policy §14.</p>
        </div>
        <!-- TODO: Admin content here -->
      </div>
    </main>
  </div>
  <script src="../goldhat.js"></script>
</body>
</html>
