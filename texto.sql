
CREATE DATABASE sistema_vivo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


CREATE TABLE usuarios (
    usuario_id int(11) PRIMARY KEY AUTO_INCREMENT,
     nome VARCHAR(100) NOT NULL,
     usuario VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    posicao_id INT(11),
    estado INT(11)
);



INSERT INTO usuarios (usuario_id, nome, usuario, senha, email, posicao_id, estado) VALUES ('1', 'Arnaldo Neto', 'Arnaldo', '234','arnaldoneto@assemblante.co.ao', '1', '1');

INSERT INTO posicao (nome) VALUES ('Informatico');
INSERT INTO posicao (nome) VALUES ('Administrador');
ALTER TABLE usuarios
CHANGE COLUMN id usuario_id INT ;

UPDATE usuarios
SET nome = 'Arnaldo Neto'
WHERE usuario_id = 2;


UPDATE usuarios
SET posicao_id = 1,
    estado = 1;

CREATE TABLE posicao (
  posicao_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  nome varchar (100)
);


INSERT INTO aceltech.posicao (nome) VALUES ('Administrador');

INSERT INTO aceltech.posicao (nome) VALUES ('Informatico');

INSERT INTO aceltech.posicao (nome) VALUES ('Funcionario');

ALTER TABLE sistema_vivo.cliente
ADD COLUMN onu VARCHAR(255) DEFAULT NULL;

UPDATE usuarios SET estado = 2 WHERE usuario_id = 1;

INSERT INTO posicao (nome) VALUES ('Funcionario');

ALTER TABLE sistema_vivo.cliente
ADD pppoe VARCHAR(100) UNIQUE NULL;

CREATE TABLE sistema_vivo.tb_categoria (
    id_categoria INT(11) PRIMARY KEY AUTO_INCREMENT,
    nome_categoria VARCHAR(255),
    fyh_creacao DATETIME,
    fyh_actualizacao DATETIME
);

