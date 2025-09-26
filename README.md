# 🏥 Sistema de Cadastro de Pacientes - Blockchain

Um sistema descentralizado para cadastro e consulta de pacientes utilizando **Ethereum Smart Contracts**, desenvolvido com **Solidity**, **Web3.js** e **Truffle Framework**.

## 📋 Funcionalidades

### ✅ Principais Features
- **Cadastro de Pacientes**: Registro seguro e imutável de dados de pacientes na blockchain
- **Listagem Completa**: Visualização de todos os pacientes cadastrados
- **Pesquisa por CPF**: Busca específica de pacientes utilizando CPF
- **Validações Inteligentes**: 
  - CPF único (não permite duplicatas)
  - Idade mínima de 12 anos
  - Campos obrigatórios
- **Interface Web Responsiva**: Frontend moderno com navegação por abas

### 🔒 Características de Segurança
- **Imutabilidade**: Dados não podem ser alterados após o cadastro
- **Transparência**: Todas as transações são verificáveis na blockchain
- **Descentralização**: Não depende de um servidor central
- **Validação Automática**: Smart contract previne dados inválidos

## 🛠️ Tecnologias Utilizadas

- **Solidity** `^0.7.0` - Linguagem para Smart Contracts
- **Truffle Framework** - Desenvolvimento e deploy de contratos
- **Web3.js** `^4.16.0` - Biblioteca para interação com Ethereum
- **Ganache** - Blockchain local para desenvolvimento
- **HTML5/CSS3/JavaScript** - Frontend da aplicação

## 🚀 Como Executar o Projeto

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **NPM** ou **Yarn**
3. **Truffle Framework**
4. **Ganache** (blockchain local)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/kamilaqz/blockchain_fase2.git
cd blockchain_fase2
```

2. **Instale as dependências**
```bash
npm install
```

3. **Instale o Truffle globalmente** (se não tiver)
```bash
npm install -g truffle
```

4. **Baixe e configure o Ganache**
   - Acesse: https://trufflesuite.com/ganache/
   - Crie um novo workspace
   - Configure para rodar na porta `7545`
   - Anote as contas disponíveis

### Deploy do Smart Contract

1. **Compile o contrato**
```bash
truffle compile
```

2. **Execute o deploy**
```bash
truffle migrate
```

3. **Anote o endereço do contrato** exibido no terminal

4. **Atualize o endereço no frontend**
   - Abra `src/cadastro.js`
   - Substitua o valor da variável `contratoEndereco` pelo endereço obtido no deploy

### Executando a Aplicação

1. **Inicie um servidor local**
```bash
# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js (http-server)
npx http-server src -p 8000

# Opção 3: Live Server (VS Code)
# Abra index.html com Live Server
```

2. **Acesse no navegador**
```
http://localhost:8000
```

3. **Configure o MetaMask** (opcional)
   - Adicione a rede local do Ganache
   - Importe uma das contas do Ganache
   - URL RPC: `http://127.0.0.1:7545`
   - Chain ID: `1337`

## 📝 Como Usar o Sistema

### 1. Cadastrar Paciente
- Acesse a aba "Cadastrar"
- Preencha todos os campos obrigatórios:
  - **Nome**: Nome completo do paciente
  - **CPF**: Apenas números (será formatado automaticamente)
  - **Idade**: Deve ser maior que 12 anos
  - **Endereço**: Endereço completo
- Clique em "Cadastrar Paciente"
- Aguarde a confirmação da transação

### 2. Listar Pacientes
- Acesse a aba "Lista"
- Visualize todos os pacientes cadastrados
- Dados exibidos: ID, Nome, CPF, Idade, Endereço

### 3. Pesquisar por CPF
- Acesse a aba "Pesquisa"
- Digite o CPF (com ou sem formatação)
- Clique em "Pesquisar"
- Visualize os dados do paciente encontrado

*Desenvolvido como projeto educacional para demonstrar conceitos de blockchain e smart contracts* 🎓