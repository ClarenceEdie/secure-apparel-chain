# Production Delta - FHE Encrypted Analytics FHE

A Fully Homomorphic Encryption (FHE) based production difference tracking system. This system allows you to track encrypted production values and calculate the difference between today and yesterday without revealing the actual production numbers.

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
- `validateProductionData()` - Validate that both values are set and > 0
- `getLastCalculatedDelta()` - Get last calculated delta value
- `getLastUpdateInfo()` - Get timestamp and updater of last calculation

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

### v0.3.0 - Enhanced Analytics & Security
- ✅ Added production growth percentage calculations
- ✅ Implemented comprehensive access control system
- ✅ Added batch operations for improved efficiency
- ✅ Enhanced UI with responsive design and animations
- ✅ Improved error handling and debugging tools
- ✅ Added event logging for all contract operations

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
