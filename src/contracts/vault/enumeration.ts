//Query for all the tokens for an owner
import { VaultContract } from "./index"
import { JsonToken } from "./metadata"
import { restoreOwners } from "./internal"
import { internalNftToken } from "./nft_core"

export function internalTokensForOwner({
  contract,
  accountId,
  fromIndex,
  limit,
}: {
  contract: VaultContract
  accountId: string
  fromIndex?: number
  limit?: number
}): JsonToken[] {
  //get the set of tokens for the passed in owner
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId))

  //if there isn't a set of tokens for the passed in account ID, we'll return 0
  if (tokenSet == null) {
    return []
  }

  //where to start pagination - if we have a fromIndex, we'll use that - otherwise start from 0 index
  let start = fromIndex ? fromIndex : 0
  //take the first "limit" elements in the array. If we didn't specify a limit, use 50
  let max = limit ? limit : 50

  let keys = tokenSet.toArray()
  let tokens: JsonToken[] = []
  for (let i = start; i < max; i++) {
    if (i >= keys.length) {
      break
    }
    let token = internalNftToken({ contract, tokenId: keys[i] })
    tokens.push(token)
  }
  return tokens
}

// //Query for the total supply of NFTs on the contract
// export function internalTotalSupply({
//   contract,
// }: {
//   contract: PlanContract
// }): number {
//   /*
//       FILL THIS IN
//   */
//   //TODO
//   return c
// }
//
// //Query for nft tokens on the contract regardless of the owner using pagination
// export function internalNftTokens({
//   contract,
//   fromIndex,
//   limit,
// }: {
//   contract: PlanContract
//   fromIndex?: string
//   limit?: number
// }): JsonToken[] {
//   /*
//       FILL THIS IN
//   */
//   //TODO
//   return
// }
//
// //get the total supply of NFTs for a given owner
// export function internalSupplyForOwner({
//   contract,
//   accountId,
// }: {
//   contract: PlanContract
//   accountId: string
// }): number {
//   /*
//       FILL THIS IN
//   */
//   //TODO
//   return
// }
