//refund the initial deposit based on the amount of storage that was used up
import { assert, near } from "near-sdk-js"

export function refundDeposit(
  storageUsed: bigint,
  additionalCost: bigint = BigInt(0),
) {
  //get how much it would cost to store the information
  let requiredCost =
    storageUsed * near.storageByteCost().valueOf() + additionalCost

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
