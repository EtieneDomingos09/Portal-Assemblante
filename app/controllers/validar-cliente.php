<?php
/**
 * API para Validar Cliente por Número
 * Retorna dados completos do cliente se encontrado
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

try {
    // Configuração do banco
    require_once '../config/config.php';
    
    // Verificar conexão
    if (!isset($conexao)) {
        $database = new Database();
        $conexao = $database->getConnection();
    }
    
    // Obter dados da requisição
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar entrada
    if (!$input || !isset($input['numero_cliente'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Número do cliente é obrigatório'
        ]);
        exit();
    }
    
    $numeroCliente = trim($input['numero_cliente']);
    
    // Verificar se não está vazio
    if (empty($numeroCliente)) {
        echo json_encode([
            'success' => false,
            'message' => 'Número do cliente não pode estar vazio'
        ]);
        exit();
    }
    
    // Consultar no banco - busca por ID ou codigo_cliente
    $query = "SELECT 
                id, nome_completo, email, telefone, edificio, apartamento, 
                pacote, valor_mensalidade, data_inscricao, termino, 
                mes_pagamento, numero_bilhete, observacao
              FROM cliente 
              WHERE id = :numero1 OR codigo_cliente = :numero2 
              LIMIT 1";
    
    $stmt = $conexao->prepare($query);
    $stmt->bindParam(':numero1', $numeroCliente);
    $stmt->bindParam(':numero2', $numeroCliente);
    $stmt->execute();
    
    $cliente = $stmt->fetch();
    
    if ($cliente) {
        // Cliente encontrado - retornar todos os dados necessários
        echo json_encode([
            'success' => true,
            'message' => 'Cliente encontrado com sucesso',
            'data' => [
                'id' => $cliente['id'],
                'nome' => $cliente['nome_completo'] ?: 'Não informado',
                'email' => $cliente['email'] ?: 'Não informado',
                'telefone' => $cliente['telefone'] ? formatarTelefone($cliente['telefone']) : 'Não informado',
                'endereco' => formatarEndereco($cliente),
                'pacote' => $cliente['pacote'] ?: 'Não definido',
                'valor_mensalidade' => $cliente['valor_mensalidade'] ? 
                    number_format($cliente['valor_mensalidade'], 0, ',', '.') . ' Kz' : 
                    'Não definido',
                'mes_pagamento' => $cliente['mes_pagamento'] ?: 'Não definido',
                'numero_bilhete' => $cliente['numero_bilhete'] ?: 'Não informado',
                'data_inscricao' => $cliente['data_inscricao'] ? 
                    date('d/m/Y', strtotime($cliente['data_inscricao'])) : 
                    'Não informado',
                'status' => determinarStatus($cliente)
            ]
        ]);
    } else {
        // Cliente não encontrado
        echo json_encode([
            'success' => false,
            'message' => 'Número de cliente não encontrado'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Erro na validação do cliente: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
} catch (Exception $e) {
    error_log("Erro geral na API: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}

/**
 * Formatar número de telefone
 */
function formatarTelefone($telefone) {
    $telefone = preg_replace('/\D/', '', $telefone);
    
    if (substr($telefone, 0, 3) === '244' && strlen($telefone) >= 12) {
        return '+244 ' . substr($telefone, 3, 3) . ' ' . substr($telefone, 6, 3) . ' ' . substr($telefone, 9);
    }
    
    if (strlen($telefone) === 9) {
        return '+244 ' . substr($telefone, 0, 3) . ' ' . substr($telefone, 3, 3) . ' ' . substr($telefone, 6);
    }
    
    return $telefone;
}

/**
 * Formatar endereço do cliente
 */
function formatarEndereco($cliente) {
    $endereco = '';
    if ($cliente['edificio'] && $cliente['apartamento']) {
        // Verificar se 'edificio' já contém a palavra "Edifício"
        $edificio = $cliente['edificio'];
        if (stripos($edificio, 'edifício') === false) {
            $edificio = "Edifício " . $edificio;
        }
        $endereco = $edificio . ", Apt. " . $cliente['apartamento'];
    } elseif ($cliente['edificio']) {
        $edificio = $cliente['edificio'];
        if (stripos($edificio, 'edifício') === false) {
            $edificio = "Edifício " . $edificio;
        }
        $endereco = $edificio;
    } elseif ($cliente['apartamento']) {
        $endereco = "Apt. " . $cliente['apartamento'];
    }
    
    return $endereco ?: 'Não informado';
}

/**
 * Determinar status do cliente
 */
function determinarStatus($cliente) {
    $hoje = new DateTime();
    
    if ($cliente['termino']) {
        $termino = new DateTime($cliente['termino']);
        if ($termino < $hoje) {
            return ['status' => 'inativo', 'classe' => 'status-inativo', 'texto' => 'Plano Expirado'];
        }
    }
    
    if ($cliente['mes_pagamento']) {
        $mesAtual = date('F');
        $mesesPortugues = [
            'January' => 'Janeiro', 'February' => 'Fevereiro', 'March' => 'Março',
            'April' => 'Abril', 'May' => 'Maio', 'June' => 'Junho',
            'July' => 'Julho', 'August' => 'Agosto', 'September' => 'Setembro',
            'October' => 'Outubro', 'November' => 'Novembro', 'December' => 'Dezembro'
        ];
        
        $mesAtualPortugues = $mesesPortugues[$mesAtual] ?? $mesAtual;
        
        if (strpos($cliente['mes_pagamento'], $mesAtualPortugues) !== false) {
            return ['status' => 'ativo', 'classe' => 'status-ativo', 'texto' => 'Em Dia'];
        } else {
            return ['status' => 'pendente', 'classe' => 'status-pendente', 'texto' => 'Pagamento Pendente'];
        }
    }
    
    return ['status' => 'ativo', 'classe' => 'status-ativo', 'texto' => 'Ativo'];
}
?>