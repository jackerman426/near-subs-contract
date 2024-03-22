//TODO: If necessary, incorporate additional elements into the ID (e.g., a counter, timestamp, or transaction hash) to guarantee uniqueness.
import { near } from "near-sdk-js"
import { Prefix } from "../types/prefix"

export function generateUniqueId(accountId: string, prefix: Prefix) {
  const title = accountId.substring(0, accountId.lastIndexOf("."))
  return `${prefix}-${title}-${near.blockIndex().toString()}`
}
