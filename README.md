# Faucet Smart Contract

Este repositório contém um contrato inteligente desenvolvido em Solidity, projetado para ser integrado a uma DApp de faucet. A faucet permite que os usuários solicitem pequenas quantidades de criptomoedas de teste de maneira controlada. 

O projeto utiliza o framework Hardhat para simplificar o processo de desenvolvimento, testes e implantação. A faucet implementa um mecanismo de distribuição limitado, com controle de tempo entre as solicitações para prevenir abusos e garantir que o contrato mantenha saldo suficiente para novas requisições.

A DApp conectada ao contrato permite que os usuários interajam facilmente com a faucet através de uma interface amigável, facilitando o envio de transações e o recebimento de tokens de teste. Este projeto é ideal para ambientes de teste ou desenvolvimento, onde usuários podem experimentar transações na blockchain sem a necessidade de gastar criptomoedas reais.

## Funcionalidades principais:

- **Distribuição de tokens**: Os usuários podem solicitar uma quantidade predeterminada de tokens de teste.
- **Controle de tempo**: Um tempo limite entre as solicitações é imposto para evitar múltiplos saques consecutivos de um mesmo endereço.
- **Gestão de fundos**: O contrato gerencia o saldo disponível para garantir que a faucet não fique sem fundos.
- **Integração com DApp**: A faucet se integra diretamente a uma DApp para facilitar as solicitações de tokens pelos usuários.

Este contrato é altamente configurável e pode ser adaptado para diferentes redes de teste ou de produção, dependendo das necessidades da aplicação.
