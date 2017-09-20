<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST))
    $_POST = json_decode(file_get_contents('php://input'), true);
if(isset($_POST["email"]) && isset($_POST["msg"])){
    $contactForm = extract($_POST);

    date_default_timezone_set("CST6CDT");
    ini_set('SMTP','smtpout.secureserver.net');
    ini_set('smtp_port',25);

    $time = date("d-m-Y h:i:s A");
    $sitio = "afich.org";
    $emailF = "info@afich.org";
    
    $message = "Contacto desde sitio {$sitio} - {$time} <br>"
    . "Nombre: {$name} <br>"
    . "Email: {$email} <br>"
    . "Teléfono: {$phone} <br>"
    . "Mensaje: {$msg}";
    
    
    $headers = "From: {$email}".PHP_EOL;
    $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
    
    $mail = mail($emailF, "{$email} contacto desde {$sitio}", $message, $headers);
    if($mail){
        echo 1;
    } else {
        var_dump($mail);
    }
}