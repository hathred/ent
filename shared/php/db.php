<?php
declare(strict_types=1);
/**
 * GoldHat Enterprise — PDO Database Singleton
 * shared/php/db.php
 *
 * Usage:
 *   require_once __DIR__ . '/../../shared/php/db.php';
 *   $pdo = GoldHat\DB::get($config['db']);
 *
 * Every site that touches the database includes this file.
 * Config comes from each site's config.php (never committed).
 */

namespace GoldHat;

class DB
{
    private static ?\PDO $instance = null;

    /**
     * Get or create the PDO singleton.
     *
     * @param array{host:string,name:string,user:string,pass:string,charset?:string} $cfg
     * @return \PDO
     */
    public static function get(array $cfg): \PDO
    {
        if (self::$instance === null) {
            $charset = $cfg['charset'] ?? 'utf8mb4';
            $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset={$charset}";
            self::$instance = new \PDO($dsn, $cfg['user'], $cfg['pass'], [
                \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE  => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES    => false,
            ]);
        }
        return self::$instance;
    }

    /** Reset the singleton (for testing). */
    public static function reset(): void
    {
        self::$instance = null;
    }
}
