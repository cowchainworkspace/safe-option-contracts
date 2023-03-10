import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { beforeEach } from "mocha";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { SafeOption, SafeOption__factory } from "../typechain";

const increaseDate = async (days: number) => {
    await ethers.provider.send('evm_increaseTime', [days * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine', []);
}

describe("SafeOption", () => {
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;

    let safeOption: SafeOption;

    let safeOption_factory: SafeOption__factory;

    before(async () => {
        safeOption_factory = await ethers.getContractFactory("SafeOption");
    })

    beforeEach(async () => {
        [owner, alice, bob] = await ethers.getSigners();

        safeOption = await safeOption_factory.deploy(owner.address, [alice.address])
    })

    describe('function constructor', () => {
        it('should mint tokens to first holder', async () => {
           expect(await safeOption.balanceOf(owner.address)).eq(parseEther('10000000'))
        })

        it('should add accounts to whitelist', async () => {
            expect(await safeOption.whitelist(alice.address)).eq(true);
        })
    })

    describe('function mint', () => {
        it('should revert if minter is not owner', async () => {
            await expect(safeOption.connect(alice).mint(1)).revertedWith('Ownable: caller is not the owner')
        })

        it('should mint new tokens to owner', async () => {
            await safeOption.mint(parseEther('100000'));

            expect(await safeOption.balanceOf(owner.address)).eq(parseEther('10100000'))
        })
    })

    describe('function whitelistAccount', () => {
        it('should revert if caller is not owner', async () => {
            await expect(safeOption.connect(alice).whitelistAccount(bob.address)).revertedWith('Ownable: caller is not the owner');
        })

        it('should whitelist account', async () => {
            expect(await safeOption.whitelist(bob.address)).eq(false);

            await safeOption.whitelistAccount(bob.address);

            expect(await safeOption.whitelist(bob.address)).eq(true);
        })
    })

    describe('function removeWhitelist', () => {
        it('should revert if caller is not owner', async () => {
            await expect(safeOption.connect(alice).removeWhitelist(bob.address)).revertedWith('Ownable: caller is not the owner');
        })

        it('should remove whitelisted account account', async () => {
            expect(await safeOption.whitelist(alice.address)).eq(true);

            await safeOption.removeWhitelist(alice.address);

            expect(await safeOption.whitelist(alice.address)).eq(false);
        })
    })

    describe('transfer', () => {
        it('should revert transfer for not whitelisted accounts', async () => {
            await safeOption.transfer(bob.address, 100);

            await expect(safeOption.connect(bob).transfer(owner.address, 100)).revertedWith("transfer is not allowed");
        })

        it('should allow transfer for whitelisted account', async () => {
            await safeOption.transfer(alice.address, 100);
            await safeOption.connect(alice).transfer(bob.address, 100);

            expect(await safeOption.balanceOf(bob.address)).eq(100);
        })

        it('should allow transfer after 6 months', async () => {
            await safeOption.transfer(bob.address, 100);

            await increaseDate(6 * 30);

            await safeOption.connect(bob).transfer(alice.address, 100);

            expect(await safeOption.balanceOf(alice.address)).eq(100);
        })
    })

})