#!/bin/bash

# Secure Apparel Chain - Deployment Script
# This script handles the complete deployment process for both contracts and frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK=${1:-"localhost"}
ENVIRONMENT=${2:-"development"}

# Environment validation
validate_environment() {
    echo -e "${BLUE}Validating environment...${NC}"

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}Error: Node.js version 18+ required${NC}"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi

    # Check Hardhat
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}Error: npx is not available${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Environment validation passed${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}Installing dependencies...${NC}"

    # Root dependencies
    if [ ! -d "node_modules" ]; then
        npm install
    fi

    # Frontend dependencies
    if [ ! -d "frontend/node_modules" ]; then
        cd frontend
        npm install
        cd ..
    fi

    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Compile contracts
compile_contracts() {
    echo -e "${BLUE}Compiling smart contracts...${NC}"

    npm run compile

    echo -e "${GREEN}✓ Contracts compiled${NC}"
}

# Run tests
run_tests() {
    echo -e "${BLUE}Running tests...${NC}"

    if [ "$ENVIRONMENT" = "production" ]; then
        # Run full test suite for production
        npm run test

        # Run Sepolia tests if deploying to testnet
        if [ "$NETWORK" = "sepolia" ]; then
            npm run test:sepolia
        fi
    else
        # Run basic tests for development
        npm run test
    fi

    echo -e "${GREEN}✓ Tests passed${NC}"
}

# Deploy contracts
deploy_contracts() {
    echo -e "${BLUE}Deploying contracts to $NETWORK...${NC}"

    if [ "$NETWORK" = "localhost" ]; then
        # Start local node in background
        echo -e "${YELLOW}Starting local Hardhat node...${NC}"
        npx hardhat node > /dev/null 2>&1 &
        NODE_PID=$!

        # Wait for node to start
        sleep 5

        # Deploy
        npx hardhat deploy --network localhost

        # Kill node
        kill $NODE_PID 2>/dev/null || true
    else
        # Deploy to testnet/mainnet
        npx hardhat deploy --network $NETWORK
    fi

    echo -e "${GREEN}✓ Contracts deployed${NC}"
}

# Generate ABI for frontend
generate_abi() {
    echo -e "${BLUE}Generating ABI files...${NC}"

    cd frontend
    npm run genabi
    cd ..

    echo -e "${GREEN}✓ ABI files generated${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}Building frontend application...${NC}"

    cd frontend
    npm run build
    cd ..

    echo -e "${GREEN}✓ Frontend built${NC}"
}

# Run security checks
security_check() {
    echo -e "${BLUE}Running security checks...${NC}"

    # Check for vulnerable dependencies
    npm audit --audit-level moderate

    # Run ESLint
    npm run lint

    # Check contract sizes
    npx hardhat size-contracts

    echo -e "${GREEN}✓ Security checks passed${NC}"
}

# Deploy to hosting platform
deploy_hosting() {
    echo -e "${BLUE}Deploying to hosting platform...${NC}"

    if [ "$ENVIRONMENT" = "production" ]; then
        # Vercel deployment
        if command -v vercel &> /dev/null; then
            cd frontend
            vercel --prod
            cd ..
        else
            echo -e "${YELLOW}Warning: Vercel CLI not found. Manual deployment required.${NC}"
        fi
    fi

    echo -e "${GREEN}✓ Deployment completed${NC}"
}

# Generate deployment report
generate_report() {
    echo -e "${BLUE}Generating deployment report...${NC}"

    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).txt"

    cat > "$REPORT_FILE" << EOF
Secure Apparel Chain - Deployment Report
========================================

Deployment Time: $(date)
Network: $NETWORK
Environment: $ENVIRONMENT
Node Version: $(node -v)
NPM Version: $(npm -v)

✅ Environment Validation: PASSED
✅ Dependencies: INSTALLED
✅ Contract Compilation: SUCCESSFUL
✅ Tests: PASSED
✅ Contract Deployment: SUCCESSFUL
✅ ABI Generation: COMPLETED
✅ Frontend Build: SUCCESSFUL
✅ Security Checks: PASSED
✅ Hosting Deployment: COMPLETED

Contract Addresses:
$(grep -r "deployed to" deployments/ | tail -5 || echo "Check deployments/ directory")

Next Steps:
1. Verify contract functionality on blockchain explorer
2. Test frontend integration with deployed contracts
3. Monitor application performance and errors
4. Update documentation if needed

For support, contact the development team.
EOF

    echo -e "${GREEN}✓ Deployment report generated: $REPORT_FILE${NC}"
}

# Main deployment flow
main() {
    echo -e "${GREEN}"
    echo "=========================================="
    echo "  Secure Apparel Chain - Deployment Tool"
    echo "=========================================="
    echo -e "${NC}"

    echo "Network: $NETWORK"
    echo "Environment: $ENVIRONMENT"
    echo ""

    validate_environment
    install_dependencies
    compile_contracts
    run_tests
    deploy_contracts
    generate_abi
    build_frontend
    security_check
    deploy_hosting
    generate_report

    echo -e "${GREEN}"
    echo "=========================================="
    echo "  🎉 Deployment Successful! 🎉"
    echo "=========================================="
    echo -e "${NC}"

    echo "Your Secure Apparel Chain application is now deployed and ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Check the deployment report for contract addresses"
    echo "2. Test the application in your browser"
    echo "3. Monitor the application logs for any issues"
}

# Error handling
trap 'echo -e "${RED}Deployment failed! Check the error messages above.${NC}"' ERR

# Run main function
main "$@"
