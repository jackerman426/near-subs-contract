import {
  assert,
  call,
  LookupMap,
  near,
  NearBindgen,
  UnorderedMap,
  view,
} from "near-sdk-js"
import { Plan } from "./models/plan"
import { Frequency } from "./types/frequency"
import { Subscription } from "./models/subscription"
import { Status } from "./types/status"

@NearBindgen({})
class NearSubsContract {
  plans: UnorderedMap<string>
  userPlans: LookupMap<string[]>
  subscriptions: UnorderedMap<string>
  userSubscriptions: LookupMap<string[]>

  constructor() {
    this.plans = new UnorderedMap("plans")
    this.userPlans = new LookupMap<string[]>("userPlans")
    this.subscriptions = new UnorderedMap("subscriptions")
    this.userSubscriptions = new LookupMap<string[]>("userSubscriptions")
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
    assert(name.length > 0, "Plan name cannot be empty")
    assert(amount > 0, "Amount must be greater than 0.")

    const accountId = near.signerAccountId()
    const plan = new Plan(name, frequency, amount, accountId)
    this.plans.set(plan.id, JSON.stringify(plan))
    near.log(
      `Plan created with name: ${name} for account: ${accountId} with frequency: ${frequency} and amount: ${amount}`,
    )

    const userPlans = this.userPlans.get(accountId, { defaultValue: [] })
    userPlans.push(plan.id)
    this.userPlans.set(accountId, userPlans)
    near.log(
      `User-Plan relation created between account: ${accountId} and plan: ${plan.id}`,
    )
  }

  @view({})
  getPlans({ accountId }: { accountId: string }): Plan[] {
    const userPlanIds = this.userPlans.get(accountId, { defaultValue: [] })
    return userPlanIds.map((planId) =>
      JSON.parse(this.plans.get(planId, { defaultValue: "{}" })),
    )
  }

  @call({ payableFunction: false, privateFunction: false })
  subscribeToPlan({ planId, endDate }: { planId: string; endDate: bigint }) {
    const plan = this.plans.get(planId)
    assert(plan !== null, "Plan does not exist")

    const accountId = near.signerAccountId()

    const userSubscriptionsIds = this.userSubscriptions.get(accountId, {
      defaultValue: [],
    })
    near.log(`userSubscriptions: ${userSubscriptionsIds}`)
    userSubscriptionsIds.forEach((subscriptionId) => {
      const subscription = JSON.parse(
        this.subscriptions.get(subscriptionId, { defaultValue: "{}" }),
      )
      assert(subscription.planId !== planId, "Already subscribed to this plan")
    })

    const subscription = new Subscription(
      planId,
      endDate,
      Status.Active,
      accountId,
    )

    // Save the subscription to state
    this.subscriptions.set(subscription.id, JSON.stringify(subscription))
    near.log(`Account ${accountId} subscribed to plan ${planId}`)

    userSubscriptionsIds.push(subscription.id)
    this.userSubscriptions.set(accountId, userSubscriptionsIds)
    near.log(
      `User-Subscription relation created between account: ${accountId} and subscription: ${subscription.id}`,
    )
  }

  @view({})
  getSubscriptions({ accountId }: { accountId: string }): Subscription[] {
    const userSubscriptionIds = this.userSubscriptions.get(accountId, {
      defaultValue: [],
    })
    return userSubscriptionIds.map((subscriptionId) =>
      JSON.parse(
        this.subscriptions.get(subscriptionId, { defaultValue: "{}" }),
      ),
    )
  }
}
