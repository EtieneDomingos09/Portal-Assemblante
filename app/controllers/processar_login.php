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
    
    // Pegar dados JSON ou form data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        // Dados JSON
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Dados JSON inválidos");
        }
    } else {
        // Dados de formulário
        $data = $_POST;
    }
    
    // Validar dados recebidos
    if (!isset($data['email']) || empty($data['email'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Email não fornecido']);
        exit;
    }
    
    if (!isset($data['senha']) || empty($data['senha'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Senha não fornecida']);
        exit;
    }
    
    $email = sanitize($data['email']);
    $senha = $data['senha'];
    $remember = isset($data['remember']) ? (bool)$data['remember'] : false;
    
    // Validar formato do email
    if (!isValidEmail($email)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Email inválido']);
        exit;
    }
    
    // Buscar usuário no banco
    $stmt = $conexao->prepare("
        SELECT usuario_id, nome, usuario, senha, email, posicao_id, estado 
        FROM usuarios 
        WHERE email = ? 
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        // Simular tempo de processamento para evitar ataques de timing
        usleep(500000); // 0.5 segundo
        echo json_encode(['sucesso' => false, 'mensagem' => 'Credenciais inválidas']);
        exit;
    }
    
    // Verificar se o usuário está ativo
    if ($usuario['estado'] != 1) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Conta inativa']);
        exit;
    }
    
    // Verificar senha
    // Se a senha estiver hasheada, use password_verify
    // Se não estiver hasheada, use comparação direta (temporário)
    $senhaValida = false;
    
    if (password_get_info($usuario['senha'])['algo']) {
        // Senha já está hasheada
        $senhaValida = password_verify($senha, $usuario['senha']);
    } else {
        // Senha ainda não está hasheada (compatibilidade temporária)
        $senhaValida = ($senha === $usuario['senha']);
        
        // Atualizar senha para versão hasheada
        if ($senhaValida) {
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            $updateStmt = $conexao->prepare("UPDATE usuarios SET senha = ? WHERE usuario_id = ?");
            $updateStmt->execute([$senhaHash, $usuario['usuario_id']]);
        }
    }
    
    if (!$senhaValida) {
        // Simular tempo de processamento
        usleep(500000);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Credenciais inválidas']);
        exit;
    }
    
    // Login bem-sucedido - criar sessão
    $_SESSION['usuario_id'] = $usuario['usuario_id'];
    $_SESSION['nome'] = $usuario['nome'];
    $_SESSION['usuario'] = $usuario['usuario'];
    $_SESSION['email'] = $usuario['email'];
    $_SESSION['posicao_id'] = $usuario['posicao_id'];
    $_SESSION['login_time'] = time();
    
    // Configurar cookie de lembrar-me
    if ($remember) {
        // Criar token único para lembrar o usuário
        $token = bin2hex(random_bytes(32));
        $expiry = time() + (30 * 24 * 60 * 60); // 30 dias
        
        // Salvar token no banco (criar uma tabela remember_tokens)
        // Por enquanto, vamos usar cookie simples
        setcookie('remember_token', $token, $expiry, '/', '', false, true);
        $_SESSION['remember_token'] = $token;
    }
    
    // Atualizar último login
    $updateLogin = $conexao->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE usuario_id = ?");
    $updateLogin->execute([$usuario['usuario_id']]);
    
    // Resposta de sucesso
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Login realizado com sucesso',
        'redirect_url' => '../../views/dashboard.html', // Ajuste conforme sua estrutura
        'usuario' => [
            'id' => $usuario['usuario_id'],
            'nome' => $usuario['nome'],
            'usuario' => $usuario['usuario'],
            'email' => $usuario['email']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro em processar_login.php: " . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno do servidor']);
}
exit;
?>