<?php
/**
 * Configurações do Sistema de Recuperação de Senha
 * Assemblante - Sistema de Login
 */

// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistema_vivo');
define('DB_USER', 'root'); 
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Configurações de Email (usando PHPMailer)
define('SMTP_HOST', 'smtp.gmail.com'); // ou seu provedor SMTP
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'seu-email@gmail.com');
define('SMTP_PASSWORD', 'sua-senha-app'); // Senha de app do Gmail
define('SMTP_FROM_EMAIL', 'noreply@assemblante.com');
define('SMTP_FROM_NAME', 'Assemblante dos Reis');

// Configurações de Segurança
define('TOKEN_EXPIRY_MINUTES', 5); // Token expira em 15 minutos
define('SITE_URL', 'https://assemblante.co.ao/'); // URL do seu site
define('ENCRYPTION_KEY', 'b1a24f66c2d94fe282d957a4ad23e071'); // Chave segura


// Configurações Gerais
define('NOME_EMPRESA', 'Assemblante dos Reis');
define('SUPORT_EMAIL', 'assemblantedosreis@gmail.com');

// Classe de Conexão com Banco
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            die("Erro na conexão: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

// Funções Auxiliares
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function generateSecureToken($length = 64) {
    return bin2hex(random_bytes($length / 2));
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>