import { Worker, NearAccount } from "near-workspaces"
import anyTest, { TestFn } from "ava"
import { Plan } from "../../src/models/plan"
import { Subscription } from "../../src/models/subscription"

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

  const alice = await root.createSubAccount("alice")
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2])

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

  // Save state for test runs, it is unique for each test
  t.context.worker = worker
  t.context.accounts = { root, contract, alice }
})

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error)
  })
})

test("creates a new plan and get plans", async (t) => {
  const { root, contract } = t.context.accounts
  await root.call(contract, "createPlan", {
    name: "Test Daily Plan",
    frequency: 1,
    amount: 3,
  })
  const plans: Plan[] = await contract.view("getPlans", {
    accountId: root.accountId,
  })
  t.is(plans[0].amount, 1)
  t.is(plans[1].amount, 2)
  t.is(plans[2].amount, 3)
})

test("subscribes to plan and get subscriptions", async (t) => {
  const { root, contract, alice } = t.context.accounts

  const plans: Plan = await contract.view("getPlans", {
    accountId: root.accountId,
  })
  console.log(JSON.stringify(plans))
  // Get the current date
  const currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() + 2)
  console.log(`currentDate: ${currentDate.toISOString()}`)
  await alice.call(contract, "subscribeToPlan", {
    planId: plans[0].id,
    endDate: currentDate.getTime(),
  })
  const subscriptions: Subscription[] = await contract.view(
    "getSubscriptions",
    {
      accountId: alice.accountId,
    },
  )
  t.is(subscriptions[0].planId, plans[0].id)

  await alice.call(contract, "subscribeToPlan", {
    planId: plans[1].id,
    endDate: currentDate.getTime(),
  })

  await alice
    .call(contract, "subscribeToPlan", {
      planId: plans[1].id,
      endDate: currentDate.getTime(),
    })
    .catch(() => {})
})
