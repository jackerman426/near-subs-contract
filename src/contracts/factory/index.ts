import {
  assert,
  call,
  includeBytes,
  initialize,
  LookupMap,
  near,
  NearBindgen,
  UnorderedMap,
  validateAccountId,
  view,
} from "near-sdk-js"
import { Frequency, isValidFrequency } from "../../types/frequency"
import { generateUniqueSubAccountNearId } from "../../utils/generator"
import { Prefix } from "../../types/prefix"
import {
  GAS_FOR_NEW_VAULT,
  INITIAL_BALANCE_FOR_NEW_VAULT,
  REQUIRED_GAS_FOR_NEW_VAULT,
} from "../../constants"
import { NFTMetadata } from "../vault/metadata"
import { createSubAccountAndDeployContract } from "./factory_core"
import { refundDeposit } from "../helpers"

@NearBindgen({ requireInit: true })
export class FactoryContract {
  initialized = false
  frequencyMap: LookupMap<string>
  vaults: UnorderedMap<string[]>

  constructor() {
    this.frequencyMap = new LookupMap<string>("frequencyMap")
    this.vaults = new UnorderedMap<string[]>("vaults")
  }

  @initialize({ privateFunction: true })
  init() {
    assert(!this.initialized, "Contract is already initialized.")

    this.frequencyMap.set(Frequency.Hourly.toString(), "Hourly")
    this.frequencyMap.set(Frequency.Daily.toString(), "Daily")
    this.frequencyMap.set(Frequency.Weekly.toString(), "Weekly")
    this.frequencyMap.set(Frequency.Monthly.toString(), "Monthly")
    this.frequencyMap.set(Frequency.Yearly.toString(), "Yearly")

    this.initialized = true
  }

  @call({ payableFunction: true, privateFunction: false })
  create_vault(metadata: NFTMetadata) {
    let initialStorageUsage = near.storageUsage()
    near.log(`initialStorage: ${initialStorageUsage}`)

    assert(
      near.prepaidGas() >= REQUIRED_GAS_FOR_NEW_VAULT,
      "Please attach at least 100TGas",
    )
    assert(
      near.attachedDeposit() >= INITIAL_BALANCE_FOR_NEW_VAULT,
      "Please attach at least 6N to cover the costs for a new vault",
    )
    assert(metadata.name.length > 0, "Name cannot be empty")
    assert(metadata.amount > 0, "Must attach a positive amount")
    assert(isValidFrequency(metadata.frequency), "Invalid frequency value")

    near.log(`Account balance: ${near.accountBalance()}`)
    near.log(`Prepaid gas: ${near.prepaidGas()}`)

    const predecessorAccountId = near.predecessorAccountId()

    const subAccountId = generateUniqueSubAccountNearId(
      near.currentAccountId(),
      predecessorAccountId,
      near.blockIndex().toString(),
      Prefix.Vault,
    )
    validateAccountId(subAccountId)

    near.log(
      `currentAccountId: ${near.currentAccountId()}, subAccountId: ${subAccountId}`,
    )
    const promise = createSubAccountAndDeployContract(
      subAccountId,
      BigInt(INITIAL_BALANCE_FOR_NEW_VAULT), //This is paid by the smart contract account balance
      includeBytes(
        "../../../build/vault_contract.wasm",
      ) as unknown as Uint8Array,
      JSON.stringify({ ownerId: subAccountId, metadata }),
      0,
      GAS_FOR_NEW_VAULT,
    )

    const vaults = this.vaults.get(predecessorAccountId, { defaultValue: [] })

    const newNFTVaultMetaData = new NFTMetadata(metadata)
    vaults.push(JSON.stringify({ ...newNFTVaultMetaData, id: subAccountId }))
    this.vaults.set(predecessorAccountId, vaults)

    let requiredStorageInBytes =
      near.storageUsage().valueOf() - initialStorageUsage.valueOf()

    //refund any excess storage if the user attached too much. Panic if they didn't attach enough to cover the required.
    refundDeposit(requiredStorageInBytes, BigInt(INITIAL_BALANCE_FOR_NEW_VAULT))

    return near.promiseReturn(promise)
  }

  @view({})
  view_vaults_by_account_id({ accountId }: { accountId: string }) {
    const vaults = this.vaults.get(accountId, { defaultValue: [] })
    return vaults.map((vault) => JSON.parse(vault))
  }

  @view({})
  view_vaults() {
    const vaults = this.vaults.toArray({ defaultValue: [] })
    return vaults.flatMap(([accountId, vaults]) =>
      vaults.map((vault) => ({
        accountId,
        ...JSON.parse(vault),
      })),
    )
  }

  @view({})
  view_frequency_map(): { [key: string]: string } {
    const result: { [key: string]: string } = {}
    for (let i = 0; i <= Frequency.Yearly; i++) {
      const key = i.toString()
      result[key] = this.frequencyMap.get(key)
    }
    return result
  }
}
