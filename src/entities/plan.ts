import { NearBindgen, assert, near } from "near-sdk-js"
import { Frequency } from "../types/frequency"
export class Plan {
  id: string
  name: string
  frequency: Frequency
  amount: number

  constructor(
    name: string,
    frequency: Frequency,
    amount: number,
    accountId: string,
  ) {
    assert(name.length > 0, "Plan name cannot be empty")
    assert(amount > 0, "Amount must be greater than 0.")
    this.id = generateUniqueId(accountId)
    this.name = name
    this.frequency = frequency
    this.amount = amount
  }
}

//TODO: If necessary, incorporate additional elements into the ID (e.g., a counter, timestamp, or transaction hash) to guarantee uniqueness.
function generateUniqueId(accountId: string) {
  const title = accountId.substring(0, accountId.lastIndexOf("."))
  return `${title}-${near.blockIndex().toString()}`
}
