# NearSubs: NEAR Protocol Subscription Management Contract

Welcome to NearSubs, a solution designed to streamline subscription management on the NEAR blockchain. NearSubs leverages the power of smart contracts to offer a decentralized, secure, and efficient platform for managing recurring subscriptions with ease.



## Features

- **Decentralized Subscription Handling**: Create and manage subscription plans directly on the blockchain, ensuring transparency and security.
- **User-Centric Design**: Each user's subscription plans are managed individually, providing personalized subscription experiences.
- **Flexible Subscription Models**: Supports various subscription frequencies (Hourly, Daily, Weekly, Monthly, Yearly), catering to diverse business needs and customer preferences.
- **Automated Plan Management**: Smart contracts automate critical aspects of subscription management

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
Create a subscription plan:
  ```
  near call your-account.testnet createPlan '{"name": "Test Plan", "frequency": "Monthly", "amount": 10}' --accountId your-account.testnet
  ```
Retrieve subscription plans:
  ```
  near view your-account.testnet getPlans '{"accountId": "your-account.testnet"}'
  ```

Subscribe to a plan:
  ```
  near call your-account.testnet subscribeToPlan '{"planId": {planId}, "endDate": 1742646550}'
  ```

Retrieve subscriptions:
  ```
  near view your-account.testnet getSubscriptions '{"accountId": "your-account.testnet"}'
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

Join us in building the future of subscription management on the blockchain with NearSubs!
