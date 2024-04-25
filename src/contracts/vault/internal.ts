//add a token to the set of tokens an owner has
import { VaultContract } from "./index"
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
  contract: VaultContract,
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
