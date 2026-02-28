<?php
declare(strict_types=1);
/**
 * b2b.goldhatconsulting.com — Intake API Endpoint
 * POST api/intake.php
 *
 * Accepts intake form submissions and stores them in intake_requests.
 * CSRF-verified. Honeypot-filtered. Audit-logged.
 *
 * @see shared/php/db.php, shared/php/csrf.php, shared/php/response.php
 */

require_once __DIR__ . '/../../shared/php/db.php';
require_once __DIR__ . '/../../shared/php/csrf.php';
require_once __DIR__ . '/../../shared/php/response.php';
require_once __DIR__ . '/../../shared/php/audit.php';

use GoldHat\DB;
use GoldHat\CSRF;
use GoldHat\Response;
use GoldHat\Audit;

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

$config = require __DIR__ . '/../config.php';
$pdo = DB::get($config['db']);

// Honeypot check (hidden field should be empty)
if (!empty($_POST['website'] ?? '')) {
    Response::error('Bot detected', 422);
}

// CSRF verification
$token   = $_POST['token'] ?? '';
$name    = trim($_POST['name'] ?? '');
$contact = trim($_POST['contact'] ?? '');

if (!CSRF::verify($config['csrf_salt'], $token, $name, $contact)) {
    Response::error('Invalid token. Please reload and try again.', 403);
}

// Validate required fields
if ($name === '' || $contact === '') {
    Response::error('Name and contact information are required.');
}

// Insert into database
$stmt = $pdo->prepare(
    'INSERT INTO intake_requests (name, contact, preferred_contact, service, service_details, address, city, state, zip, availability, source_domain)
     VALUES (:name, :contact, :pref, :svc, :details, :addr, :city, :state, :zip, :avail, :domain)'
);

$stmt->execute([
    ':name'    => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    ':contact' => htmlspecialchars($contact, ENT_QUOTES, 'UTF-8'),
    ':pref'    => htmlspecialchars($_POST['preferred_contact'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':svc'     => htmlspecialchars($_POST['service'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':details' => htmlspecialchars($_POST['service_details'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':addr'    => htmlspecialchars($_POST['address'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':city'    => htmlspecialchars($_POST['city'] ?? 'Bluefield', ENT_QUOTES, 'UTF-8'),
    ':state'   => htmlspecialchars($_POST['state'] ?? 'VA', ENT_QUOTES, 'UTF-8'),
    ':zip'     => htmlspecialchars($_POST['zip'] ?? '24605', ENT_QUOTES, 'UTF-8'),
    ':avail'   => htmlspecialchars($_POST['availability'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':domain'  => 'b2b.goldhatconsulting.com',
]);

$id = (int) $pdo->lastInsertId();
Audit::log($pdo, 'intake.create', 'intake_requests', $id, ['name' => $name, 'domain' => 'b2b.goldhatconsulting.com']);

Response::ok(['id' => $id]);
