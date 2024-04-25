# NearSubs: NEAR Protocol Subscription Management Contract

Welcome to NearSubs, a solution designed to streamline pass management on the NEAR blockchain. NearSubs leverages the power of smart contracts to offer a decentralized, secure, and efficient platform for managing recurring subscriptions with ease.



## Features

- **Decentralized Subscription Handling**: Create and manage vaults directly on the blockchain, ensuring transparency and security.
- **User-Centric Design**: Each user's vaults are managed individually, providing personalized subscription experiences.
- **Flexible Subscription Models**: Supports various pass frequencies (Hourly, Daily, Weekly, Monthly, Yearly), catering to diverse business needs and customer preferences.
- **Automated Vault Management**: Smart contracts automate critical aspects of vault management

<br />

# Quickstart

1. Make sure you have installed [node.js](https://nodejs.org/en/download/package-manager/) >= 16.
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />

## 1. Install dependencies

  ```bash
  npm install
  ```

<br />


## 2. Build and Deploy the Contract

Ensure you have NEAR CLI installed and are logged into your NEAR account.

  ```bash
  npm install
  npm run build
  ```
Deploy the contract to the testnet or mainnet (not a good idea yet!):
  ```bash
  near deploy --accountId your-account.testnet --wasmFile out/NearSubs.wasm
  ```

<br />

## 4. Explore the Contract
Create a vault:
  ```
  near call your-account.testnet create_vault '{"name": "Test Plan", "frequency": "Monthly", "amount": 10}' --accountId your-account.testnet
  ```
Retrieve vaults:
  ```
  near view your-account.testnet view_vaults_by_account_id '{"accountId": "your-account.testnet"}'
  ```

Subscribe to a vault:
  ```
  near call your-account.testnet mint '{"vaultId": {vaultId}, "endDate": 1742646550}'
  ```

Retrieve passes:
  ```
  near view your-account.testnet get_passes '{"accountId": "your-account.testnet"}'
  ```

<br />

## Contributing

NearSubs welcomes community contributions. Whether it's feature requests, bug reports, or code contributions, all forms of collaboration are welcome.

1. **Fork the Repository** - Click the 'Fork' button on the top right corner of the NearSubs GitHub page.
2. **Create a Pull Request** - After making your changes, submit a pull request to merge your contributions with the main project.

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Acknowledgments

- The NEAR Protocol team for their innovative approach to blockchain development.

## Contact

For support, feedback, or inquiries, please reach out to [reb.jack@pm.me](mailto:reb.jack@pm.me).

Join us in building the future of vault management on the blockchain with NearSubs!
