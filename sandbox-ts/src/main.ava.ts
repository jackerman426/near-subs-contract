import { Worker, NearAccount, NEAR } from "near-workspaces"
import anyTest, { TestFn } from "ava"
import { utils } from "near-api-js"

interface JsonToken {
  ownerId: string
  tokenId: string
}

const TEST_NFT_NAME = "Jack nft purchase"

const test = anyTest as TestFn<{
  worker: Worker
  accounts: Record<string, NearAccount>
}>

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Deploy contract
  const root = worker.rootAccount

  const availableBalance = await root.availableBalance()
  const availableBalanceHuman = availableBalance.toHuman()

  // Get wasm file path from package.json test script in folder above
  const factory = await root.devDeploy(process.argv[2], {
    method: "init",
    args: {},
    initialBalance: NEAR.parse("10_000_000 N"),
  })

  const alice = await root.createSubAccount("alice", {
    initialBalance: utils.format.parseNearAmount("100"),
  })

  const bob = await root.createSubAccount("bob", {
    initialBalance: utils.format.parseNearAmount("100"),
  })

  const jack = await root.createSubAccount("jack", {
    initialBalance: utils.format.parseNearAmount("100"),
  })

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

  // Save state for test runs, it is unique for each test
  t.context.worker = worker
  t.context.accounts = { root, factory, alice, bob, jack }
})

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error)
  })
})

test("creates a new plan", async (t) => {
  const { factory, bob } = t.context.accounts

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

test("purchase nft - subscribe to a plan", async (t) => {
  const { alice, factory, bob, jack } = t.context.accounts

  const alicePlans = await factory.view("view_plans", {
    accountId: alice.accountId,
  })

  const planId = factory.getAccount(alicePlans[0].id)

  await jack.call(
    planId,
    "nft_mint",
    {
      name: TEST_NFT_NAME,
    },
    {
      gas: "100" + "0".repeat(12), //100 Tgas
      attachedDeposit: "700" + "0".repeat(19),
    },
  )

  await jack.call(
    planId,
    "nft_mint",
    {
      name: TEST_NFT_NAME,
    },
    {
      gas: "100" + "0".repeat(12), //100 Tgas
      attachedDeposit: "700" + "0".repeat(19),
    },
  )

  const nftTokens = (await planId.view("nft_tokens_for_owner", {
    accountId: jack.accountId,
    fromIndex: 0,
    limit: 10,
  })) as JsonToken[]

  t.is(nftTokens.length, 2)
  t.is(nftTokens[0].ownerId, jack.accountId)

  const token = await planId.view("nft_token", {
    tokenId: nftTokens[0].tokenId,
  })

  await bob.call(
    planId,
    "nft_mint",
    {
      name: "Bob first nft purchase",
    },
    {
      gas: "100" + "0".repeat(12), //100 Tgas
      attachedDeposit: "700" + "0".repeat(19),
    },
  )

  // const tokens = await fa
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
