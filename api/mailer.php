<?php
// /api/mailer.php — Build and send lead notification email via PHPMailer + Hostinger SMTP

/**
 * Send a lead notification email.
 *
 * @param array $clean  Validated and sanitized submission data
 *                      ['name', 'email', 'message', 'page']
 * @throws RuntimeException on SMTP failure
 */
function send_lead_email(array $clean): void {
    $config = require __DIR__ . '/config.php';

    // Map page identifier to human-readable label and subject prefix
    $pageLabels = [
        'index'              => 'General Inquiry',
        'msp'                => 'MSP Inquiry',
        'devops'             => 'DevOps Inquiry',
        'cyber-security'     => 'Security Inquiry',
        'it-support'         => 'IT Support Request',
        'staff-augmentation' => 'Staff Aug Inquiry',
        'about'              => 'General Contact',
        'ai-automation'      => 'AI Automation Inquiry',
    ];

    $pageLabel = $pageLabels[$clean['page']] ?? 'General Inquiry';
    $subject   = "[EdgeNexus Lead] {$pageLabel} — {$clean['name']}";
    $timestamp = date('Y-m-d H:i:s T');

    // ── Build email body ──────────────────────────────────────────────
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $body = str_repeat("\xE2\x94\x81", 36) . "\n"
          . "  NEW LEAD — {$pageLabel}\n"
          . str_repeat("\xE2\x94\x81", 36) . "\n\n"
          . "  NAME:     {$clean['name']}\n"
          . "  EMAIL:    {$clean['email']}\n"
          . "  PAGE:     {$pageLabel}\n"
          . "  TIME:     {$timestamp}\n"
          . "  IP:       {$ip}\n\n"
          . str_repeat("\xE2\x94\x81", 36) . "\n"
          . "  MESSAGE:\n"
          . str_repeat("\xE2\x94\x81", 36) . "\n\n"
          . "  {$clean['message']}\n\n"
          . str_repeat("\xE2\x94\x81", 36) . "\n"
          . "  EdgeNexus IT — Lead Notification System\n"
          . "  edgenexus.io\n"
          . str_repeat("\xE2\x94\x81", 36);

    // ── PHPMailer setup ──────────────────────────────────────────────
    require_once __DIR__ . '/../vendor/autoload.php';

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = $config['smtp']['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['smtp']['username'];
        $mail->Password   = $config['smtp']['password'];
        $mail->SMTPSecure = $config['smtp']['encryption'];
        $mail->Port       = $config['smtp']['port'];

        // Sender & recipient
        $mail->setFrom($config['smtp']['from'], $config['smtp']['from_name']);
        $mail->addAddress($config['recipient']['email'], $config['recipient']['name']);

        // Reply-To = lead's email (so clicking reply in the email client goes to the client)
        $mail->addReplyTo($clean['email'], $clean['name']);

        // Content
        $mail->isHTML(false);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
    } catch (\Exception $e) {
        // Wrap PHPMailer exceptions in a generic RuntimeException
        // so contact.php doesn't need to know PHPMailer internals
        throw new \RuntimeException(
            'Email send failed: ' . $e->getMessage(),
            (int) $e->getCode()
        );
    }
}
