import { assert, initialize, NearBindgen, view } from "near-sdk-js"
import { Frequency } from "../types/frequency"

@NearBindgen({ requireInit: true })
class PlanContract {
  name: string = "Default name"
  frequency: Frequency = Frequency.Daily
  amount: bigint = BigInt(0)

  @initialize({ privateFunction: true }) //this ensures that the method in only callable by the contract's account
  init({
    name,
    frequency,
    amount,
  }: {
    name: string
    frequency: Frequency
    amount: bigint
  }) {
    this.name = name
    this.frequency = frequency
    this.amount = amount
  }

  @view({})
  get_name({}) {
    return this.name
  }
}
