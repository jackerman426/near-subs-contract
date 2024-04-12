import { near } from "near-sdk-js"
import { PromiseIndex } from "near-sdk-js/lib/utils"

export function createSubAccountAndDeployContract(
  subAccountId: string,
  initialAccountBalance: bigint,
  contractWasmBytes: Uint8Array,
  args: string,
  amount: number | bigint,
  initFunctionGas: number | bigint, // Gas allocated for the init function call
): PromiseIndex {
  let promise = near.promiseBatchCreate(subAccountId)
  near.promiseBatchActionCreateAccount(promise)
  near.promiseBatchActionTransfer(promise, initialAccountBalance)
  near.promiseBatchActionDeployContract(promise, contractWasmBytes)

  near.promiseBatchActionAddKeyWithFullAccess(
    promise,
    near.signerAccountPk(),
    0,
  )

  near.promiseBatchActionFunctionCall(
    promise,
    "init",
    args,
    amount, // Attached deposit for the init call, adjust if needed
    initFunctionGas,
  )

  near.log(`Used gas: ${near.usedGas()}`)
  //
  // Optionally return the promise if you need to chain more actions later
  return promise
}
