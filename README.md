# KadPad: The Home of Token Launches on Kadena
<p align="center">
  <img src="/public/kadpad-bg.jpg" alt="KadPad Logo" width="500"/>
</p>
<p align="center">
  <strong>Empowering the Kadena ecosystem with innovative token launch solutions.</strong>
</p>
<p align="center">
  <a href="#features">Features</a> •
  <a href="#staking-system">Staking System</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License: AGPL-3.0">
</p>

## Features
🚀 **Token Launches**: Seamlessly launch your tokens on the Kadena blockchain.  
💼 **Project Management**: Easily manage and monitor your token sale projects.  
👥 **Whitelist Management**: Efficiently handle whitelisting for presales.  
📊 **Real-time Analytics**: Track your token sale progress with live updates.  
🔒 **Secure Transactions**: Leverage Kadena's blockchain for secure and transparent transactions.  
🌐 **Cross-Chain Compatibility**: Take advantage of Kadena's multi-chain architecture.  
🎯 **Staking System**: Stake $KPAD tokens to secure IDO allocations across three tiers.

## Staking System

**[📊 View Complete Staking Flow Diagram](./STAKING_FLOW.md)**

KadPad's staking system rewards long-term commitment with exclusive IDO access. Stake your $KPAD tokens to participate in promising new projects on Kadena.

### Staking Tiers

| Tier | Requirement | Lockup Period | IDO Benefit |
|------|-------------|---------------|-------------|
| 🟤 **Node** | 50,000 $KPAD | 1 Year | 10 random allocation spots |
| 🥈 **Cluster** | 150,000 $KPAD | 1 Year | 25 random allocation spots |
| 🥇 **Chainweb** | 350,000 $KPAD | 1 Year | **Guaranteed allocation** + Premium perks |

### Key Benefits
- **IDO Eligibility**: Only stakers can participate in IDO launches
- **Fair Distribution**: Transparent random selection for Node and Cluster tiers
- **Guaranteed Access**: Chainweb tier members never miss an opportunity
- **Premium Perks**: Private/seed round access and direct team communication for Chainweb
- **Long-term Commitment**: 1-year lockup ensures ecosystem stability

### How Allocation Works
- **Node & Cluster**: Random lottery system with odds based on tier participation
- **Chainweb**: Equal allocation division among all members
- **Multiple IDOs**: Remain eligible for all launches during your staking period

## Getting Started
### Prerequisites
- Node.js (v14.0.0 or later)
- Yarn package manager
- A Kadena wallet (e.g., Linx, X-Wallet, Koala)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/kabirdkng/kadpad-new.git
   ```
2. Navigate to the project directory:
   ```
   cd kadpad-new
   ```
3. Install dependencies:
   ```
   yarn install
   ```
4. Create a `.env` file in the root directory and add your environment variables:
   ```
   VITE_APP_API="your API URL"
   ```
   ```
   VITE_APP_ENV="testnet"
   ```
   ```
   VITE_APP_projectId="Your Wallet Connect Project ID"
   ```
   ```
   VITE_APP_relayUrl="wss://relay.walletconnect.com"
   ```
5. Start the development server:
   ```
   yarn dev
   ```

## Usage
1. **Staking $KPAD**:
   - Connect your Kadena wallet
   - Choose your staking tier based on token holdings
   - Confirm 1-year lockup commitment
   - Gain IDO eligibility and tier benefits

2. **Launching a Token**:
   - Navigate to the "Launch" page
   - Fill in your token details
   - Set up your sale parameters
   - Submit for review and approval

3. **Participating in a Sale**:
   - Ensure you have staked $KPAD tokens
   - Go to the "Sales" page
   - Browse ongoing and upcoming sales
   - Connect your Kadena wallet
   - Participate based on your staking tier allocation

4. **Managing Your Project** (for project creators):
   - Access your project dashboard
   - Monitor sale progress
   - Manage whitelists
   - Update project information

## Contributing
We welcome contributions to KadPad! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License
This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

This strong copyleft license ensures that any modifications or derivative works based on KadPad must also be open-sourced under the same license terms, even when the software is run as a network service. This protects our work and ensures that improvements remain accessible to the community.

## Contact
For any queries or support, please reach out to us at:
- Email: support@kadpad.xyz
- Twitter: [@kadpad_official](https://twitter.com/kadpad_official)
- Discord: [Join our community](https://discord.gg/xe5PTEUeDE)

---
<p align="center">
  Made with ❤️ by the KadPad Team
</p>