import {
  assert,
  call,
  initialize,
  near,
  NearBindgen,
  validateAccountId,
  includeBytes,
  UnorderedMap,
  view,
} from "near-sdk-js"
import { isValidFrequency } from "../types/frequency"
import { generateUniqueSubAccountNearId } from "../utils/generator"
import { Prefix } from "../types/prefix"
import {
  GAS_FOR_NEW_PLAN,
  INITIAL_BALANCE_FOR_NEW_PLAN,
  REQUIRED_GAS_FOR_NEW_PLAN,
} from "../constants"
// import { Plan } from "../types/plan"
import { Plan } from "../models/plan"

@NearBindgen({ requireInit: true })
class FactoryContract {
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
  create_plan(plan: Partial<Plan>) {
    near.log(`initialized: ${this.initialized}`)
    assert(
      near.prepaidGas() >= REQUIRED_GAS_FOR_NEW_PLAN,
      "Please attach at least 100TGas",
    )
    assert(plan.name.length > 0, "Name cannot be empty")
    assert(plan.amount > 0, "Must attach a positive amount")
    assert(isValidFrequency(plan.frequency), "Invalid frequency value")

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

    const promise = createSubAccountAndDeployPlan(
      subAccountId,
      GAS_FOR_NEW_PLAN,
      plan,
    )

    const plans = this.plans.get(predecessorAccountId, { defaultValue: [] })
    const newPlan = new Plan(
      plan.name,
      plan.frequency,
      plan.amount,
      subAccountId,
      near.blockTimestamp().toString(),
    )
    plans.push(JSON.stringify(newPlan))
    this.plans.set(predecessorAccountId, plans)

    return near.promiseReturn(promise)
  }

  @view({})
  view_plans({ accountId }: { accountId: string }) {
    const plans = this.plans.get(accountId, { defaultValue: [] })
    return plans.map((plan) => JSON.parse(plan))
  }
}

function createSubAccountAndDeployPlan(
  subAccountId: string,
  initialBalance: number | bigint,
  plan: Partial<Plan>,
) {
  let promise = near.promiseBatchCreate(subAccountId)
  near.promiseBatchActionCreateAccount(promise)
  near.promiseBatchActionTransfer(
    promise,
    BigInt(INITIAL_BALANCE_FOR_NEW_PLAN), //This is payed by the signer - make the function payable? we need to see that (probably)
  )

  near.promiseBatchActionDeployContract(
    promise,
    includeBytes("../../build/plan_contract.wasm") as unknown as Uint8Array,
  )

  near.promiseBatchActionAddKeyWithFullAccess(
    promise,
    near.signerAccountPk(),
    0,
  )

  near.promiseBatchActionFunctionCall(
    promise,
    "init",
    JSON.stringify(plan),
    0,
    initialBalance,
  )
  near.log(`Used gas: ${near.usedGas()}`)

  return promise
}
