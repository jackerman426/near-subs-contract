import { Worker, NearAccount, BN, NEAR } from "near-workspaces"
import anyTest, { TestFn } from "ava"
import { utils } from "near-api-js"
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

  // const factory = await root.createSubAccount("factory", {
  //   initialBalance: utils.format.parseNearAmount("500"),
  // })

  const availableBalance = await root.availableBalance()
  const availableBalanceHuman = availableBalance.toHuman()

  // Get wasm file path from package.json test script in folder above
  const factory = await root.devDeploy(process.argv[2], {
    method: "init",
    args: {},
    initialBalance: NEAR.parse("10_000_000 N"),
  })

  // await factory.call(factory, "init", {})

  const alice = await root.createSubAccount("alice", {
    initialBalance: utils.format.parseNearAmount("100"),
  })

  const bob = await root.createSubAccount("bob", {
    initialBalance: utils.format.parseNearAmount("100"),
  })

  // await root.call(factory, "create_plan", {
  //   name: "Test Monthly Plan",
  //   frequency: 3,
  //   amount: 1,
  // })
  //
  // await root.call(contract, "create_plan", {
  //   name: "Test Weekly Plan",
  //   frequency: 2,
  //   amount: 2,
  // })

  // Save state for test runs, it is unique for each test
  t.context.worker = worker
  t.context.accounts = { root, factory, alice, bob }
})

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error)
  })
})

test("creates a new plan", async (t) => {
  const { alice, factory, bob } = t.context.accounts

  await alice.call(
    factory,
    "create_plan",
    {
      name: "Test Daily Plan",
      frequency: 1,
      amount: 1,
    },
    {
      gas: "100" + "0".repeat(12), //100 Tgas
    },
  )

  const alicePlans = await factory.view("view_plans", {
    accountId: alice.accountId,
  })
  t.is(alicePlans[0].amount, 1)

  await bob.call(
    factory,
    "create_plan",
    {
      name: "Test Monthly Plan",
      frequency: 3,
      amount: 3,
    },
    {
      gas: "100" + "0".repeat(12), //100 Tgas
    },
  )

  const bobPlans = await factory.view("view_plans", {
    accountId: bob.accountId,
  })
  t.is(bobPlans[0].amount, 3)
})

// test("creates a new plan and get plans", async (t) => {
//   const { root, contract } = t.context.accounts
//   await root.call(contract, "createPlan", {
//     name: "Test Daily Plan",
//     frequency: 1,
//     amount: 3,
//   })
//   const plans: Plan[] = await contract.view("getPlans", {
//     accountId: root.accountId,
//   })
//   t.is(plans[0].amount, 1)
//   t.is(plans[1].amount, 2)
//   t.is(plans[2].amount, 3)
// })
//
// test("subscribes to plan and get subscriptions", async (t) => {
//   const { root, contract, alice } = t.context.accounts
//
//   const plans: Plan = await contract.view("getPlans", {
//     accountId: root.accountId,
//   })
//   console.log(JSON.stringify(plans))
//   // Get the current date
//   const currentDate = new Date()
//   currentDate.setMonth(currentDate.getMonth() + 2)
//   console.log(`currentDate: ${currentDate.toISOString()}`)
//   await alice.call(contract, "subscribeToPlan", {
//     planId: plans[0].id,
//     endDate: currentDate.getTime(),
//   })
//   const subscriptions: Subscription[] = await contract.view(
//     "getSubscriptions",
//     {
//       accountId: alice.accountId,
//     },
//   )
//   t.is(subscriptions[0].planId, plans[0].id)
//
//   await alice.call(contract, "subscribeToPlan", {
//     planId: plans[1].id,
//     endDate: currentDate.getTime(),
//   })
//
//   await alice
//     .call(contract, "subscribeToPlan", {
//       planId: plans[1].id,
//       endDate: currentDate.getTime(),
//     })
//     .catch(() => {})
// })
