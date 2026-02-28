<?php
declare(strict_types=1);
/**
 * doctorates.thearchdaemon.org — Configuration Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to config.php
 * 2. Fill in your IONOS database credentials
 * 3. Generate a unique CSRF salt (any long random string)
 * 4. NEVER commit config.php to version control
 *
 * @see shared/php/db.php for PDO singleton usage
 */

return [
    'db' => [
        'host'    => 'db5019716891.hosting-data.io',  // IONOS DB host
        'name'    => 'dbu2832634',                     // Database name
        'user'    => 'dbu2832634',                     // Database user
        'pass'    => 'CHANGE_ME_IMMEDIATELY',          // Database password
        'charset' => 'utf8mb4',
    ],
    'csrf_salt' => 'GENERATE_A_LONG_RANDOM_STRING_HERE',
    'domain'    => 'doctorates.thearchdaemon.org',
    'brand'     => 'ArchDaemon',
    'admin' => [
        'enabled'  => false,  // Set true when admin panel is ready
        'password' => 'CHANGE_ME_IMMEDIATELY',
    ],
];
