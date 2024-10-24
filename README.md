# Faucet Smart Contract

Este repositório contém um contrato inteligente desenvolvido em Solidity, projetado para ser integrado a uma DApp de faucet. A faucet permite que os usuários solicitem pequenas quantidades de criptomoedas de teste de maneira controlada.

A DApp é **híbrida**, combinando uma interface frontend construída em React com um backend desenvolvido em **Node** e **Express** para gerenciar a mintagem de tokens na blockchain. Isso proporciona uma experiência otimizada para os usuários, permitindo que solicitem tokens sem pagar pelas taxas de gas.

O projeto utiliza o framework Hardhat para simplificar o processo de desenvolvimento, testes e implantação. A faucet implementa um mecanismo de distribuição limitado, com controle de tempo entre as solicitações para prevenir abusos e garantir que o contrato mantenha saldo suficiente para novas requisições.

## Experiência otimizada de mintagem

Os usuários solicitam tokens de teste através da DApp, conectando-se à MetaMask para autenticação. A mintagem é processada no backend, utilizando **Node** e **Express** para enviar a transação à blockchain. Isso garante que o custo das taxas de transação seja concentrado apenas no proprietário, tornando a experiência mais atrativa e acessível para os usuários, que não precisam se preocupar com os custos de gas.

## Funcionalidades principais:

- **Distribuição de tokens**: Os usuários podem solicitar uma quantidade predeterminada de tokens de teste através da DApp.
- **Controle de tempo (Time Lock)**: Um tempo limite entre as solicitações é imposto para evitar múltiplos saques consecutivos de um mesmo endereço.
- **Gestão de fundos**: O contrato gerencia o saldo disponível para garantir que a faucet não fique sem fundos.
- **Integração com DApp**: A faucet se integra diretamente a uma DApp híbrida, combinando frontend e backend para facilitar as solicitações de tokens pelos usuários.
- **Backend centralizado para mintagem**: O backend realiza a transação de mintagem na blockchain, garantindo que o **owner** cubra as taxas de gas.

Este projeto é ideal para ambientes de teste ou desenvolvimento, onde os usuários podem experimentar transações na blockchain sem a necessidade de gastar criptomoedas reais.
