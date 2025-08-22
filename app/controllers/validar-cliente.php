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
    
    // Consultar no banco - busca por ID ou numero_cliente
    $query = "SELECT 
                id, numero_cliente, nome, email, telefone, edificio, apartamento, 
                pacote, valor_mensal, data_inscricao, termino, data_pagamento,
                mes_pago, numero_bilhete, observacao, status, onu, pppoe, fyh_actualizacao
              FROM cliente 
              WHERE id = :numero1 OR numero_cliente = :numero2 
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
                'numero_cliente' => $cliente['numero_cliente'],
                'nome' => $cliente['nome'] ?: 'Não informado',
                'email' => $cliente['email'] ?: 'Não informado',
                'telefone' => $cliente['telefone'] ? formatarTelefone($cliente['telefone']) : 'Não informado',
                'endereco' => formatarEndereco($cliente),
                'pacote' => $cliente['pacote'] ?: 'Não definido',
                'valor_mensal' => $cliente['valor_mensal'] ? 
                    number_format($cliente['valor_mensal'], 0, ',', '.') . ' Kz' : 
                    'Não definido',
                'mes_pago' => $cliente['mes_pago'] ?: 'Não definido',
                'numero_bilhete' => $cliente['numero_bilhete'] ?: 'Não informado',
                'data_inscricao' => $cliente['data_inscricao'] ? 
                    date('d/m/Y', strtotime($cliente['data_inscricao'])) : 
                    'Não informado',
                'data_pagamento' => $cliente['data_pagamento'] ? 
                    date('d/m/Y', strtotime($cliente['data_pagamento'])) : 
                    'Não informado',
                'termino' => $cliente['termino'] ? 
                    date('d/m/Y', strtotime($cliente['termino'])) : 
                    'Não informado',
                'status_bd' => $cliente['status'] ?: 'toogle_on',
                'status_calculado' => determinarStatus($cliente),
                'onu' => $cliente['onu'] ?: 'Não informado',
                'pppoe' => $cliente['pppoe'] ?: 'Não informado',
                'observacao' => $cliente['observacao'] ?: 'Nenhuma observação',
                'ultima_atualizacao' => $cliente['fyh_actualizacao'] ? 
                    date('d/m/Y H:i:s', strtotime($cliente['fyh_actualizacao'])) : 
                    'Não informado'
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
 * Determinar status do cliente baseado nos dados
 */
function determinarStatus($cliente) {
    $hoje = new DateTime();
    
    // Verificar se o status do banco indica inativo
    if ($cliente['status'] && strtolower($cliente['status']) === 'toogle_off') {
        return ['status' => 'inativo', 'classe' => 'status-inativo', 'texto' => 'Cliente Inativo'];
    }
    
    // Verificar se o plano expirou
    if ($cliente['termino']) {
        $termino = new DateTime($cliente['termino']);
        if ($termino < $hoje) {
            return ['status' => 'expirado', 'classe' => 'status-expirado', 'texto' => 'Plano Expirado'];
        }
    }
    
    // Verificar pagamento baseado no mês pago
    if ($cliente['mes_pago']) {
        $mesAtual = date('F');
        $mesesPortugues = [
            'January' => 'Janeiro', 'February' => 'Fevereiro', 'March' => 'Março',
            'April' => 'Abril', 'May' => 'Maio', 'June' => 'Junho',
            'July' => 'Julho', 'August' => 'Agosto', 'September' => 'Setembro',
            'October' => 'Outubro', 'November' => 'Novembro', 'December' => 'Dezembro'
        ];
        
        $mesAtualPortugues = $mesesPortugues[$mesAtual] ?? $mesAtual;
        
        // Verificar se o mês atual está incluído nos meses pagos
        if (strpos(strtolower($cliente['mes_pago']), strtolower($mesAtualPortugues)) !== false) {
            return ['status' => 'ativo', 'classe' => 'status-ativo', 'texto' => 'Em Dia'];
        } else {
            return ['status' => 'pendente', 'classe' => 'status-pendente', 'texto' => 'Pagamento Pendente'];
        }
    }
    
    // Verificar se há data de pagamento recente (últimos 30 dias)
    if ($cliente['data_pagamento']) {
        $dataPagamento = new DateTime($cliente['data_pagamento']);
        $diferenca = $hoje->diff($dataPagamento);
        
        if ($diferenca->days <= 30 && $diferenca->invert == 0) {
            return ['status' => 'ativo', 'classe' => 'status-ativo', 'texto' => 'Recém Pago'];
        }
    }
    
    // Status padrão baseado no status do banco
    if ($cliente['status'] === 'toogle_on') {
        return ['status' => 'ativo', 'classe' => 'status-ativo', 'texto' => 'Ativo'];
    }
    
    return ['status' => 'indefinido', 'classe' => 'status-indefinido', 'texto' => 'Status Indefinido'];
}
?>