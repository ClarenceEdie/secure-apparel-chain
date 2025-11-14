# Deployment Configuration Guide

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# ==================================================
# NETWORK CONFIGURATION
# ==================================================

# Supported networks (mainnet/testnet)
NEXT_PUBLIC_SUPPORTED_CHAINS=11155111,31337,1,137
NEXT_PUBLIC_DEFAULT_CHAIN=11155111

# RPC URLs (optional - falls back to wallet defaults)
NEXT_PUBLIC_SEPOLIA_RPC_URL=
NEXT_PUBLIC_LOCAL_RPC_URL=http://localhost:8545

# ==================================================
# CONTRACT ADDRESSES
# ==================================================

# Sepolia Testnet
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x3585B7E5Cfe9d31000009E3efc8Eb77aee55246f

# Local Hardhat
NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=0x5FbDB2315678afecb367f032d93F642f64180aa3

# ==================================================
# FHEVM CONFIGURATION
# ==================================================

# FHEVM Relayer URLs
NEXT_PUBLIC_FHEVM_RELAYER_SEPOLIA=https://relayer.testnet.zama.cloud
NEXT_PUBLIC_FHEVM_RELAYER_LOCAL=

# FHEVM ACL Contract Addresses
NEXT_PUBLIC_ACL_SEPOLIA=0xFee8407e2f5e3Ee68ad64c6ae7a36db1d4d4a457
NEXT_PUBLIC_ACL_LOCAL=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# ==================================================
# WALLET CONFIGURATION
# ==================================================

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# ==================================================
# APPLICATION CONFIGURATION
# ==================================================

# Application settings
NEXT_PUBLIC_APP_NAME="Secure Apparel Chain"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Feature flags
NEXT_PUBLIC_ENABLE_ADVANCED_STATS=true
NEXT_PUBLIC_ENABLE_BATCH_MODE=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# ==================================================
# DEVELOPMENT SETTINGS
# ==================================================

# Only used in development
MNEMONIC="test test test test test test test test test test test junk"
INFURA_API_KEY=
ETHERSCAN_API_KEY=
```

## Network Configuration

### Supported Networks

- **Sepolia Testnet** (11155111): Primary test network with FHEVM support
- **Local Hardhat** (31337): Development network for local testing
- **Ethereum Mainnet** (1): Production deployment
- **Polygon** (137): Alternative L2 deployment

### FHEVM Setup

1. **Sepolia Testnet**: Uses Zama's relayer service
2. **Local Hardhat**: Requires local FHEVM node setup

## Contract Deployment

### Prerequisites

1. Install dependencies: `npm install`
2. Set up environment variables
3. Configure wallet with testnet ETH

### Deployment Steps

```bash
# Compile contracts
npm run compile

# Deploy to local network
npx hardhat deploy --network localhost

# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Frontend Configuration

### WalletConnect Setup

1. Create project at [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Add Project ID to environment variables
3. Configure supported chains in `config/wagmi.ts`

### FHEVM Integration

The application automatically detects and configures FHEVM based on the connected network. Ensure the relayer service is available for testnet usage.

## Security Considerations

- Never commit `.env` files to version control
- Use hardware wallets for mainnet deployments
- Regularly rotate API keys and private keys
- Monitor contract events and gas usage
- Implement proper access controls in production
