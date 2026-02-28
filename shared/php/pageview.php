<?php
declare(strict_types=1);
/**
 * GoldHat Enterprise — Page View Tracker
 * shared/php/pageview.php
 *
 * Usage (at top of any PHP page):
 *   require_once __DIR__ . '/../../shared/php/pageview.php';
 *   GoldHat\PageView::record($pdo, 'goldhatconsulting.com');
 *
 * Records: domain, URL, referrer, hashed IP, user agent.
 * No cookies. No tracking scripts. Server-side only.
 */

namespace GoldHat;

class PageView
{
    public static function record(\PDO $pdo, string $domain): void
    {
        try {
            $stmt = $pdo->prepare(
                'INSERT INTO page_views (domain, page_url, referrer, ip_hash, user_agent)
                 VALUES (:domain, :url, :ref, :ip, :ua)'
            );
            $stmt->execute([
                ':domain' => $domain,
                ':url'    => $_SERVER['REQUEST_URI'] ?? '/',
                ':ref'    => $_SERVER['HTTP_REFERER'] ?? null,
                ':ip'     => hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'),
                ':ua'     => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
            ]);
        } catch (\PDOException $e) {
            // Silently fail — analytics should never break the page
            error_log('[GoldHat] PageView error: ' . $e->getMessage());
        }
    }
}
