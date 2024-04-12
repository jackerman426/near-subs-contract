//add a token to the set of tokens an owner has
import { PlanContract } from "./index"
import { assert, near, UnorderedMap, UnorderedSet } from "near-sdk-js"
import { JsonToken } from "./metadata"

// Gets a collection and deserializes it into a set that can be used.
export function restoreOwners(collection: any): UnorderedSet<any> {
  near.log(`collection: ${JSON.stringify(collection)}`)
  if (collection == null) {
    return null
  }
  return UnorderedSet.reconstruct(collection as UnorderedSet<any>)
}

export function internalAddTokenToOwner(
  contract: PlanContract,
  accountId: string,
  tokenId: string,
) {
  //get the set of tokens for the given account
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId))

  if (tokenSet == null) {
    //if the account doesn't have any tokens, we create a new unordered set
    tokenSet = new UnorderedSet(`tokensPerOwner-${accountId.toString()}`)
  }

  //we insert the token ID into the set
  tokenSet.set(tokenId)

  //we insert that set for the given account ID.
  contract.tokensPerOwner.set(accountId, tokenSet)
}

//refund the initial deposit based on the amount of storage that was used up
export function refundDeposit(storageUsed: bigint) {
  //get how much it would cost to store the information
  let requiredCost = storageUsed * near.storageByteCost().valueOf()

  near.log(`requiredCost: ${requiredCost}`)
  //get the attached deposit
  let attachedDeposit = near.attachedDeposit().valueOf()

  near.log(`attachedDeposit: ${attachedDeposit}`)

  //make sure that the attached deposit is greater than or equal to the required cost
  assert(
    requiredCost <= attachedDeposit,
    `Must attach ${requiredCost} yoctoNEAR to cover storage`,
  )

  //get the refund amount from the attached deposit - required cost
  let refund = attachedDeposit - requiredCost
  near.log(`Refunding ${refund} yoctoNEAR`)

  //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
  if (refund > 1) {
    // Send the money to the beneficiary (TODO: don't use batch actions)
    const promise = near.promiseBatchCreate(near.predecessorAccountId())
    near.promiseBatchActionTransfer(promise, refund)
  }
}
