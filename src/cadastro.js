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
        "type": "function",
        "payable": false
    }
];

// Endereço do  contrato no ganache após o deploy
const contratoEndereco = "0xAafcdfE8DA5CD62F77Ec93B4a9D2c58EdD914E26";

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

    //   Inicializa o formulário de cadastro do paciente
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
});
