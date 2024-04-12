import {
  assert,
  call,
  initialize,
  near,
  NearBindgen,
  validateAccountId,
  UnorderedMap,
  view,
  includeBytes,
} from "near-sdk-js"
import { isValidFrequency } from "../../types/frequency"
import { generateUniqueSubAccountNearId } from "../../utils/generator"
import { Prefix } from "../../types/prefix"
import {
  GAS_FOR_NEW_PLAN,
  INITIAL_BALANCE_FOR_NEW_PLAN,
  REQUIRED_GAS_FOR_NEW_PLAN,
} from "../../constants"
import { NFTMetadata } from "../plan/metadata"
import { createSubAccountAndDeployContract } from "./factory_core"

@NearBindgen({ requireInit: true })
export class FactoryContract {
  initialized = false
  plans: UnorderedMap<string[]>

  @initialize({ privateFunction: true })
  init() {
    assert(!this.initialized, "Contract is already initialized.")
    this.initialized = true
  }

  constructor() {
    this.plans = new UnorderedMap("plans")
    // this.escrowBalances = new UnorderedMap<u128>("escrowBalances")
  }

  @call({ payableFunction: false, privateFunction: false })
  create_plan(metadata: NFTMetadata) {
    near.log(`initialized: ${this.initialized}`)
    assert(
      near.prepaidGas() >= REQUIRED_GAS_FOR_NEW_PLAN,
      "Please attach at least 100TGas",
    )
    assert(metadata.name.length > 0, "Name cannot be empty")
    assert(metadata.amount > 0, "Must attach a positive amount")
    assert(isValidFrequency(metadata.frequency), "Invalid frequency value")

    near.log(`Attached deposit: ${near.attachedDeposit()}`)
    near.log(`Account balance: ${near.accountBalance()}`)
    near.log(`Prepaid gas: ${near.prepaidGas()}`)

    const predecessorAccountId = near.predecessorAccountId()

    const subAccountId = generateUniqueSubAccountNearId(
      near.currentAccountId(),
      predecessorAccountId,
      near.blockIndex().toString(),
      Prefix.Plan,
    )
    validateAccountId(subAccountId)

    near.log(
      `currentAccountId: ${near.currentAccountId()}, subAccountId: ${subAccountId}`,
    )
    const promise = createSubAccountAndDeployContract(
      subAccountId,
      BigInt(INITIAL_BALANCE_FOR_NEW_PLAN),
      includeBytes(
        "../../../build/plan_contract.wasm",
      ) as unknown as Uint8Array,
      JSON.stringify({ ownerId: subAccountId, metadata }),
      0,
      GAS_FOR_NEW_PLAN,
    )

    const plans = this.plans.get(predecessorAccountId, { defaultValue: [] })

    const newNFTPlanMetaData = new NFTMetadata(metadata)
    plans.push(JSON.stringify({ ...newNFTPlanMetaData, id: subAccountId }))
    this.plans.set(predecessorAccountId, plans)

    return near.promiseReturn(promise)
  }

  @view({})
  view_plans({ accountId }: { accountId: string }) {
    const plans = this.plans.get(accountId, { defaultValue: [] })
    return plans.map((plan) => JSON.parse(plan))
  }
}
