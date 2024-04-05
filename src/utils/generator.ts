//TODO: If necessary, incorporate additional elements into the ID (e.g., a counter, timestamp, or transaction hash) to guarantee uniqueness.
import { near } from "near-sdk-js"
import { Prefix } from "../types/prefix"

export function generateUniqueSubAccountNearId(
  currentAccountId: string,
  predecessorAccountId: string,
  blockIndex: string,
  prefix: Prefix,
) {
  const title = predecessorAccountId.substring(
    0,
    predecessorAccountId.indexOf("."),
  )
  return `${prefix}-${title}-${blockIndex}.${currentAccountId}`
}
