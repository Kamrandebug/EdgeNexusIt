<?php
// /api/contact.php — Main entry point for EdgeNexus IT contact form submissions

// ── Allow longer execution for slow SMTP handshakes ──────────────────
// Hostinger SMTP can be slow from some networks; 60s prevents timeouts.
if (function_exists('set_time_limit')) {
    set_time_limit(60);
}

// ── Error reporting: log everything, display nothing ─────────────────────
// These must run before anything else to prevent information leaks
// regardless of php.ini settings.
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/storage/php_errors.log');

require_once __DIR__ . '/validator.php';
require_once __DIR__ . '/rate-limiter.php';
require_once __DIR__ . '/mailer.php';

// ── CORS & Content-Type headers ──────────────────────────────────────────
$allowedOrigins = [
    'https://edgenexus.io',
    'https://www.edgenexus.io',
    'http://localhost',
    'http://localhost:80',
    // REMOVE BEFORE PRODUCTION DEPLOY: localhost entries above
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Session cookie security (before any session_start() call) ──────────
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => !empty($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Strict',
]);

// ── GET: CSRF token ─────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'token') {
    session_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    echo json_encode(['token' => $_SESSION['csrf_token']]);
    exit;
}

// ── POST: Form submission ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'method_not_allowed', 'message' => 'Only POST allowed.']);
    exit;
}

// Verify Content-Type
if (empty($_SERVER['CONTENT_TYPE']) || stripos($_SERVER['CONTENT_TYPE'], 'application/json') === false) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'invalid_content_type', 'message' => 'Content-Type must be application/json.']);
    exit;
}

// Decode JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'invalid_json', 'message' => 'Malformed JSON body.']);
    exit;
}

session_start();

// ── Rate limiting ───────────────────────────────────────────────────────
if (!check_rate_limit()) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'error' => 'rate_limited',
        'message' => 'Too many requests. Please wait 15 minutes.'
    ]);
    exit;
}

// ── Honeypot check (silent pass — don't alert the bot) ────────────────
if (!empty($data['_honey'])) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Lead received successfully.']);
    exit;
}

// ── CSRF verification ──────────────────────────────────────────────────
if (empty($data['_token']) || empty($_SESSION['csrf_token']) ||
    !hash_equals($_SESSION['csrf_token'], $data['_token'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'invalid_token',
        'message' => 'Security token mismatch.'
    ]);
    exit;
}

// ── Validation ──────────────────────────────────────────────────────────
$validation = validate_submission($data);

if (!$validation['valid']) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'error' => 'validation_failed',
        'fields' => $validation['errors']
    ]);
    exit;
}

// ── Send email ──────────────────────────────────────────────────────────
try {
    send_lead_email($validation['clean']);
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Lead received successfully.']);
} catch (\Exception $e) {
    // Log to storage (not /tmp/)
    $logDir = __DIR__ . '/storage';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }

    // 1. Error log (technical)
    $logFile = $logDir . '/mail_errors.log';
    $logLine = '[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . PHP_EOL;
    @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

    // 2. Failed-lead persistence (manual-recovery safety net)
    //    Appends lead data as JSON so the site owner can manually follow up.
    $failedFile = $logDir . '/failed_leads.log';
    $failedLead = json_encode([
        'failed_at' => date('Y-m-d H:i:s'),
        'name'      => $validation['clean']['name'],
        'email'     => $validation['clean']['email'],
        'message'   => $validation['clean']['message'],
        'page'      => $validation['clean']['page'],
        'error'     => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE) . PHP_EOL;
    @file_put_contents($failedFile, $failedLead, FILE_APPEND | LOCK_EX);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'server_error',
        'message' => 'Could not send message. Please try again later.'
    ]);
}
