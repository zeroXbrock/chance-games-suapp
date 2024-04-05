import {  decodeEventLog, encodeFunctionData, hexToBigInt } from '@flashbots/suave-viem'
import type { Address, Hash, Hex, Transport } from '@flashbots/suave-viem'
import type { SuaveProvider, SuaveWallet, TransactionReceiptSuave, TransactionRequestSuave } from '@flashbots/suave-viem/chains/utils'
import SlotsContract from '../out/Slots.sol/SlotMachines.json'
import CasinoLibContract from '../out/CasinoLib.sol/CasinoLib.json'
import { DEFAULT_KETTLE_ADDRESS } from './utils'

export interface SlotMachineLog {
    slotId: bigint
    pot: bigint
    minBet: bigint
}

export class SlotsClient<T extends Transport> {
    wallet: SuaveWallet<T>
    provider: SuaveProvider<T>
    slotMachinesAddress?: Address
    kettleAddress: Address
    slotIds: bigint[] = []

    constructor(params: {
        wallet: SuaveWallet<T>,
        provider: SuaveProvider<T>,
        slotMachinesAddress?: Address,
        kettleAddress?: Address,
        slotIds?: bigint[],
    }) {
        this.wallet = params.wallet
        this.provider = params.provider
        this.slotMachinesAddress = params.slotMachinesAddress
        this.kettleAddress = params.kettleAddress || DEFAULT_KETTLE_ADDRESS
        this.slotIds = params.slotIds || []
    }

    /** Deploy SlotMachines contract and return mutated self with new `slotMachinesAddress`.
     *
     * // TODO: replace self-mutating class with a factory pattern.
     */
    async deploy(): Promise<this> {
        const deployContractTxHash = await this.wallet.deployContract({
            abi: SlotsContract.abi,
            bytecode: SlotsContract.bytecode.object as Hex,
        })
        const deployContractReceipt = await this.provider.waitForTransactionReceipt({hash: deployContractTxHash})
        if (!deployContractReceipt.contractAddress) throw new Error('no contract address')
        this.slotMachinesAddress = deployContractReceipt.contractAddress
        return this
    }

    async chipsBalance(account?: Address): Promise<bigint> {
        if (!this.slotMachinesAddress) throw new Error('slot machine must be deployed first')
        const balance = await this.provider.call({
            to: this.slotMachinesAddress,
            data: encodeFunctionData({
                abi: SlotsContract.abi,
                functionName: 'chipsBalance',
                args: [account || this.wallet.account.address]
            }),
        })
        if (!balance.data) {
            throw new Error('failed to retrieve chips balance')
        }
        return hexToBigInt(balance.data)
    }

    /** Deposit SUAVE-ETH to buy chips. */
    async buyChips(amount: bigint): Promise<Hash> {
        console.log("slot address", this.slotMachinesAddress)
        if (!this.slotMachinesAddress) throw new Error('slot machine must be deployed first')
        const txRequest: TransactionRequestSuave = {
            to: this.slotMachinesAddress,
            data: encodeFunctionData({
                abi: SlotsContract.abi,
                functionName: 'buyChips',
            }),
            type: '0x0',
            value: amount,
            gas: 180000n,
            gasPrice: 1000000000n,
        }
        return await this.wallet.sendTransaction(txRequest)
    }

    /** Cash out chips for SUAVE-ETH. */
    async cashChips(amount: bigint): Promise<Hash> {
        if (!this.slotMachinesAddress) throw new Error('slot machine must be deployed first')
        const txRequest: TransactionRequestSuave = {
            to: this.slotMachinesAddress,
            data: encodeFunctionData({
                abi: SlotsContract.abi,
                functionName: 'cashChips',
                args: [amount],
            }),
            type: '0x0',
            gas: 42000n,
            gasPrice: 1000000000n,
        }
        return await this.wallet.sendTransaction(txRequest)
    }

    /** Initialize a new slot machine, waits for tx receipt. */
    async initSlotMachine(startingPot: bigint, minBet: bigint): Promise<SlotMachineLog> {
        if (!this.slotMachinesAddress) throw new Error('slot machine must be deployed first')
        console.log("initializing new slot machine...")
        const txRequest: TransactionRequestSuave = {
            to: this.slotMachinesAddress,
            data: encodeFunctionData({
                abi: SlotsContract.abi,
                functionName: 'initSlotMachine',
                args: [minBet],
            }),
            type: '0x0',
            gas: 200000n,
            gasPrice: 1000000000n,
            value: startingPot,
        }
        const txHash = await this.wallet.sendTransaction(txRequest)
        const initSlotsRes = await this.provider.waitForTransactionReceipt({hash: txHash})
        // decode log from initSlotMachine; expecting only one
        const initLog = initSlotsRes.logs[0]
        const decodedEvent = decodeEventLog({
            abi: SlotsContract.abi,
            ...initLog,
        })
        return decodedEvent.args as SlotMachineLog
    }

    /** Pull lever at given slotId. */
    async pullSlot(slotId: bigint, betAmount: bigint): Promise<Hash> {
        if (!this.slotMachinesAddress) throw new Error('slot machine must be deployed first')
        const txRequest: TransactionRequestSuave = {
            to: this.slotMachinesAddress,
            data: encodeFunctionData({
                abi: SlotsContract.abi,
                functionName: 'pullSlot',
                args: [slotId, betAmount],
            }),
            kettleAddress: this.kettleAddress,
            type: '0x43',
            gas: 220000n,
            gasPrice: 1000000000n,
        }
        return await this.wallet.sendTransaction(txRequest)
    }
}

export function checkSlotPullReceipt(txReceipt: TransactionReceiptSuave) {
    return txReceipt.logs.map(log => decodeEventLog({
        abi: SlotsContract.abi,
        ...log,
        }))
}
