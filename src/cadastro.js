// ABI do contrato (Application Binary Interface), necessário para interagir com o contrato
// pode ser obtido no arquivo build/contracts/NomeDoContrato.json após o deploy
const contratoABI = [
    {
        // Função Solidity: cadastra um novo paciente no blockchain
        "inputs": [
            { "internalType": "string", "name": "_nome", "type": "string" },
            { "internalType": "string", "name": "_cpf", "type": "string" },
            { "internalType": "uint256", "name": "_idade", "type": "uint256" },
            { "internalType": "string", "name": "_endereco", "type": "string" }
        ],
        "name": "cadastrarPaciente",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // nonpayable = altera o estado, não aceita Ether
    // view = só leitura, não altera nada no contrato
    {
        // Função Solidity: retorna todos os pacientes cadastrados (array de structs)
        // O tipo "tuple[]" no ABI representa um array de structs do Solidity
        "inputs": [],
        "name": "consultarPacientes",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "nome", "type": "string" },
                    { "internalType": "string", "name": "cpf", "type": "string" },
                    { "internalType": "uint256", "name": "idade", "type": "uint256" },
                    { "internalType": "string", "name": "endereco", "type": "string" }
                ],
                // array de structs Paciente definidos dentro do contrato cadastroPaciente
                "internalType": "struct CadastroPaciente.Paciente[]",
                "name": "",
                // indica que o retorno da funcao é um array de structs (tuplas)
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // metodo de consultar paciente por cpf
    {
        // Função Solidity: consulta um paciente específico pelo CPF
        // O método retorna os dados do paciente como múltiplos valores (tuple)
        "inputs": [
            // define o input do metodo (cpf do tipo string)
            { "internalType": "string", "name": "_cpf", "type": "string" }
        ],
        "name": "consultarPacientePorCPF",
        // define o retorno da funcao (id, nome, cpf, idade, endereco)
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "string", "name": "", "type": "string" }
        ],
        // define que a funcao é de leitura (view)
        "stateMutability": "view",
        "type": "function"
    }
];

// Endereço do  contrato no ganache após o deploy
// O endereço do contrato é o identificador único do smart contract na blockchain local (Ganache)
const contratoEndereco = "0x558c025fee5346178C72571a140704F6dE437aB3";

