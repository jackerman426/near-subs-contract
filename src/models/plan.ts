import { near } from "near-sdk-js"
import { Frequency } from "../types/frequency"
import { generateUniqueId } from "../utils/generator"
import { Prefix } from "../types/prefix"

export class Plan {
  id: string
  name: string
  frequency: Frequency
  amount: number
  createdAt: string

  constructor(
    name: string,
    frequency: Frequency,
    amount: number,
    accountId: string,
  ) {
    this.id = generateUniqueId(accountId, Prefix.Plan)
    this.name = name
    this.frequency = frequency
    this.amount = amount
    this.createdAt = near.blockHeight().toString()
  }
}
