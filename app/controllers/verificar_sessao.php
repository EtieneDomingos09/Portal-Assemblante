<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

try {
    include_once "../config/config.php";
    
    $logado = isLoggedIn();
    
    if ($logado) {
        echo json_encode([
            'logado' => true,
            'usuario' => [
                'id' => $_SESSION['usuario_id'],
                'nome' => $_SESSION['nome'],
                'email' => $_SESSION['email']
            ]
        ]);
    } else {
        echo json_encode(['logado' => false]);
    }
    
} catch (Exception $e) {
    error_log("Erro em verificar_sessao.php: " . $e->getMessage());
    echo json_encode(['logado' => false, 'erro' => 'Erro interno']);
}
exit;