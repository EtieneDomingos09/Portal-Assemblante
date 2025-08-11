<?php
// Iniciar sessão se ainda não foi iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class Database {
    private $host = "localhost";
    private $database_name = "sistema_vivo"; 
    private $username = "root";
    private $password = "Senha@123";
    private $connection;

    public function getConnection() {
        if ($this->connection === null) {
            try {
                $this->connection = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->database_name . ";charset=utf8mb4",
                    $this->username,
                    $this->password,
                    array(
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                    )
                );
            } catch(PDOException $exception) {
                error_log("Erro de conexão: " . $exception->getMessage());
                throw new Exception("Erro de conexão com a base de dados");
            }
        }
        return $this->connection;
    }
}

//Funções auxiliares

// Criar instância global da conexão
try {
    $database = new Database();
    $conexao = $database->getConnection();
} catch(Exception $e) {
    error_log("Erro ao estabelecer conexão: " . $e->getMessage());
    die("Erro interno do servidor");
}

// Função para sanitizar dados
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Função para validar email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Função para verificar se usuário está logado
function isLoggedIn() {
    return isset($_SESSION['usuario_id']) && !empty($_SESSION['usuario_id']);
}

// Função para redirecionar usuários não autenticados
function requireLogin($redirect_to = '../../views/login.html') {
    if (!isLoggedIn()) {
        header("Location: $redirect_to");
        exit();
    }
}
?>