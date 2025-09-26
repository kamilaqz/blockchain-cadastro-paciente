// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract CadastroPaciente {
    struct Paciente {
        uint id;
        string nome;
        string cpf;
        uint idade;
        string endereco;
    }
    Paciente[] public pacientes;
    uint public totalPacientes;
    mapping(string => bool) private cpfCadastrado;

    function cadastrarPaciente(
        string memory _nome,
        string memory _cpf,
        uint _idade,
        string memory _endereco
    ) public {
        require(bytes(_nome).length > 0, "Nome obrigatorio");
        require(bytes(_cpf).length > 0, "CPF obrigatorio");
        require(_idade > 12, "Idade deve ser maior que 12 anos");

        require(!cpfCadastrado[_cpf], "CPF ja cadastrado");

        totalPacientes++;
        pacientes.push(
            Paciente(totalPacientes, _nome, _cpf, _idade, _endereco)
        );
        cpfCadastrado[_cpf] = true;
    }

    function consultarPacientes() public view returns (Paciente[] memory) {
        return pacientes;
    }

    function consultarPacientePorCPF(
        string memory _cpf
    )
        public
        view
        returns (uint, string memory, string memory, uint, string memory)
    {
        for (uint i = 0; i < pacientes.length; i++) {
            if (keccak256(bytes(pacientes[i].cpf)) == keccak256(bytes(_cpf))) {
                return (
                    pacientes[i].id,
                    pacientes[i].nome,
                    pacientes[i].cpf,
                    pacientes[i].idade,
                    pacientes[i].endereco
                );
            }
        }
        revert("Paciente nao encontrado!");
    }
}
