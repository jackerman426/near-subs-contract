import { Worker, NearAccount } from "near-workspaces"
import anyTest, { TestFn } from "ava"
import { Plan } from "../../src/entities/plan"

const test = anyTest as TestFn<{
  worker: Worker
  accounts: Record<string, NearAccount>
}>

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Deploy contract
  const root = worker.rootAccount
  const contract = await root.createSubAccount("test-account")
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2])

  // Save state for test runs, it is unique for each test
  t.context.worker = worker
  t.context.accounts = { root, contract }
})

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error)
  })
})

test("creates a new plan", async (t) => {
  const { root, contract } = t.context.accounts
  await root.call(contract, "createPlan", {
    name: "Test Monthly Plan",
    frequency: 3,
    amount: 1,
  })
  await root.call(contract, "createPlan", {
    name: "Test Weekly Plan",
    frequency: 2,
    amount: 2,
  })
  const plans: Plan = await contract.view("getPlans", {
    accountId: "test.near",
  })
  t.is(plans[0].amount, 1)
  t.is(plans[1].amount, 2)
})

// test("returns the default greeting", async (t) => {
//   const { contract } = t.context.accounts
//   const greeting: string = await contract.view("get_greeting", {})
//   t.is(greeting, "Hello")
// })
//
// test("changes the greeting", async (t) => {
//   const { root, contract } = t.context.accounts
//   await root.call(contract, "set_greeting", { greeting: "Howdy" })
//   const greeting: string = await contract.view("get_greeting", {})
//   t.is(greeting, "Howdy")
// })
