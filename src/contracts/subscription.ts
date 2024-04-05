// import {
//   assert,
//   call,
//   initialize,
//   LookupMap,
//   near,
//   NearBindgen,
//   UnorderedMap,
//   view,
// } from "near-sdk-js"
// import { Plan } from "../models/plan"
// import { Frequency } from "../types/frequency"
// import { Subscription } from "../models/subscription"
// import { Status } from "../types/status"
//
// @NearBindgen({ requireInit: true })
// class SubscriptionContract {
//   initialized = false
//   subscriptionContractId = ""
//   plans: UnorderedMap<string>
//   userPlans: LookupMap<string[]>
//   subscriptions: UnorderedMap<string>
//   userSubscriptions: LookupMap<string[]>
//   // escrowBalances: UnorderedMap<u128>
//
//   @initialize({})
//   init({ subscriptionContractId }: { subscriptionContractId: string }) {
//     assert(!this.initialized, "Contract is already initialized.")
//     this.subscriptionContractId = subscriptionContractId
//     this.initialized = true
//   }
//
//   constructor() {
//     this.plans = new UnorderedMap("plans")
//     this.userPlans = new LookupMap<string[]>("userPlans")
//     this.subscriptions = new UnorderedMap("subscriptions")
//     this.userSubscriptions = new LookupMap<string[]>("userSubscriptions")
//     // this.escrowBalances = new UnorderedMap<u128>("escrowBalances")
//   }
//
//   @call({ payableFunction: false, privateFunction: false })
//   createPlan({
//     name,
//     frequency,
//     amount,
//   }: {
//     name: string
//     frequency: Frequency
//     amount: number
//   }) {
//     assert(name.length > 0, "Plan name cannot be empty")
//     assert(amount > 0, "Amount must be greater than 0.")
//
//     const accountId = near.signerAccountId()
//     const plan = new Plan(name, frequency, amount, accountId)
//     this.plans.set(plan.id, JSON.stringify(plan))
//     near.log(
//       `Plan created with name: ${name} for account: ${accountId} with frequency: ${frequency} and amount: ${amount}`,
//     )
//
//     const userPlans = this.userPlans.get(accountId, { defaultValue: [] })
//     userPlans.push(plan.id)
//     this.userPlans.set(accountId, userPlans)
//     near.log(
//       `User-Plan relation created between account: ${accountId} and plan: ${plan.id}`,
//     )
//   }
//
//   @view({})
//   getPlans({ accountId }: { accountId: string }): Plan[] {
//     const userPlanIds = this.userPlans.get(accountId, { defaultValue: [] })
//     return userPlanIds.map((planId) => this.getPlanById(planId))
//   }
//
//   @call({ payableFunction: true, privateFunction: false })
//   subscribeToPlan({ planId, endDate }: { planId: string; endDate: bigint }) {
//     const plan = this.getPlanById(planId)
//     assert(plan !== null, "Plan does not exist")
//
//     const accountId = near.signerAccountId()
//     near.predecessorAccountId()
//
//     // Validate and fetch subscription IDs in one step
//     const userSubscriptionsIds = this.validateNotAlreadySubscribed(
//       accountId,
//       planId,
//     )
//
//     const subscription = new Subscription(
//       planId,
//       endDate,
//       Status.Active,
//       accountId,
//     )
//
//     // Save the subscription to state
//     this.subscriptions.set(subscription.id, JSON.stringify(subscription))
//     near.log(`Account ${accountId} subscribed to plan ${planId}`)
//
//     userSubscriptionsIds.push(subscription.id)
//     this.userSubscriptions.set(accountId, userSubscriptionsIds)
//     near.log(
//       `User-Subscription relation created between account: ${accountId} and subscription: ${subscription.id}`,
//     )
//
//     // const amount: u128 = near.attachedDeposit()
//     // this.addFundsToEscrow(planId, amount)
//     // near.log(
//     //   `User-Subscription relation created between account: ${accountId} and subscription: ${subscription.id}`,
//     // )
//   }
//
//   @view({})
//   getSubscriptions({ accountId }: { accountId: string }): Subscription[] {
//     const userSubscriptionIds = this.userSubscriptions.get(accountId, {
//       defaultValue: [],
//     })
//     return userSubscriptionIds.map((subscriptionId) =>
//       this.getSubscriptionById(subscriptionId),
//     )
//   }
//
//   //TODO: Move these function to services
//   getPlanById(planId: string): Plan | null {
//     const planJson = this.plans.get(planId, { defaultValue: "{}" })
//     return planJson ? JSON.parse(planJson) : null
//   }
//
//   getSubscriptionById(subscriptionId: string): Subscription | null {
//     const subscriptionJson = this.subscriptions.get(subscriptionId, {
//       defaultValue: "{}",
//     })
//     return subscriptionJson ? JSON.parse(subscriptionJson) : null
//   }
//
//   validateNotAlreadySubscribed(accountId: string, planId: string) {
//     const userSubscriptionsIds = this.userSubscriptions.get(accountId, {
//       defaultValue: [],
//     })
//     userSubscriptionsIds.forEach((subscriptionId) => {
//       const subscription = this.getSubscriptionById(subscriptionId)
//       assert(subscription.planId !== planId, "Already subscribed to this plan")
//     })
//     return userSubscriptionsIds
//   }
//
//   // addFundsToEscrow(planId: string, amount: u128) {
//   //   const currentBalance = this.escrowBalances.get(planId, {
//   //     defaultValue: u128.Zero,
//   //   })
//   //   this.escrowBalances.set(planId, u128.add(currentBalance, amount))
//   // }
// }
