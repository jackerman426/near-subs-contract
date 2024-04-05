import { Frequency } from "../types/frequency"

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
    id: string,
    createdAt: string,
  ) {
    this.id = id
    this.name = name
    this.frequency = frequency
    this.amount = amount
    this.createdAt = createdAt
  }
}
