import {
  call,
  LookupMap,
  NearBindgen,
  view,
  assert,
  near,
  UnorderedMap,
  NearPromise,
} from "near-sdk-js"

@NearBindgen({})
export class EscrowContract {
  GAS_FEE = 30_000_000_000_000 // 30 TGAS
  accountsValueLocked = new LookupMap("avl")
  accountsReceivers = new LookupMap("ar")
  accountsAssetContractId = new LookupMap("aac")
  accountsTimeCreated = new UnorderedMap("atc")

  @call({ payableFunction: true })
  purchase_in_escrow({
    planId,
    subscriptionContractId,
  }: {
    planId: string
    subscriptionContractId: string
  }) {
    const nearAttachedAmount = near.attachedDeposit()
    const nearAmount = nearAttachedAmount - BigInt(this.GAS_FEE)
    const subscriberAccountId = near.predecessorAccountId()
    assert(nearAmount > 0, "Must attach a positive amount")
    assert(
      !this.accountsValueLocked.containsKey(subscriberAccountId),
      "Cannot escrow purchase twice before completing one first: feature not implemented",
    )
    assert(
      subscriberAccountId !== near.currentAccountId(),
      "Cannot escrow from the contract itself",
    )

    this.accountsReceivers.set(subscriberAccountId, planId)
    this.accountsValueLocked.set(
      subscriberAccountId,
      nearAttachedAmount.toString(),
    )
    this.accountsAssetContractId.set(
      subscriberAccountId,
      subscriptionContractId,
    )
    this.accountsTimeCreated.set(
      subscriberAccountId,
      near.blockTimestamp().toString(),
    )
    // this.accountsAssets.set(subscriberAccountId, "0")

    // const promise = NearPromise.new(subscriptionContractId)
    //   .functionCall(
    //     "subscribeToPlan",
    //     JSON.stringify({
    //       planId,
    //       subscriberAccountId,
    //       attached_near: nearAmount.toString(),
    //     }),
    //     0n,
    //     this.GAS_FEE,
    //   )
    //   .then(
    //     NearPromise.new(near.currentAccountId()).functionCall(
    //       "internalPurchaseEscrow",
    //       JSON.stringify({}),
    //       0,
    //       this.GAS_FEE,
    //     ),
    //   )
    // return promise.asReturn()
  }
}
