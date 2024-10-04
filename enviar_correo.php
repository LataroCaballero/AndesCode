<?php
// Importar PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Esto carga todas las dependencias instaladas, incluyendo PHPMailer

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recogiendo los datos del formulario
    $nombre = htmlspecialchars($_POST['nombre']);
    $email = htmlspecialchars($_POST['email']);
    $asunto = htmlspecialchars($_POST['asunto']);
    $mensaje = htmlspecialchars($_POST['mensaje']);

    // Crear una instancia de PHPMailer
    $mail = new PHPMailer(true);
    
    try {
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host       = 'smtp.example.com'; // Cambiar al servidor SMTP que estés usando (e.g., smtp.gmail.com)
        $mail->SMTPAuth   = true;
        $mail->Username   = 'tu_correo@example.com'; // Tu correo electrónico
        $mail->Password   = 'tu_contraseña'; // Tu contraseña de correo electrónico
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587; // Puerto de conexión SMTP (comúnmente 587 o 465)

        // Configurar el remitente y destinatarios
        $mail->setFrom('tu_correo@example.com', 'Nombre de Remitente'); // Dirección de envío del correo
        $mail->addAddress('destinatario@example.com'); // Dirección a la que se enviará el mensaje

        // Contenido del correo
        $mail->isHTML(true); // Habilitar HTML para el cuerpo del correo
        $mail->Subject = "Nuevo mensaje de contacto: $asunto";
        $mail->Body    = "<h1>Has recibido un nuevo mensaje de contacto</h1>
                          <p><strong>Nombre:</strong> $nombre</p>
                          <p><strong>Correo Electrónico:</strong> $email</p>
                          <p><strong>Asunto:</strong> $asunto</p>
                          <p><strong>Mensaje:</strong></p>
                          <p>$mensaje</p>";
        $mail->AltBody = "Nombre: $nombre\nCorreo Electrónico: $email\nAsunto: $asunto\nMensaje: $mensaje";

        // Enviar el correo
        $mail->send();
        echo "Mensaje enviado con éxito.";
    } catch (Exception $e) {
        echo "Hubo un problema al enviar el mensaje. Error: {$mail->ErrorInfo}";
    }
} else {
    echo "Acceso no autorizado.";
}
?>
