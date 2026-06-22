<?php
// /api/validator.php — Input validation & sanitization functions

/**
 * Sanitize a string: trim, strip HTML tags, encode special chars.
 */
function sanitize_string(string $input, int $max_len): string {
    $input = trim($input);
    $input = strip_tags($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return substr($input, 0, $max_len);
}

/**
 * Validate email format (RFC 5321 compliant length).
 */
function validate_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false
        && strlen($email) <= 254;
}

/**
 * Validate name: 2–100 chars after sanitizing.
 */
function validate_name(string $name): bool {
    $clean = sanitize_string($name, 100);
    $len = mb_strlen($clean);
    return $len >= 2 && $len <= 100;
}

/**
 * Sanitize message (no length validation).
 */
function sanitize_message(string $message): string {
    return sanitize_string($message, 2000);
}

/**
 * Validate page: must be in whitelist.
 */
function validate_page(string $page): bool {
    $allowed = [
        'index',
        'msp',
        'devops',
        'cyber-security',
        'it-support',
        'staff-augmentation',
        'about',
    ];
    return in_array($page, $allowed, true);
}

/**
 * Validate full submission.
 *
 * Returns: [
 *   'valid' => bool,
 *   'errors' => ['field' => 'message', ...],
 *   'clean' => ['name' => ..., 'email' => ..., ...]
 * ]
 */
function validate_submission(array $data): array {
    $errors = [];
    $clean  = [];

    // Name
    $name = isset($data['name']) ? (string) $data['name'] : '';
    if (!validate_name($name)) {
        $errors['name'] = 'Name must be between 2 and 100 characters.';
    } else {
        $clean['name'] = sanitize_string($name, 100);
    }

    // Email
    $email = isset($data['email']) ? (string) $data['email'] : '';
    if (!validate_email($email)) {
        $errors['email'] = 'Invalid email address.';
    } else {
        $clean['email'] = $email; // already validated, use raw for Reply-To
    }

    // Message (no length validation — accepts any length)
    $message = isset($data['message']) ? (string) $data['message'] : '';
    $clean['message'] = sanitize_message($message);

    // Page
    $page = isset($data['page']) ? (string) $data['page'] : '';
    if (!validate_page($page)) {
        $errors['page'] = 'Invalid page reference.';
    } else {
        $clean['page'] = $page;
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'clean' => $clean,
    ];
}
