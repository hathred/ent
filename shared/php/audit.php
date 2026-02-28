<?php
declare(strict_types=1);
/**
 * GoldHat Enterprise — Audit Log Helper
 * shared/php/audit.php
 *
 * Usage:
 *   require_once __DIR__ . '/../../shared/php/audit.php';
 *   GoldHat\Audit::log($pdo, 'intake.create', 'intake_requests', $id, ['name' => $name]);
 */

namespace GoldHat;

class Audit
{
    public static function log(
        \PDO $pdo,
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?array $details = null,
        ?int $userId = null
    ): void {
        $ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
        $stmt = $pdo->prepare(
            'INSERT INTO admin_audit_log (user_id, action, target_type, target_id, details, ip_hash)
             VALUES (:uid, :action, :ttype, :tid, :details, :ip)'
        );
        $stmt->execute([
            ':uid'     => $userId,
            ':action'  => $action,
            ':ttype'   => $targetType,
            ':tid'     => $targetId,
            ':details' => $details ? json_encode($details) : null,
            ':ip'      => $ipHash,
        ]);
    }
}
