// @ts-nocheck
import { VaultContract } from "."
import { Frequency } from "../../types/frequency"

//defines the payout type we'll be returning as a part of the royalty standards.
export class Payout {
  payout: { [accountId: string]: bigint }
  constructor({ payout }: { payout: { [accountId: string]: bigint } }) {
    this.payout = payout
  }
}

export class NFTMetadata {
  spec: string
  name: string
  frequency: Frequency
  amount: bigint
  symbol: string
  icon?: string
  base_uri?: string
  reference?: string
  reference_hash?: string

  constructor({
    spec,
    name,
    frequency,
    amount,
    symbol,
    icon,
    baseUri,
    reference,
    referenceHash,
  }: {
    spec: string
    name: string
    frequency: Frequency
    amount: bigint
    symbol: string
    icon?: string
    baseUri?: string
    reference?: string
    referenceHash?: string
  }) {
    this.spec = spec // required, essentially a version like "nft-1.0.0"
    this.name = name // required, ex. "Mosaics"
    this.frequency = frequency
    this.amount = amount
    this.symbol = symbol // required, ex. "MOSAIC"
    this.icon = icon // Data URL
    this.base_uri = baseUri // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
    this.reference = reference // URL to a JSON file with more info
    this.reference_hash = referenceHash // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
  }
}

export class TokenMetadata {
  title?: string
  description?: string
  media?: string
  media_hash?: string
  copies?: number
  issued_at?: string
  expires_at?: string
  starts_at?: string
  updated_at?: string
  extra?: string
  reference?: string
  reference_hash?: string

  constructor({
    title,
    description,
    media,
    mediaHash,
    copies,
    issuedAt,
    expiresAt,
    startsAt,
    updatedAt,
    extra,
    reference,
    referenceHash,
  }: {
    title?: string
    description?: string
    media?: string
    mediaHash?: string
    copies?: number
    issuedAt?: string
    expiresAt?: string
    startsAt?: string
    updatedAt?: string
    extra?: string
    reference?: string
    referenceHash?: string
  }) {
    this.title = title // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    this.description = description // free-form description
    this.media = media // URL to associated media, preferably to decentralized, content-addressed storage
    this.media_hash = mediaHash // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    this.copies = copies // number of copies of this set of metadata in existence when token was minted.
    this.issued_at = issuedAt // ISO 8601 datetime when token was issued or minted
    this.expires_at = expiresAt // ISO 8601 datetime when token expires
    this.starts_at = startsAt // ISO 8601 datetime when token starts being valid
    this.updated_at = updatedAt // ISO 8601 datetime when token was last updated
    this.extra = extra // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    this.reference = reference // URL to an off-chain JSON file with more info.
    this.reference_hash = referenceHash // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
  }
}

export class Token {
  ownerId: string

  constructor({ ownerId }: { ownerId: string }) {
    //owner of the token
    this.ownerId = ownerId
  }
}

//The Json token is what will be returned from view calls.
export class JsonToken {
  tokenId: string
  ownerId: string
  metadata: TokenMetadata

  constructor({
    tokenId,
    ownerId,
    metadata,
  }: {
    tokenId: string
    ownerId: string
    metadata: TokenMetadata
  }) {
    //token ID
    ;(this.tokenId = tokenId),
      //owner of the token
      (this.ownerId = ownerId),
      //token metadata
      (this.metadata = metadata)
  }
}

//get the information for a specific token ID
export function internalNftMetadata({
  contract,
}: {
  contract: VaultContract
}): NFTMetadata {
  return contract.metadata
}
