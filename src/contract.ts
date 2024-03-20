import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  UnorderedMap,
} from "near-sdk-js"
import { Plan } from "./entities/plan"
import { Frequency } from "./types/frequency"

@NearBindgen({})
class NearSubsContract {
  plans: UnorderedMap<string>

  constructor() {
    this.plans = new UnorderedMap("plans")
  }

  @call({ payableFunction: false, privateFunction: false })
  createPlan({
    name,
    frequency,
    amount,
  }: {
    name: string
    frequency: Frequency
    amount: number
  }) {
    const accountId = near.signerAccountId()
    const plansJson = this.plans.get(accountId) || "[]"
    const userPlans: Plan[] = JSON.parse(plansJson)
    const plan = new Plan(name, frequency, amount, accountId)
    userPlans.push(plan)
    this.plans.set(accountId, JSON.stringify(userPlans))
    near.log(
      `Plan created with name: ${name} for account: ${accountId} with frequency: ${frequency} and amount: ${amount}`,
    )
  }

  @view({})
  getPlans({ accountId }: { accountId: string }): Plan[] {
    const plansJson = this.plans.get(accountId) || "[]"
    return JSON.parse(plansJson)
  }
}
