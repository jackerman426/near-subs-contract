import {
  assert,
  call,
  initialize,
  LookupMap,
  near,
  NearBindgen,
  UnorderedMap,
  view,
} from "near-sdk-js"
import { Frequency } from "../../types/frequency"
import { NFTMetadata } from "./metadata"
import { internalMint } from "./mint"
import { internalNftToken } from "./nft_core"
import { internalTokensForOwner } from "./enumeration"
import {
  REQUIRED_GAS_FOR_MINT,
  REQUIRED_GAS_FOR_NEW_PLAN,
} from "../../constants"

/// This spec can be treated like a version of the standard.
export const NFT_METADATA_SPEC = "nft-1.0.0"

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171"

@NearBindgen({ requireInit: true })
export class PlanContract {
  ownerId: string = ""
  tokenIdCounter: number = 0
  tokensPerOwner: LookupMap<any>
  tokensById: LookupMap<string>
  tokenMetadataById: UnorderedMap<string>
  createdAt: string
  metadata: NFTMetadata = {
    spec: NFT_METADATA_SPEC,
    name: "Default name",
    frequency: Frequency.Daily,
    amount: BigInt(0),
    symbol: "GOTEAM",
  }

  constructor() {
    this.tokensPerOwner = new LookupMap("tokensPerOwner")
    this.tokensById = new LookupMap("tokensById")
    this.tokenMetadataById = new UnorderedMap("tokenMetadataById")
    this.createdAt = near.blockTimestamp().toString()
  }
  default() {
    return new PlanContract()
  }

  @initialize({ privateFunction: true }) //this ensures that the method in only callable by the contract's account
  init({ ownerId, metadata }: { ownerId: string; metadata: NFTMetadata }) {
    near.log(`ownerId: ${ownerId}`)
    near.log(`metadata: ${JSON.stringify(metadata)}`)
    this.ownerId = ownerId
    this.metadata = metadata
  }

  /*
        MINT
    */
  @call({ payableFunction: true })
  nft_mint({ name }: { name: string }) {
    this.tokenIdCounter += 1
    this.metadata.name = name
    near.log(`tokenIdCounter: ${this.tokenIdCounter}`)
    near.log(`nft name: ${this.metadata.name}`)
    near.log(`attachedDeposit: ${near.attachedDeposit().valueOf()}`)
    assert(
      near.prepaidGas() >= REQUIRED_GAS_FOR_MINT,
      "Please attach at least 100TGas",
    )
    return internalMint({
      contract: this,
      tokenId: this.tokenIdCounter.toString(),
      metadata: this.metadata,
      receiverId: near.predecessorAccountId(),
      // perpetualRoyalties: perpetual_royalties,
    })
  }

  /*
        CORE
    */
  @view({})
  //get the information for a specific token ID
  nft_token({ tokenId }: { tokenId: string }) {
    return internalNftToken({ contract: this, tokenId })
  }

  @view({})
  //get the total supply of NFTs for a given owner
  nft_tokens_for_owner({
    accountId,
    fromIndex,
    limit,
  }: {
    accountId: string
    fromIndex: number
    limit: number
  }) {
    return internalTokensForOwner({
      contract: this,
      accountId,
      fromIndex,
      limit,
    })
  }
}
