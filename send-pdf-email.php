<?php
// Check if a file was uploaded
if (isset($_FILES['pdf_file']) && isset($_POST['E-Mail'])) {
    $pdfFile = $_FILES['pdf_file'];
    $recipientEmail = filter_var($_POST['E-Mail'], FILTER_VALIDATE_EMAIL);
    
    if (!$recipientEmail) {
        echo 'Invalid email address.';
        exit;
    }

    // Email subject and message
    $subject = 'AVGS Form Submission';
    $message = 'Please find the attached PDF file of the AVGS form submission.';

    // Email headers
    $headers = "From: shariah-invest@Shariah-Invest.eu\r\n";
    $headers .= "Reply-To: office@Shariah-Invest.eu\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"boundary\"\r\n";

    // Email body
    $body = "--boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $message . "\r\n";
    $body .= "--boundary\r\n";
    $body .= "Content-Type: application/pdf; name=\"AVGS_Form_Submission.pdf\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"form_submission.pdf\"\r\n\r\n";
    $body .= chunk_split(base64_encode(file_get_contents($pdfFile['tmp_name']))) . "\r\n";
    $body .= "--boundary--";

    // Send email
    if (mail($recipientEmail, $subject, $body, $headers)) {
        echo 'Email sent successfully.';
    } else {
        echo 'Failed to send email.';
    }
} else {
    echo 'No file or email provided.';
}
?>