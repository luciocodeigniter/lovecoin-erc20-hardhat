import {
  loadFixture,
  time, // para manipulação de tempo
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("LoveCoin tests", function () {

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await hre.ethers.getSigners();

    const LoveCoin = await hre.ethers.getContractFactory("LoveCoin");
    const loveCoin = await LoveCoin.deploy();

    return { loveCoin, owner, otherAccount, thirdAccount };
  }

  it("Should have the correct token name", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const name = await loveCoin.name();
    expect(name).to.equal("LoveCoin");
  });

  it("Should have the correct symbol", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const symbol = await loveCoin.symbol();
    expect(symbol).to.equal("LOVE");
  });

  it("Should have the correct decimals", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const decimals = await loveCoin.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should have the correct totalSupply", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const totalSupply = await loveCoin.totalSupply();

    // número muito grandes (10000000n * 10n ** 18n) precisamos tratar como bigint
    // por isso os `n` ao lados dos número que é a notação do typescript
    expect(totalSupply).to.equal(10000000n * 10n ** 18n);
  });


  it("Should get deployer balance", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await loveCoin.balanceOf(owner.address);

    // note que no deploy do contrato enviamos o totalSupply para o deployer,
    // logo ele tem que ter: `10000000n * 10n ** 18n`
    expect(balance).to.equal(10000000n * 10n ** 18n);
  });

  it("Should tranfer", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balanceOwnerBefore = await loveCoin.balanceOf(owner.address);
    const balanceOtherBefore = await loveCoin.balanceOf(otherAccount.address);

    await loveCoin.transfer(otherAccount.address, 10n);

    const balanceOwnerAfter = await loveCoin.balanceOf(owner.address);
    const balanceOtherAfter = await loveCoin.balanceOf(otherAccount.address);

    // no início o `deployer` tem que ter o total suply
    expect(balanceOwnerBefore).to.equal(10000000n * 10n ** 18n);
    // no início o `otherAccount` tem que ter 0
    expect(balanceOtherBefore).to.equal(0);

    // depois o `deployer` tem que ter menos 10
    expect(balanceOwnerAfter).to.equal((10000000n * 10n ** 18n) - 10n);
    // depois o `otherAccount` tem que ter 10
    expect(balanceOtherAfter).to.equal(10);
  });

  it("Should FAIL tranfer by insufficient balance", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);

    // conectamos na conta do `otherAccount` para ele ser o `sender`
    const instance = loveCoin.connect(otherAccount);

    // e tentamos transferir os `LOVE`, mas dará erro por que ele não tem saldo
    await expect(instance.transfer(owner.address, 20n))
      .to.be.revertedWithCustomError(loveCoin, "ERC20InsufficientBalance");
  });


  it("Should approve", async function () {
    const { loveCoin, owner, otherAccount } = await loadFixture(deployFixture);

    // estou aprovando o `otherAccount.address` (exchange) a gastar `1n` (fração) de `LOVE`
    await loveCoin.approve(otherAccount.address, 1n);

    // agora verifico se tenho nas permissões a autorização de gasto de `1n`
    // para a exchange (otherAccount.address)
    const value = await loveCoin.allowance(owner.address, otherAccount.address);
    expect(value).to.equal(1n);
  });


  it("Should tranfer from (delegated transfer)", async function () {

    //! Vamos testar o `otherAccount` (exchange) transferindo para o `thirdAccount` 
    //! os fundos do `owner` (eu)

    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // primeiro aprovo o `otherAccount` (exchange) a tranferir 10
    await loveCoin.approve(otherAccount.address, 10n);

    // agora preciso me conectar com o `otherAccount`
    const instance = loveCoin.connect(otherAccount);

    // agora tento transferir o valor de `5n` para o `thirdAccount`
    // logo, tem que sobrar `5n` autorizados para o `_spender` (otherAccount)
    await instance.transferFrom(owner.address, thirdAccount.address, 5n);


    // agora preciso validar se o `otherAccount` (exchange) ainda tem `5n` restantes autorizados
    const remainingAllowance = await loveCoin.allowance(owner.address, otherAccount.address);
    expect(remainingAllowance).to.equal(5n);
  });


  it("Should FAIL tranferFrom (delegated transfer) -> Insufficient balance", async function () {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // Aprovar o `otherAccount` para gastar os tokens do `thirdAccount`
    await loveCoin.connect(thirdAccount).approve(otherAccount.address, 10n);

    // Agora tentamos transferir os `LOVE` do `thirdAccount` (sem saldo) e isso deve falhar por saldo insuficiente
    await expect(
      loveCoin.connect(otherAccount).transferFrom(thirdAccount.address, owner.address, 5n)
    ).to.be.revertedWithCustomError(loveCoin, "ERC20InsufficientBalance");
  });


  it("Should FAIL tranferFrom (delegated transfer) -> Insufficient allowance", async function () {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // conectamos na conta do `otherAccount` para ele ser o `sender` (exchange)
    const instance = loveCoin.connect(otherAccount);

    // e tentamos transferir os `LOVE` do `owner` mas dará erro pois não tem aprovação prévia
    await expect(instance.transferFrom(owner.address, thirdAccount.address, 5n))
      .to.be.revertedWithCustomError(loveCoin, "ERC20InsufficientAllowance"); // mesma mensagem do required da função
  });


  it("Should mint once", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // habilitamos o mint pelo `owner`
    // definindo que cada carteira poderá mintar 1000n de cada vez
    const mintAmount = 1000n; // em wei -> na menor fração
    await loveCoin.setMintAmount(mintAmount);

    // antes do mint
    const balanceOtherBefore = await loveCoin.balanceOf(otherAccount.address);

    // agora preciso mintar para o `otherAccount`
    await loveCoin.mint(otherAccount.address);

    // depois do mint
    const balanceOtherAfter = await loveCoin.balanceOf(otherAccount.address);

    // então o `balanceOtherAfter` deve ter a soma dele mesmo com o `mintAmount`
    expect(balanceOtherAfter).to.equal(balanceOtherBefore + mintAmount);
  });

  it("Should mint twice (different accounts)", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    /**
     * ! Nesse teste o objetivo é fazer o mint duas vezes seguidas para contas diferentes.
     * ! Portando o expect é apenas para termos o `check` que passou.
     */

    // habilitamos o mint pelo `owner`
    const mintAmount = 1000n;
    await loveCoin.setMintAmount(mintAmount);

    // fazemos o mint para o `owner`
    await loveCoin.mint(owner.address);

    // antes do mint
    const balanceOtherBefore = await loveCoin.balanceOf(otherAccount.address);
    
    // agora preciso mintar para o `otherAccount`
    await loveCoin.mint(otherAccount.address);

    // depois do mint
    const balanceOtherAfter = await loveCoin.balanceOf(otherAccount.address);

    // então o `balanceOtherAfter` deve ter a soma dele mesmo com o `mintAmount`
    expect(balanceOtherAfter).to.equal(balanceOtherBefore + mintAmount);
  });


  it("Should mint twice (same account)", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // habilitamos o mint pelo `owner`
    const mintAmount = 1000n;
    await loveCoin.setMintAmount(mintAmount);

    // antes do mint
    const balanceOwnerBefore = await loveCoin.balanceOf(owner.address);

    // primeiro mint
    await loveCoin.mint(owner.address);

    // agora precisamos avançar o tempo
    const mintDelay = 60 * 60 * 24 * 2; // Dois dias em segundos

    // avançamos 2 dias
    await time.increase(mintDelay);

    // fazemos o segundo mint
    await loveCoin.mint(owner.address);

    // depois do mint
    const balanceOwnerAfter = await loveCoin.balanceOf(owner.address);

    // agora validamos o saldo anterior + 2 mints (mintAmount * 2n)
    expect(balanceOwnerAfter).to.equal(balanceOwnerBefore + (mintAmount * 2n));
  });


  it("Should FAIL setMintAmount", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);
    const mintAmount = 1000n;
    const instance = loveCoin.connect(otherAccount);
    await expect(instance.setMintAmount(mintAmount)).to.be.revertedWith("You do not have permission");
  });

  it("Should FAIL setMintDelay", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);
    const mintDelay = 60 * 60 * 24;
    const instance = loveCoin.connect(otherAccount);
    await expect(instance.setMintDelay(mintDelay)).to.be.revertedWith("You do not have permission");
  });

  it("Should FAIL mint", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // falhará porque não foi habilitado, mesmo que seja o owner
    await expect(loveCoin.mint(owner.address)).to.be.revertedWith("Minting is not enabled");
  });

  it("Should FAIL mint twice", async () => {
    const { loveCoin, owner, otherAccount, thirdAccount } = await loadFixture(deployFixture);

    // ativamos o mint
    await loveCoin.setMintAmount(1000n);

    // primeiro mint
    await loveCoin.mint(owner.address);

    // falhará porque não teve o delay de tempo
    await expect(loveCoin.mint(owner.address)).to.be.revertedWith("You can't mint twice in a row");
  });


});
