<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);
    
    $recaptcha_secret = '6Ldfaz0qAAAAADd2IEkqA73z4xIzUdfETtdTQY-t'; // Your reCAPTCHA v3 secret key
    $recaptcha_response = $_POST['g-recaptcha-response'];

    // Make a request to the Google reCAPTCHA API
    $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$recaptcha_secret&response=$recaptcha_response");
    $responseKeys = json_decode($response, true);

    // Check if reCAPTCHA is valid
    if ($responseKeys["success"] && $responseKeys["score"] >= 0.5) {
        // Set the recipient email address.
        $recipient = "guarnergonzalo@gmail.com"; // Update with your email

        // Set the email subject.
        $subject = "New portfolio contact from $name";

        // Build the email content.
        $email_content = "Name: $name\n";
        $email_content .= "Email: $email\n\n";
        $email_content .= "Message:\n$message\n";

        // Build the email headers.
        $email_headers = "From: $name <$email>";

        // Send the email.
        if (mail($recipient, $subject, $email_content, $email_headers)) {
            // Redirect to the 'thank-you' page.
            header("Location: thank-you.html");
        } else {
            // Redirect to the 'error' page.
            header("Location: error.html");
        }
    } else {
        // CAPTCHA validation failed, handle the error
        header("Location: captcha-failed.html");
    }
}
?>
