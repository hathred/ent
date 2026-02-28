<?php
declare(strict_types=1);
/**
 * GoldHat Enterprise — CSRF Token Verification
 * shared/php/csrf.php
 *
 * Usage:
 *   require_once __DIR__ . '/../../shared/php/csrf.php';
 *   GoldHat\CSRF::verify($salt, $_POST['token'], $_POST['name'], $_POST['contact']);
 *
 * Mirrors the client-side SHA-256 HMAC in goldhat.js _initIntakeForm.
 */

namespace GoldHat;

class CSRF
{
    /**
     * Verify a CSRF token from the intake form.
     *
     * @param string $salt   The per-site salt from config.php
     * @param string $token  The token submitted by the form
     * @param string $name   The name field value
     * @param string $contact The contact field value
     * @return bool
     */
    public static function verify(string $salt, string $token, string $name, string $contact): bool
    {
        $today = date('Y-m-d');
        $expected = hash('sha256', "{$salt}|{$today}|{$name}|{$contact}");
        return hash_equals($expected, $token);
    }
}
