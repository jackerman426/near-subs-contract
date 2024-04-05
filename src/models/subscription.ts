import { Status } from "../types/status"
import { generateUniqueNearId } from "../utils/generator"
import { near } from "near-sdk-js"
import { Prefix } from "../types/prefix"

export class Subscription {
  planId: string
  startDate: string
  endDate: string
  status: Status
  id: string
  paymentHistory: []
  constructor(
    planId: string,
    endDate: bigint,
    status: Status,
    accountId: string,
  ) {
    this.planId = planId
    this.startDate = near.blockTimestamp().toString()
    this.endDate = endDate.toString()
    this.status = status
    this.id = generateUniqueNearId(accountId, Prefix.Subscription)
    this.paymentHistory = []
  }

  // Methods to update subscription, record payments, etc.
}
