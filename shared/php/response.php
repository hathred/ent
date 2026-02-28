<?php
declare(strict_types=1);
/**
 * GoldHat Enterprise — JSON Response Helper
 * shared/php/response.php
 *
 * Usage:
 *   require_once __DIR__ . '/../../shared/php/response.php';
 *   GoldHat\Response::json(['ok' => true, 'id' => $id]);
 *   GoldHat\Response::error('Validation failed', 422);
 */

namespace GoldHat;

class Response
{
    public static function json(array $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, int $status = 400): never
    {
        self::json(['ok' => false, 'message' => $message], $status);
    }

    public static function ok(array $data = []): never
    {
        self::json(array_merge(['ok' => true], $data));
    }
}
