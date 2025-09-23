// ABI do contrato (Application Binary Interface), necessário para interagir com o contrato
// pode ser obtido no arquivo build/contracts/NomeDoContrato.json após o deploy
const contratoABI = [
    {
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
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Endereço do  contrato no ganache após o deploy
const contratoEndereco = "0x648db6a1eD4281006DAd970CB1C227343dab88C6";

// Inicializa o Web3 

window.addEventListener('DOMContentLoaded', async () => {
    const web3 = new Web3('http://127.0.0.1:7545');
    let accounts;
    try {
        accounts = await web3.eth.getAccounts();
        document.getElementById('mensagem').innerText = 'Conectado ao Ganache local.';
    } catch (error) {
        document.getElementById('mensagem').innerText = 'Erro ao conectar ao Ganache.';
        return;
    }

    // Inicializa o contrato
    const contrato = new web3.eth.Contract(contratoABI, contratoEndereco);

    // Alternar abas
    const menuItems = document.querySelectorAll('.navbar-menu li');
    const cadastroContainer = document.getElementById('cadastroContainer');
    const listaContainer = document.getElementById('listaContainer');
    menuItems.forEach((item, idx) => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (item.textContent.trim() === 'Cadastrar') {
                cadastroContainer.style.display = '';
                listaContainer.style.display = 'none';
            } else if (item.textContent.trim() === 'Lista') {
                cadastroContainer.style.display = 'none';
                listaContainer.style.display = '';
                listarPacientes();
            }
        });
    });

    // Inicializa o formulário de cadastro do paciente
    document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const idade = parseInt(document.getElementById('idade').value);
        const endereco = document.getElementById('endereco').value.trim();
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.innerText = '';

        if (!nome || !cpf || !idade || idade <= 12) {
            mensagemDiv.innerText = 'Preencha todos os campos obrigatórios corretamente.';
            return;
        }

        // Envia a transação para o contrato
        try {
            await contrato.methods.cadastrarPaciente(nome, cpf, idade, endereco)
                .send({ from: accounts[0], gas: 3000000 })
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
    async function listarPacientes() {
        const tabela = document.getElementById('tabelaPacientes').querySelector('tbody');
        const mensagemLista = document.getElementById('mensagemLista');
        tabela.innerHTML = '';
        mensagemLista.innerText = '';
        try {
            const pacientes = await contrato.methods.consultarPacientes().call();
            if (!pacientes || pacientes.length === 0) {
                mensagemLista.innerText = 'Nenhum paciente cadastrado.';
                return;
            }
            pacientes.forEach(paciente => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${paciente.id}</td><td>${paciente.nome}</td><td>${paciente.cpf}</td><td>${paciente.idade}</td><td>${paciente.endereco}</td>`;
                tabela.appendChild(row);
            });
        } catch (err) {
            mensagemLista.innerText = 'Erro ao buscar pacientes.';
        }
    }
});
