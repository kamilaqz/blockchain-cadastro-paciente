const ContratoPaciente = artifacts.require("CadastroPaciente");

module.exports = function (deployer) {
  deployer.deploy(ContratoPaciente);
};