// Inicializa o Web3 
// O Web3.js é a biblioteca que permite interação entre o JavaScript e a blockchain Ethereum
window.addEventListener('DOMContentLoaded', async () => {
    const web3 = new Web3('http://127.0.0.1:7545');
    let accounts;
    try {
        accounts = await web3.eth.getAccounts();
        // Cada conta representa um endereço Ethereum controlado pelo Ganache
        document.getElementById('mensagem').innerText = 'Conectado ao Ganache local.';
    } catch (error) {
        document.getElementById('mensagem').innerText = 'Erro ao conectar ao Ganache.';
        return;
    }

    // Inicializa o contrato
    // O objeto "contrato" permite chamar funções do smart contract na blockchain
    const contrato = new web3.eth.Contract(contratoABI, contratoEndereco);

    // Alternar abas
    const menuItems = document.querySelectorAll('.navbar-menu li');
    const cadastroContainer = document.getElementById('cadastroContainer');
    const listaContainer = document.getElementById('listaContainer');
    const pesquisaContainer = document.getElementById('pesquisaContainer');
    menuItems.forEach((item, idx) => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (item.textContent.trim() === 'Cadastrar') {
                cadastroContainer.style.display = '';
                listaContainer.style.display = 'none';
                pesquisaContainer.style.display = 'none';
            } else if (item.textContent.trim() === 'Lista') {
                cadastroContainer.style.display = 'none';
                listaContainer.style.display = '';
                pesquisaContainer.style.display = 'none';
                listarPacientes();
            } else if (item.textContent.trim() === 'Pesquisa') {
                cadastroContainer.style.display = 'none';
                listaContainer.style.display = 'none';
                pesquisaContainer.style.display = '';
                // Limpar resultado anterior ao entrar na aba
                document.getElementById('resultadoPesquisa').style.display = 'none';
                document.getElementById('mensagemPesquisa').innerText = '';
                document.getElementById('cpfPesquisa').value = '';
            }
        });
    });

    // Inicializa o formulário de cadastro do paciente
    document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
        // Ao cadastrar, enviamos uma transação para a blockchain (gera um novo bloco)
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        let cpf = document.getElementById('cpf').value.trim();
        const idade = parseInt(document.getElementById('idade').value);
        const endereco = document.getElementById('endereco').value.trim();
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.innerText = '';

        // Padroniza o CPF para apenas números
        cpf = cpf.replace(/\D/g, '');

        if (!nome || !cpf || cpf.length !== 11 || !idade || idade <= 12) {
            // Validação importante para evitar transações desnecessárias na blockchain
            mensagemDiv.innerText = 'Preencha todos os campos obrigatórios corretamente.';
            return;
        }

        // Envia a transação para o contrato
        try {
            await contrato.methods.cadastrarPaciente(nome, cpf, idade, endereco)
            // deixando explicito pro web3 para usar no maximo 3000000 unidades de gas para essa transacao
            // isso evita que ele tente usar mais gas do que o necessario e a transacao falhe
                .send({ from: accounts[0], gas: 3000000 })
                // .send() envia uma transação que altera o estado do contrato (gera custo de gas)
                .on('transactionHash', function (hash) {
                    mensagemDiv.innerText = 'Transação enviada. Aguarde confirmação...';
                })
                .on('receipt', function (receipt) {
                    mensagemDiv.innerText = 'Paciente cadastrado com sucesso!';
                    document.getElementById('cadastroForm').reset();
                });
        } catch (error) {
            if (error && error.message) {
                if (error.message.includes('CPF ja cadastrado')) {
                    mensagemDiv.innerText = 'CPF já cadastrado.';
                } else if (error.message.includes('Idade deve ser maior que 12 anos')) {
                    mensagemDiv.innerText = 'Idade deve ser maior que 12 anos.';
                } else {
                    mensagemDiv.innerText = 'Erro: ' + error.message;
                }
            } else {
                mensagemDiv.innerText = 'Erro ao cadastrar paciente.';
            }
        }
    });

    // Função para listar pacientes
    // Função view: consulta dados sem alterar o blockchain (não consome gas)
    async function listarPacientes() {
        const tabela = document.getElementById('tabelaPacientes').querySelector('tbody');
        const mensagemLista = document.getElementById('mensagemLista');
        tabela.innerHTML = '';
        mensagemLista.innerText = '';
        try {
            const pacientes = await contrato.methods.consultarPacientes().call();
            // .call() executa leitura no contrato, sem custo de gas
            if (!pacientes || pacientes.length === 0) {
                mensagemLista.innerText = 'Nenhum paciente cadastrado.';
                return;
            }
            pacientes.forEach(paciente => {
                const row = document.createElement('tr');
                let cpfFormatado = paciente.cpf;
                if (cpfFormatado && cpfFormatado.length === 11) {
                    cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                }
                row.innerHTML = `<td>${paciente.id}</td><td>${paciente.nome}</td><td>${cpfFormatado}</td><td>${paciente.idade}</td><td>${paciente.endereco}</td>`;
                tabela.appendChild(row);
            });
        } catch (err) {
            mensagemLista.innerText = 'Erro ao buscar pacientes.';
        }
    }

    // Inicializa o formulário de pesquisa por CPF
    document.getElementById('pesquisaForm').addEventListener('submit', async (e) => {
        // Pesquisa por CPF: busca dados no blockchain sem alterar estado
        e.preventDefault();
    let cpfOriginal = document.getElementById('cpfPesquisa').value.trim();
        const mensagemPesquisa = document.getElementById('mensagemPesquisa');
        const resultadoPesquisa = document.getElementById('resultadoPesquisa');
        const tabelaResultado = document.getElementById('tabelaResultado').querySelector('tbody');
        
        mensagemPesquisa.innerText = '';
        resultadoPesquisa.style.display = 'none';
        tabelaResultado.innerHTML = '';

        if (!cpfOriginal) {
            mensagemPesquisa.innerText = 'Por favor, digite um CPF para pesquisar.';
            return;
        }

    const cpfLimpo = cpfOriginal.replace(/\D/g, '');
        
        mensagemPesquisa.innerText = 'Buscando paciente...';

        try {
            let resultado;
            const variacoesCPF = [
                cpfLimpo, // Sempre tente primeiro só números
                cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'), // Formatado
                cpfOriginal, // Como foi digitado
                cpfOriginal.replace(/\D/g, '') // Só números do original
            ];
            
            
            let encontrado = false;
            for (let i = 0; i < variacoesCPF.length && !encontrado; i++) {
                try {
                    // Sempre envie para o contrato apenas números
                    const cpfParaBuscar = variacoesCPF[i].replace(/\D/g, '');
                    if (cpfParaBuscar.length !== 11) continue;
                    // Cada chamada aqui é uma consulta (view) ao contrato na blockchain
                    const res = await contrato.methods.consultarPacientePorCPF(cpfParaBuscar).call();
                    // Alguns providers podem retornar objeto ao invés de array
                    if (res && typeof res === 'object' && !Array.isArray(res)) {
                        resultado = Object.values(res);
                    } else {
                        resultado = res;
                    }
                    encontrado = true;
                } catch (error) {
                    console.log(`Tentativa falhou:`, error.message);
                }
            }
            
            if (!encontrado) {
                throw new Error('Paciente nao encontrado!');
            }
            
            // resultado é um array com [id, nome, cpf, idade, endereco]
            if (Array.isArray(resultado) && resultado.length === 5) {
                // O resultado é um array com os dados do paciente vindos do smart contract
                const [id, nome, cpfRetornado, idade, endereco] = resultado;
                // Formatar o CPF para exibir com máscara
                let cpfFormatado = cpfRetornado;
                if (cpfFormatado && cpfFormatado.length === 11) {
                    cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                }
                // Criar uma linha na tabela com o resultado
                const row = document.createElement('tr');
                row.innerHTML = `<td>${id}</td><td>${nome}</td><td>${cpfFormatado}</td><td>${idade}</td><td>${endereco}</td>`;
                tabelaResultado.appendChild(row);
                // Exibir o resultado
                resultadoPesquisa.style.display = '';
                mensagemPesquisa.innerText = 'Paciente encontrado com sucesso!';
            } else {
                mensagemPesquisa.innerText = 'Erro inesperado ao processar o resultado.';
            }
            
        } catch (error) {
            if (error && error.message) {
                if (error.message.includes('Paciente nao encontrado')) {
                    mensagemPesquisa.innerText = 'Paciente não encontrado. Verifique o CPF digitado.';
                } else {
                    mensagemPesquisa.innerText = 'Erro: ' + error.message;
                }
            } else {
                mensagemPesquisa.innerText = 'Erro ao pesquisar paciente.';
            }
        }
    });
});
