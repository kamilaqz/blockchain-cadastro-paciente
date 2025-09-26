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
                "internalType": "struct CadastroPaciente.Paciente[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_cpf", "type": "string" }
        ],
        "name": "consultarPacientePorCPF",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contratoEndereco = "0x434c64ca7E6E50917058E7a81B32565e0155c26c";

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

    const contrato = new web3.eth.Contract(contratoABI, contratoEndereco);

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
                document.getElementById('resultadoPesquisa').style.display = 'none';
                document.getElementById('mensagemPesquisa').innerText = '';
                document.getElementById('cpfPesquisa').value = '';
            }
        });
    });

    document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        let cpf = document.getElementById('cpf').value.trim();
        const idade = parseInt(document.getElementById('idade').value);
        const endereco = document.getElementById('endereco').value.trim();
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.innerText = '';

        cpf = cpf.replace(/\D/g, '');

        if (!nome || !cpf || cpf.length !== 11 || !idade || idade <= 12) {
            mensagemDiv.innerText = 'Preencha todos os campos obrigatórios corretamente.';
            return;
        }

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

    document.getElementById('pesquisaForm').addEventListener('submit', async (e) => {
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
                cpfLimpo, 
                cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
                cpfOriginal, 
                cpfOriginal.replace(/\D/g, '')
            ];
            
            
            let encontrado = false;
            for (let i = 0; i < variacoesCPF.length && !encontrado; i++) {
                try {
                    const cpfParaBuscar = variacoesCPF[i].replace(/\D/g, '');
                    if (cpfParaBuscar.length !== 11) continue;
                    const res = await contrato.methods.consultarPacientePorCPF(cpfParaBuscar).call();
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
            
            if (Array.isArray(resultado) && resultado.length === 5) {
                const [id, nome, cpfRetornado, idade, endereco] = resultado;
                let cpfFormatado = cpfRetornado;
                if (cpfFormatado && cpfFormatado.length === 11) {
                    cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                }
                const row = document.createElement('tr');
                row.innerHTML = `<td>${id}</td><td>${nome}</td><td>${cpfFormatado}</td><td>${idade}</td><td>${endereco}</td>`;
                tabelaResultado.appendChild(row);
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
