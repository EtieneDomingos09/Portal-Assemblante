-- ====================================
-- MIGRAÇÃO MYSQL - TABELA: cliente
-- Formato: 001, 002, 003...
-- ====================================

-- PASSO 1: FAZER BACKUP DA TABELA
CREATE TABLE cliente_backup AS SELECT * FROM cliente;

-- PASSO 2: ADICIONAR A COLUNA numero_cliente
ALTER TABLE cliente ADD COLUMN numero_cliente VARCHAR(10) UNIQUE AFTER id;

-- PASSO 3: CRIAR ÍNDICE PARA PERFORMANCE
CREATE INDEX idx_numero_cliente ON cliente(numero_cliente);

-- PASSO 4: ATUALIZAR OS 79 REGISTROS EXISTENTES
-- Numeração sequencial com 3 dígitos (001, 002, 003...)
SET @row_number = 0;
UPDATE cliente 
SET numero_cliente = LPAD((@row_number := @row_number + 1), 3, '0')
ORDER BY id;

-- PASSO 5: TORNAR A COLUNA NOT NULL (após popular)
ALTER TABLE cliente MODIFY numero_cliente VARCHAR(10) NOT NULL UNIQUE;

-- ====================================
-- SISTEMA AUTOMÁTICO PARA NOVOS CLIENTES
-- ====================================

-- PASSO 6: CRIAR TRIGGER PARA NOVOS REGISTROS
DELIMITER //
CREATE TRIGGER auto_numero_cliente 
BEFORE INSERT ON cliente
FOR EACH ROW
BEGIN
    IF NEW.numero_cliente IS NULL OR NEW.numero_cliente = '' THEN
        SET NEW.numero_cliente = (
            SELECT LPAD(
                COALESCE(MAX(CAST(numero_cliente AS UNSIGNED)), 0) + 1, 
                3, '0'
            )
            FROM cliente
        );
    END IF;
END //
DELIMITER ;

-- ====================================
-- VERIFICAÇÕES DE QUALIDADE
-- ====================================

-- VERIFICAÇÃO 1: Contar total vs únicos (devem ser iguais)
SELECT 
    COUNT(*) as total_clientes,
    COUNT(DISTINCT numero_cliente) as numeros_unicos,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT numero_cliente) THEN '✅ OK' 
        ELSE '❌ DUPLICADOS!' 
    END as status
FROM cliente;

-- VERIFICAÇÃO 2: Ver primeiros e últimos números
(SELECT numero_cliente, nome, pacote, 'PRIMEIRO' as tipo FROM cliente ORDER BY CAST(numero_cliente AS UNSIGNED) ASC LIMIT 3)
UNION ALL
(SELECT numero_cliente, nome, pacote, 'ÚLTIMO' as tipo FROM cliente ORDER BY CAST(numero_cliente AS UNSIGNED) DESC LIMIT 3)
ORDER BY tipo DESC, CAST(numero_cliente AS UNSIGNED);

-- VERIFICAÇÃO 3: Verificar se há números faltando na sequência
SELECT 
    LPAD(n.num, 3, '0') as numero_esperado
FROM (
    SELECT a.N + b.N * 10 + 1 as num
    FROM 
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
    WHERE a.N + b.N * 10 + 1 <= 79
) n
WHERE LPAD(n.num, 3, '0') NOT IN (SELECT numero_cliente FROM cliente);

-- VERIFICAÇÃO 4: Validar formato (todos devem ter 3 dígitos)
SELECT COUNT(*) as total_formato_correto
FROM cliente 
WHERE numero_cliente REGEXP '^[0-9]{3}$';

-- VERIFICAÇÃO 5: Ver estrutura da tabela atualizada
DESCRIBE cliente;

-- VERIFICAÇÃO 6: Ver alguns clientes com todos os campos importantes
SELECT 
    numero_cliente, 
    nome, 
    email, 
    telefone, 
    pacote, 
    status, 
    edificio, 
    apartamento,
    data_inscricao
FROM cliente 
ORDER BY CAST(numero_cliente AS UNSIGNED) 
LIMIT 10;

-- ====================================
-- SCRIPT ALTERNATIVO EM CASO DE ERRO
-- ====================================

-- Se algo der errado, restaurar backup:
-- DROP TABLE cliente;
-- RENAME TABLE cliente_backup TO cliente;

-- ====================================
-- FUNÇÃO AUXILIAR PARA OBTER PRÓXIMO NÚMERO
-- ====================================

DELIMITER //
CREATE FUNCTION get_next_client_number() RETURNS VARCHAR(10)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(numero_cliente AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM cliente;
    RETURN LPAD(next_num, 3, '0');
END //
DELIMITER ;

-- ====================================
-- TESTES DO SISTEMA
-- ====================================

-- TESTE 1: Ver próximo número disponível
SELECT get_next_client_number() as proximo_numero;

-- TESTE 2: Inserir novo cliente completo (deve gerar 080)
INSERT INTO cliente (
    nome, 
    email, 
    telefone, 
    data_inscricao, 
    pacote, 
    edificio, 
    apartamento, 
    valor_mensal,
    status
) VALUES (
    'Cliente Teste', 
    'teste@email.com', 
    '244912345678',
    CURDATE(), 
    'Plano Básico', 
    'Edifício Teste', 
    '12A', 
    5000.00,
    'ativo'
);

-- TESTE 3: Verificar se foi criado corretamente
SELECT 
    numero_cliente, 
    nome, 
    pacote, 
    status,
    data_inscricao
FROM cliente 
WHERE nome = 'Cliente Teste';

-- TESTE 4: Verificar total após inserção
SELECT COUNT(*) as deve_ser_80 FROM cliente;
SELECT MAX(CAST(numero_cliente AS UNSIGNED)) as deve_ser_80 FROM cliente;

-- ====================================
-- CONSULTAS ÚTEIS PARA O SISTEMA
-- ====================================

-- Buscar cliente por número (para sua API PHP)
SELECT 
    id,
    numero_cliente,
    nome,
    email,
    telefone,
    pacote,
    valor_mensal,
    mes_pago,
    edificio,
    apartamento,
    status,
    data_inscricao,
    data_pagamento,
    termino,
    observacao
FROM cliente 
WHERE numero_cliente = '001';

-- Listar clientes ativos com números
SELECT 
    numero_cliente,
    nome,
    telefone,
    pacote,
    edificio,
    apartamento,
    status
FROM cliente 
WHERE status = 'ativo' 
ORDER BY CAST(numero_cliente AS UNSIGNED);

-- Estatísticas por pacote
SELECT 
    pacote,
    COUNT(*) as total_clientes,
    AVG(valor_mensal) as valor_medio
FROM cliente 
GROUP BY pacote
ORDER BY total_clientes DESC;

-- ====================================
-- SCRIPT DE LIMPEZA (se necessário)
-- ====================================

-- Para remover trigger se precisar:
-- DROP TRIGGER IF EXISTS auto_numero_cliente;

-- Para remover função auxiliar:
-- DROP FUNCTION IF EXISTS get_next_client_number;

-- Para remover backup após confirmação:
-- DROP TABLE IF EXISTS cliente_backup;

-- Para remover a coluna (CUIDADO!)
-- ALTER TABLE cliente DROP COLUMN numero_cliente;

-- ====================================
-- COMANDOS DE MANUTENÇÃO
-- ====================================

-- Ver triggers ativos
SHOW TRIGGERS WHERE `Table` = 'cliente';

-- Ver índices da tabela
SHOW INDEX FROM cliente;

-- Otimizar tabela após mudanças
OPTIMIZE TABLE cliente;