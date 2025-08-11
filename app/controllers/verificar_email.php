<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Só aceitar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

try {
    include_once "../config/config.php";
    
    // Verificar se a conexão existe
    if (!isset($conexao)) {
        throw new Exception("Conexão com banco não estabelecida");
    }
    
    // Pegar dados JSON
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Dados JSON inválidos");
    }
    
    if (!isset($data['email']) || empty($data['email'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Email não fornecido']);
        exit;
    }
    
    $email = sanitize($data['email']);
    
    // Validar formato do email
    if (!isValidEmail($email)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Email inválido']);
        exit;
    }
    
    // Consultar banco usando PDO
    $stmt = $conexao->prepare("SELECT usuario_id, nome, estado FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
    
    if ($usuario) {
        // Verificar se o usuário está ativo
        if ($usuario['estado'] != 1) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Conta inativa']);
            exit;
        }
        
        echo json_encode([
            'sucesso' => true, 
            'mensagem' => 'Email encontrado',
            'nome' => $usuario['nome']
        ]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Email não encontrado']);
    }
    
} catch (Exception $e) {
    error_log("Erro em verificar_email.php: " . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno do servidor']);
}
exit;
?>