<?php
// /api/rate-limiter.php — IP-based rate limiting via file storage
//
// Uses api/storage/rate-limits/ (NOT /tmp/) for compatibility with
// cPanel shared hosting where /tmp may be inaccessible or shared.
//
// NOTE: X-Forwarded-For can be spoofed by the client if there's no proxy
// in front sanitizing it. This fix solves the "everyone behind a proxy
// shares one IP" bug; it does NOT make rate limiting spoof-proof. That's
// an acceptable trade-off for this use case.

/**
 * Resolve the client IP address, accounting for reverse proxies.
 *
 * Check order:
 *   1. HTTP_CF_CONNECTING_IP  (Cloudflare)
 *   2. HTTP_X_FORWARDED_FOR   (generic proxy — first IP in chain)
 *   3. REMOTE_ADDR            (direct connection / fallback)
 *
 * Every candidate is validated with filter_var. If validation fails,
 * fall back to REMOTE_ADDR to reject spoofed headers.
 */
function get_client_ip(): string {
    // 1. Cloudflare
    $cfIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if ($cfIp !== '' && filter_var($cfIp, FILTER_VALIDATE_IP)) {
        return $cfIp;
    }

    // 2. X-Forwarded-For (take the first IP in the comma-separated list)
    $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($xff !== '') {
        $ips = explode(',', $xff);
        $first = trim($ips[0]);
        if ($first !== '' && filter_var($first, FILTER_VALIDATE_IP)) {
            return $first;
        }
    }

    // 3. Fallback
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Check if the current IP is within its rate limit.
 *
 * Rules:
 *   - Max 3 submissions per 15 minutes per IP
 *   - Storage: api/storage/rate-limits/rl_{md5(ip)}.json
 *   - Uses flock(LOCK_EX) for atomic read-check-write
 *
 * Returns true if request is allowed, false if rate limited.
 */
function check_rate_limit(): bool {
    $ip     = get_client_ip();
    $key    = md5($ip);
    $window = 900; // 15 minutes in seconds
    $max    = 3;

    // Ensure storage directory exists
    $storageDir = __DIR__ . '/storage/rate-limits';
    if (!is_dir($storageDir)) {
        if (!@mkdir($storageDir, 0755, true)) {
            // Can't create directory — fail safe (don't block traffic)
            error_log('[EdgeNexus rate-limiter] Failed to create storage directory: ' . $storageDir);
            return true;
        }
    }

    $file = $storageDir . '/rl_' . $key . '.json';

    // ── Atomic read-check-write with flock(LOCK_EX) ─────────────────
    $fh = @fopen($file, 'c+'); // 'c+' opens for RW, creates if missing, doesn't truncate
    if ($fh === false) {
        // Can't open file — fail safe (don't block traffic)
        error_log('[EdgeNexus rate-limiter] Failed to open rate-limit file: ' . $file);
        return true;
    }

    // Acquire exclusive lock
    flock($fh, LOCK_EX);

    // Read current content
    $raw = '';
    while (!feof($fh)) {
        $raw .= fread($fh, 8192);
    }

    $data = ['count' => 0, 'start' => time()];
    if ($raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $data = $decoded;
        }
    }

    // Reset window if expired
    $now = time();
    if ($now - $data['start'] > $window) {
        $data = ['count' => 0, 'start' => $now];
    }

    // Check limit
    if ($data['count'] >= $max) {
        flock($fh, LOCK_UN);
        fclose($fh);
        return false;
    }

    // Increment and write back
    $data['count']++;
    $encoded = json_encode($data);

    // Truncate and write while holding the lock
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, $encoded);
    fflush($fh);

    // Release lock and close
    flock($fh, LOCK_UN);
    fclose($fh);

    return true;
}
