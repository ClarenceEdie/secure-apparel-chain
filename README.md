# Production Delta - FHE Encrypted Analytics

A Fully Homomorphic Encryption (FHE) based production difference tracking system. This system allows you to track encrypted production values and calculate the difference between today and yesterday without revealing the actual production numbers.

## 🚀 Live Demo

- **Web Application**: [https://clothing-git-main-waws-projects-2bccbfbd.vercel.app/](https://clothing-git-main-waws-projects-2bccbfbd.vercel.app/) (Latest deployment with yellow theme)
- **Production Domain**: [https://clothing.vercel.app/](https://clothing.vercel.app/) (Recommended - auto-updates to latest)
- **Demo Video**: [https://github.com/ClarenceEdie/secure-apparel-chain/blob/main/clothing.mp4](https://github.com/ClarenceEdie/secure-apparel-chain/blob/main/clothing.mp4)
- **Testnet Contract**: `0x3585B7E5Cfe9d31000009E3efc8Eb77aee55246f` (Sepolia)

## Features

- 🔒 **Encrypted Production Tracking**: Store yesterday's and today's production values in encrypted form
- 📊 **Privacy-Preserving Calculations**: Calculate the difference (delta) between production values without decrypting individual values
- 🔓 **Selective Decryption**: Decrypt only the delta result to see the trend without exposing actual production numbers
- 🌈 **Rainbow Wallet Integration**: Connect using Rainbow wallet for a modern Web3 experience
- ⚡ **Batch Operations**: Submit both production values simultaneously
- 🎛️ **Access Control**: Owner-based authorization with emergency stop functionality
- 📈 **Advanced Analytics**: Growth percentage calculation and production trend analysis
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices
- 🎨 **Modern UI**: Animated gradients and glass effects for enhanced user experience

## Business Use Case

**Scenario**: Production is sensitive information, but you only want to know the trend.

**Flow**:
1. Upload yesterday and today production (encrypted)
2. Backend calculates: `delta = today - yesterday`
3. Frontend decrypts only the delta

**Result**: "Today is 180 units more than yesterday"  
🔒 But the system doesn't know yesterday or today's real numbers.

## 🔗 Testnet Deployment

The contract has been deployed on Sepolia testnet for testing:

- **Network**: Sepolia Testnet
- **Contract Address**: `0x3585B7E5Cfe9d31000009E3efc8Eb77aee55246f`
- **Chain ID**: 11155111
- **Block Explorer**: [Etherscan Sepolia](https://sepolia.etherscan.io/address/0x3585B7E5Cfe9d31000009E3efc8Eb77aee55246f)

## Troubleshooting

### Common Issues

#### FHEVM Initialization Failed
If you see "FHEVM Initialization Failed":
- **On Sepolia**: Ensure the relayer service at `relayer.testnet.zama.cloud` is available
- **On Local**: Use Hardhat node with FHEVM mock mode (`npm run node:fhevm`)
- **Network Issues**: Check your internet connection and try again

#### Wallet Connection Issues
- Ensure Rainbow wallet extension is installed and updated
- Try refreshing the page and reconnecting
- Check if you're on the correct network (Sepolia for testnet, Localhost for development)

#### Transaction Failures
- **Insufficient Gas**: Increase gas limit in wallet settings
- **Network Congestion**: Try again later or use a different network
- **Contract Errors**: Check browser console for detailed error messages

#### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Clear cache with `npm run clean` and rebuild
- Check Node.js version compatibility (requires v20+)

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **Rainbow Wallet**: Browser extension installed

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   ```

2. **Copy FHEVM internal files** (See SETUP_INSTRUCTIONS.md for details)

   ```bash
   # Copy FHEVM internal files from template
   cp -r ../fhevm-hardhat-template旧/frontend/fhevm/internal frontend/fhevm/
   cp ../fhevm-hardhat-template旧/frontend/fhevm/useFhevm.tsx frontend/fhevm/
   ```

3. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

4. **Compile contracts**

   ```bash
   npm run compile
   ```

5. **Run tests**

   ```bash
   npm run test
   ```

6. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node (in one terminal)
   npx hardhat node
   
   # Deploy (in another terminal)
   npx hardhat deploy --network localhost
   ```

7. **Generate ABI for frontend**

   ```bash
   cd frontend
   npm run genabi
   ```

8. **Start frontend**

   ```bash
   npm run dev
   ```

9. **Add custom logo** (Optional)

   - Replace `frontend/public/logo.png` with your custom logo (60x60px or larger)
   - Replace `frontend/public/favicon.ico` with your custom favicon

## Project Structure

```
pro27/
├── contracts/              # Smart contract source files
│   └── ProductionDelta.sol # Main contract for production tracking
├── deploy/                 # Deployment scripts
├── tasks/                  # Hardhat custom tasks
├── test/                   # Test files
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/             # React hooks
│   └── fhevm/             # FHEVM integration
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run test:sepolia` | Run tests on Sepolia |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## Contract Functions

### ProductionDelta.sol

#### Core Production Functions
- `setYesterdayProduction(uint32 encrypted, bytes proof)` - Store encrypted yesterday production
- `setTodayProduction(uint32 encrypted, bytes proof)` - Store encrypted today production
- `setBothProductions(uint32 yesterday, uint32 today, bytes yesterdayProof, bytes todayProof)` - Batch set both values
- `calculateDelta()` - Calculate delta = today - yesterday (encrypted)
- `getYesterdayProduction()` - Get encrypted yesterday value
- `getTodayProduction()` - Get encrypted today value
- `getDelta()` - Get encrypted delta value

#### Analysis Functions
- `isProductionIncreased()` - Check if production grew (returns bool)
- `getGrowthPercentage()` - Calculate encrypted growth percentage
- `getProductionChangeStatus()` - Get detailed production change status (0=no data, 1=decreased, 2=stable, 3=increased)
- `validateProductionData()` - Validate that both values are set and > 0
- `getLastCalculatedDelta()` - Get last calculated delta value
- `getLastUpdateInfo()` - Get timestamp and updater of last calculation
- `getContractStatistics()` - Get comprehensive contract statistics including authorized users count and data validation status

#### Access Control Functions
- `authorizeUser(address user)` - Authorize user for operations (owner only)
- `revokeUser(address user)` - Revoke user authorization (owner only)
- `isAuthorized(address user)` - Check if user is authorized
- `emergencyStop()` - Activate emergency stop mode (owner only)
- `resumeOperations()` - Resume normal operations (owner only)
- `getContractStatus()` - Get owner address and emergency status

#### Utility Functions
- `resetValues()` - Reset all stored values to zero

## Frontend Usage

1. Connect your Rainbow wallet (top right corner)
2. Enter yesterday's production value (will be encrypted)
3. Enter today's production value (will be encrypted)
4. Click "Calculate Delta" to compute the difference
5. Click "Decrypt Delta" to see the result

The system will display: "Today's production is X units more/less than yesterday" without revealing the actual production numbers.

## Testing

### Local Testing

```bash
npm run test
```

### Sepolia Testing

```bash
# Deploy first
npx hardhat deploy --network sepolia

# Then test
npm run test:sepolia
```

## Customization

### Logo and Favicon

1. Replace `frontend/public/logo.png` with your custom logo (recommended: 60x60px or larger)
2. Replace `frontend/public/favicon.ico` with your custom favicon
3. The logo will appear in the navigation bar and browser tab

### WalletConnect Project ID

Update `frontend/config/wagmi.ts` with your WalletConnect project ID from https://cloud.walletconnect.com

## Recent Updates

### v1.0.0 - Production Ready Release
- ✅ Deployed to Sepolia testnet: `0x3585B7E5Cfe9d31000009E3efc8Eb77aee55246f`
- ✅ Live demo deployed on Vercel: https://clothing-zeta-ashy.vercel.app/
- ✅ Added comprehensive contract statistics and production change status analysis
- ✅ Implemented input validation with value range constraints (1-1,000,000)
- ✅ Enhanced UI with loading animations and real-time status indicators
- ✅ Improved test coverage with emergency stop and validation testing
- ✅ Added ESLint rules for better code quality
- ✅ Integrated CoinMarketCap API for accurate gas cost calculations

### v0.3.0 - Enhanced Analytics & Security
- ✅ Added production growth percentage calculations
- ✅ Implemented comprehensive access control system
- ✅ Added batch operations for improved efficiency
- ✅ Enhanced UI with responsive design and animations
- ✅ Improved error handling and debugging tools
- ✅ Added event logging for all contract operations

## 🤝 Contributing

We welcome contributions to the Production Delta FHE project! Here's how you can contribute:

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/pro27.git`
3. Install dependencies: `npm install`
4. Start development environment: `npm run dev`

### Testing
- Run unit tests: `npm test`
- Run tests on Sepolia: `npm run test:sepolia`
- Check code quality: `npm run lint`

### Deployment
- Deploy to localhost: `npm run deploy:localhost`
- Deploy to Sepolia: `npm run deploy:sepolia`

### Code Standards
- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Use conventional commits for all changes
- Ensure all code is properly documented

## 📜 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for the FHEVM technology
- **Hardhat** for the development framework
- **Rainbow Wallet** for Web3 wallet integration
- **Open-source community** for continuous support and contributions

### v0.2.0 - Advanced Features
- ✅ Batch submission mode in UI
- ✅ Historical tracking and data validation
- ✅ Emergency stop functionality
- ✅ Modern glass-card styling

### v0.1.0 - Initial Release
- ✅ Basic FHE production tracking
- ✅ Rainbow wallet integration
- ✅ Privacy-preserving delta calculations

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [RainbowKit Documentation](https://rainbowkit.com)

## License

This project is licensed under the BSD-3-Clause-Clear License.

---

**Built with ❤️ using Zama FHEVM**
