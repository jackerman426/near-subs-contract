// @ts-nocheck
import { assert, near } from "near-sdk-js"
import { VaultContract } from "./index"
import { internalAddTokenToOwner } from "./internal"
import { Token, TokenMetadata } from "./metadata"
import { refundDeposit } from "../helpers"

export function internalMint({
  contract,
  tokenId,
  metadata,
  receiverId,
  perpetualRoyalties,
}: {
  contract: VaultContract
  tokenId: string
  metadata: TokenMetadata
  receiverId: string
  // perpetualRoyalties: { [key: string]: number }
}): void {
  //measure the initial storage being used on the contract TODO
  let initialStorageUsage = near.storageUsage()

  near.log(`initialStorage: ${initialStorageUsage}`)

  //specify the token struct that contains the owner ID
  let token = new Token({
    //set the owner ID equal to the receiver ID passed into the function
    ownerId: receiverId,
  })

  //insert the token ID and token struct and make sure that the token doesn't exist
  assert(!contract.tokensById.containsKey(tokenId), "Token already exists") //This doesnt make sense if we generate the token id ourselves
  contract.tokensById.set(tokenId, token)

  //insert the token ID and metadata
  contract.tokenMetadataById.set(tokenId, metadata)

  //call the internal method for adding the token to the owner
  internalAddTokenToOwner(contract, token.ownerId, tokenId)

  //calculate the required storage which was the used - initial TODO
  let requiredStorageInBytes =
    near.storageUsage().valueOf() - initialStorageUsage.valueOf()

  //refund any excess storage if the user attached too much. Panic if they didn't attach enough to cover the required.
  refundDeposit(requiredStorageInBytes)
}
