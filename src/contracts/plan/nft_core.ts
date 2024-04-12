// @ts-nocheck
import { PlanContract } from "./index"
import { JsonToken, Token, TokenMetadata } from "./metadata"

const GAS_FOR_RESOLVE_TRANSFER = 40_000_000_000_000
const GAS_FOR_NFT_ON_TRANSFER = 35_000_000_000_000

//get the information for a specific token ID
export function internalNftToken({
  contract,
  tokenId,
}: {
  contract: PlanContract
  tokenId: string
}) {
  let token = contract.tokensById.get(tokenId) as Token
  //if there wasn't a token ID in the tokens_by_id collection, we return None
  if (token == null) {
    return null
  }

  //if there is some token ID in the tokens_by_id collection
  //we'll get the metadata for that token
  let metadata = contract.tokenMetadataById.get(tokenId) as TokenMetadata

  //we return the JsonToken
  return new JsonToken({
    tokenId: tokenId,
    ownerId: token.ownerId,
    metadata,
  })
}

//implementation of the nft_transfer method. This transfers the NFT from the current owner to the receiver.
export function internalNftTransfer({
  contract,
  receiverId,
  tokenId,
  approvalId,
  memo,
}: {
  contract: PlanContract
  receiverId: string
  tokenId: string
  approvalId: number
  memo: string
}) {
  /*
      FILL THIS IN
  */
}

//implementation of the transfer call method. This will transfer the NFT and call a method on the receiver_id contract
export function internalNftTransferCall({
  contract,
  receiverId,
  tokenId,
  approvalId,
  memo,
  msg,
}: {
  contract: PlanContract
  receiverId: string
  tokenId: string
  approvalId: number
  memo: string
  msg: string
}) {
  /*
      FILL THIS IN
  */
}

//resolves the cross contract call when calling nft_on_transfer in the nft_transfer_call method
//returns true if the token was successfully transferred to the receiver_id
export function internalResolveTransfer({
  contract,
  authorizedId,
  ownerId,
  receiverId,
  tokenId,
  approvedAccountIds,
  memo,
}: {
  contract: PlanContract
  authorizedId: string
  ownerId: string
  receiverId: string
  tokenId: string
  approvedAccountIds: { [key: string]: number }
  memo: string
}) {
  /*
      FILL THIS IN
  */
}
