<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

try {
    include_once "../config/config.php";
    
    // Destruir todas as variáveis de sessão
    $_SESSION = array();
    
    // Destruir cookie de sessão
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Remover cookie de lembrar-me se existir
    if (isset($_COOKIE['remember_token'])) {
        setcookie('remember_token', '', time() - 42000, '/', '', false, true);
    }
    
    // Destruir sessão
    session_destroy();
    
    echo json_encode(['sucesso' => true, 'mensagem' => 'Logout realizado com sucesso']);
    
} catch (Exception $e) {
    error_log("Erro em logout.php: " . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao fazer logout']);
}
exit;