CREATE TABLE sistema_vivo.tb_armazem (
    id_produto INT(11) PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(255),
    nome_produto VARCHAR(255),
    descricao TEXT DEFAULT NULL,
    id_categoria INT(11),
    usuario_id INT(11),
    stock INT(11),
    stock_minimo INT(11) DEFAULT NULL,
    stock_maximo INT(11) DEFAULT NULL,
    preco_compra DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    fecho_ingresso DATE,
    imagem TEXT DEFAULT NULL,
    fyh_creacao DATETIME,
    fyh_actualizacao DATETIME,
    FOREIGN KEY (id_categoria) REFERENCES sistema_vivo.tb_categoria(id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT
);

UPDATE sistema_vivo.tb_armazem
SET preco_compra = REPLACE(REPLACE(preco_compra, '.', ''), ',', '.')
WHERE id_produto IS NOT NULL; -- Substitua pelo nome real da chave primária

UPDATE sistema_vivo.tb_armazem
SET preco_venda = REPLACE(REPLACE(preco_venda, '.', ''), ',', '.')
WHERE id_produto IS NOT NULL;


SELECT @@sql_safe_updates;

DESCRIBE sistema_vivo.tb_armazem;

-- Passo 2: Alterar tipo dos campos
ALTER TABLE sistema_vivo.tb_armazem
MODIFY preco_compra DECIMAL(15,2);

ALTER TABLE sistema_vivo.tb_armazem
MODIFY preco_venda DECIMAL(15,2);


CREATE TABLE sistema_vivo.tb_provedores (
    id_provedor INT(11) PRIMARY KEY AUTO_INCREMENT,
    nome_provedor VARCHAR(255),
    celular VARCHAR(50),
    telefone VARCHAR(50) DEFAULT NULL,
    empresa VARCHAR(255),
    email VARCHAR(50) DEFAULT NULL,
    direcao VARCHAR(255),
    fyh_creacao DATETIME,
    fyh_actualizacao DATETIME
);

CREATE TABLE sistema_vivo.tb_compras (
    id_compra INT(11) PRIMARY KEY AUTO_INCREMENT,
    id_produto INT(11),
    nro_compra INT(11),
    data_compra DATETIME,
    id_provedor INT(11),
    comprovante VARCHAR(255),
    usuario_id INT(11),
    preco_compra VARCHAR(50),
    quantidade INT(11),
    fyh_creacao DATETIME,
    fyh_actualizacao DATETIME,
    FOREIGN KEY (id_produto) REFERENCES tb_armazem(id_produto) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (id_provedor) REFERENCES tb_provedores(id_provedor) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE sistema_vivo.tb_carrinho (
    id_carrinho INT(11) PRIMARY KEY AUTO_INCREMENT,
    nro_venda INT(11), 
    id_produto INT(11) NOT NULL,
    quantidade_carrinho INT(11) NOT NULL,
    fyh_creacao DATETIME,
    fyh_actualizacao DATETIME,
    FOREIGN KEY (nro_venda) REFERENCES sistema_vivo.tb_vendas (nro_venda) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (id_produto) REFERENCES sistema_vivo.tb_armazem (id_produto) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE sistema_vivo.tb_vendas (
    id_venda INT(11) PRIMARY KEY AUTO_INCREMENT,
    nro_venda INT(11),
    id INT(11),
    total_pago DECIMAL(10,2),
    fyh_creacao DATETIME,
    fyh_actualizacao DATETIME,
     status VARCHAR(50) DEFAULT 'toogle_on',
    INDEX idx_nro_venda (nro_venda),
    FOREIGN KEY (id) REFERENCES sistema_vivo.cliente(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
 --TABELA DESPESA
CREATE TABLE sistema_vivo.tb_despesas (
    id_despesa INT(11) PRIMARY KEY AUTO_INCREMENT,
    nome_despesa VARCHAR(255) NOT NULL,
    descricao_despesa TEXT DEFAULT NULL,
    valor_despesa VARCHAR(255) DEFAULT NULL,
    comprovativo_despesa VARCHAR(255) DEFAULT NULL,
    data_despesa DATE DEFAULT NULL,
    usuario_id INT DEFAULT NULL,
    criacao_despesa DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizacao_despesa DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

--# FINANÇAS
--TABELA CODIGO DE CONTAS
CREATE TABLE sistema_vivo.pgc_codigo_contas (
    id_conta INT AUTO_INCREMENT PRIMARY KEY,
    conta VARCHAR(20) NOT NULL UNIQUE, -- Ex: "11.1.1.01"
    nome_pgc VARCHAR(255) NOT NULL, -- Ex: "Terreno Adquirido - Compra"
    designacao_pgc VARCHAR(50),
    valor_pgc TEXT DEFAULT NULL, -- E
    notas_explicativas TEXT, -- Notas adicionais
    natureza VARCHAR(20) CHECK (natureza IN ('Débito', 'Crédito')), -- Restrição CHECK
    classificacao VARCHAR(20) CHECK (classificacao IN ('Ativo', 'Passivo')),
    usuario_id INT, -- Referência ao usuário
    data_criacao_pgc DATE NOT NULL, -- Data de criação do registro
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data de atualização
    FOREIGN KEY (usuario_id) REFERENCES sistema_vivo.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE NO ACTION -- Chave estrangeira para a tabela de usuários
);

--TABELA  LANÇAMENTOS CONTÁBIL
CREATE TABLE sistema_vivo.lancamentos_contabil (
    id_lan INT AUTO_INCREMENT PRIMARY KEY,
    conta_id VARCHAR(20) NOT NULL, -- Relacionada à tabela pgc_codigo_de_contas
    nome_lan VARCHAR(255) NOT NULL, -- Nome do lançamento
    designacao_lan VARCHAR(255), -- Descrição do lançamento
    quantidade INT DEFAULT 1, -- Quantidade (se aplicável)
    data_lan DATE NOT NULL, -- Data do lançamento
    valor_lan DECIMAL(15, 2) NOT NULL, -- Valor do lançamento
    nome_cliente VARCHAR(255) NULL,
    numero_bilhete VARCHAR(50) NULL,
    termino DATE NULL,
    pacote VARCHAR(100) NULL,
    edificio VARCHAR(50) NULL,
    apartamento VARCHAR(50) NULL,
    comprovante_lanc VARCHAR(255), -- Número ou referência do comprovante
    observacao_lanc TEXT DEFAULT NULL, -- Observações adicionais
    imagem_lanc VARCHAR(255) DEFAULT NULL, -- Nova coluna para armazenar o caminho da imagem
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data de atualização
    usuario_id INT,
    nome_provedor VARCHAR(255) DEFAULT NULL,
    telefone VARCHAR(50) DEFAULT NULL,
    empresa VARCHAR(255) DEFAULT NULL,
    direcao VARCHAR(255) DEFAULT NULL,
    num_fatura INT DEFAULT NULL,
    natureza VARCHAR(20) CHECK (natureza IN ('Débito', 'Crédito')), -- Restrição CHECK
    classificacao VARCHAR(20) CHECK (classificacao IN ('Ativo', 'Passivo')),
    FOREIGN KEY (conta_id) REFERENCES sistema_vivo.pgc_codigo_contas(conta) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (usuario_id) REFERENCES sistema_vivo.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE NO ACTION -- Chave estrangeira para a tabela de usuários
);
--DEMOSTRAÇÃO DO FLUXO DE CAIXA
CREATE TABLE demonstracao_fluxo_caixa (
    id_flu INT AUTO_INCREMENT PRIMARY KEY,
    conta_id VARCHAR(20) NOT NULL, -- Relacionada à tabela pgc_codigo_de_contas
     nome_flu VARCHAR(255) NOT NULL, -- Nome do lançamento
    designacao_flu VARCHAR(255) NOT NULL, -- Descrição do item
    data_flu DATE NOT NULL, -- Data do fluxo
    valor_flu DECIMAL(15, 2) NOT NULL, -- Valor do fluxo
    usuario_id int(11),
    FOREIGN KEY (conta_id) REFERENCES sistema_vivo.pgc_codigo_contas(conta) ON UPDATE CASCADE ON DELETE NO ACTION,
     FOREIGN KEY (usuario_id) REFERENCES sistema_vivo.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE NO ACTION -- Chave 
);

