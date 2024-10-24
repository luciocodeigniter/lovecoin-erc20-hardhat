// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LoveCoin is ERC20 {
    address private _owner;

    // define quantos `LOVE` devem ser mintados
    uint256 _mintAmount = 0;

    // controle por timelock
    // definimos um delay de tempo de 2 dias
    // para evitar que o user fique mintando a todo momento
    // Ou seja, cada carteira só pode mintar uma vez a cada dois dias, inicialmente
    // e que o `owner` poderá alterar
    uint64 private _mintDelay = 60 * 60 * 24 * 2;

    // preciso de uma estrutura para controlar os tempos de mints das carteiras
    // ou seja, registro a carteira e quando ela poderá fazer o próximo mint
    mapping(address => uint256) private nextMint;

    constructor() ERC20("LoveCoin", "LOVE") {
        // definimos o `owner`
        _owner = msg.sender;

        // Preciso emitir token para o dono do contrato
        _mint(msg.sender, 10000000 * 10 ** 18); // 10 MILHÕES DE LOVE
    }

    // função para cunhar novos `LOVE` para testes durante o desenvolvimento
    function mint(address _to) public onlyOwner {
        // não pode ser executada em produção, ou seja, enquanto o `_mintAmount` não for alterado pelo `owner`
        // através da função `setMintAmount` definindo um valor maior que zero, não será possível executar essa função
        require(_mintAmount > 0, "Minting is not enabled");

        // agora preciso proibir que o sender faça mint em sequência. Ele precisa respeitar o delay
        // ou seja, o `block.timestamp` tem que ser superior ao `nextMint[_to]`,
        // dessa forma implementamos o `controle por timelock`
        require(
            block.timestamp > nextMint[_to],
            "You can't mint twice in a row"
        );

        _mint(_to, _mintAmount);

        // agora registro quando essa carteira poderá fazer um novo mint
        // ou seja, a partir de agora, contamos mais 2 dias para o próximo delay
        nextMint[_to] = block.timestamp + _mintDelay;
    }

    // função que é executada apenas pelo `owner` e define um novo valor para `_mintAmount`
    // o que definirá que a mintagem está habilitada
    function setMintAmount(uint256 _newAmount) public onlyOwner {
        require(_newAmount > 0, "Value must greather then zero");
        _mintAmount = _newAmount;
    }

    // função que é executada apenas pelo `owner` e define um novo valor para `_mintDelay`
    function setMintDelay(uint64 _newDelayInSeconds) public onlyOwner {
        _mintDelay = _newDelayInSeconds;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "You do not have permission");
        _; //o _; significa "continue a execução da função aqui" após o modificador ser verificado com sucesso.
    }
}
