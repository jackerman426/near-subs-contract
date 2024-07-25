import { Worker, NearAccount, NEAR } from "near-workspaces"
import anyTest, { TestFn } from "ava"
import { utils } from "near-api-js"

interface JsonToken {
  ownerId: string
  tokenId: string
}

type FrequencyMap = {
  [key: number]: string
}

const TEST_NFT_NAME = "Jack nft purchase"

const test = anyTest as TestFn<{
  worker: Worker
  accounts: Record<string, NearAccount>
  frequencyMap: FrequencyMap
}>

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Deploy contract
  const root = worker.rootAccount

  // Get wasm file path from package.json test script in folder above
  const factory = await root.devDeploy(process.argv[2], {
    method: "init",
    args: {},
    // initialBalance: NEAR.parse("10_000_000 N"),
    initialBalance: NEAR.parse("10_000 N"),
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

  const frequencyMap = (await factory.view(
    "view_frequency_map",
  )) as FrequencyMap

  await alice.call(
    factory,
    "create_vault",
    {
      name: "Test Daily Plan",
      frequency: getKeyByValue(frequencyMap, "Daily"),
      amount: 1,
    },
    {
      gas: "200" + "0".repeat(12), //100 Tgas
      // attachedDeposit: "700" + "0".repeat(19), //0.007 NEAR
      attachedDeposit: "7" + "0".repeat(24), //7 NEAR
    },
  )

  // Save state for test runs, it is unique for each test
  t.context.worker = worker
  t.context.frequencyMap = frequencyMap
  t.context.accounts = { root, factory, alice, bob, jack }
})

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error)
  })
})

test("creates a new vault", async (t) => {
  const { factory, bob, alice } = t.context.accounts
  const frequencyMap = t.context.frequencyMap

  await bob.call(
    factory,
    "create_vault",
    {
      name: "Test Monthly Plan",
      frequency: getKeyByValue(frequencyMap, "Monthly"),
      amount: 3,
    },
    {
      gas: "200" + "0".repeat(12), //100 Tgas
      attachedDeposit: "7" + "0".repeat(24), //7 NEAR
    },
  )

  const bobVaults = await factory.view("view_vaults_by_account_id", {
    accountId: bob.accountId,
  })
  t.is(bobVaults[0].amount, 3)

  const totalVaults = await factory.view("view_vaults")
  t.is(totalVaults[0].accountId, alice.accountId)
})

test("purchase nft - subscribe to a vault", async (t) => {
  const { alice, factory, bob, jack } = t.context.accounts

  const aliceVaults = await factory.view("view_vaults_by_account_id", {
    accountId: alice.accountId,
  })

  const vaultId = factory.getAccount(aliceVaults[0].id)

  await jack.call(
    vaultId,
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
    vaultId,
    "nft_mint",
    {
      name: TEST_NFT_NAME,
    },
    {
      gas: "100" + "0".repeat(12), //100 Tgas
      attachedDeposit: "700" + "0".repeat(19),
    },
  )

  const nftTokens = (await vaultId.view("nft_tokens_for_owner", {
    accountId: jack.accountId,
    fromIndex: 0,
    limit: 10,
  })) as JsonToken[]

  t.is(nftTokens.length, 2)
  t.is(nftTokens[0].ownerId, jack.accountId)

  const token = await vaultId.view("nft_token", {
    tokenId: nftTokens[0].tokenId,
  })

  await bob.call(
    vaultId,
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

function getKeyByValue(map: FrequencyMap, value: string): number | undefined {
  for (const [key, val] of Object.entries(map)) {
    if (val === value) {
      return Number(key)
    }
  }
  return undefined // Return undefined if the value is not found
}
