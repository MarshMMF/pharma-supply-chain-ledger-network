# Pharma Ledger Network

A blockchain-based pharmaceutical supply chain tracking system built on Hyperledger Fabric.

## Overview

Pharma Ledger Network is a decentralized application that enables tracking of pharmaceutical equipment throughout the supply chain from manufacturers to pharmacies through wholesalers. The system provides immutable records of ownership changes and ensures complete traceability and accountability in the pharmaceutical supply chain.

## Features

- Multi-organization network with separate roles (Manufacturer, Wholesaler, Pharmacy)
- Equipment creation and tracking through the supply chain
- Ownership transfer with immutable history
- Modern, responsive UI for each organization
- Secure identity management through wallets
- Queryable transaction history

## System Requirements

- Ubuntu 18.04 or higher / macOS 10.15+ / Windows 10 with WSL2
- Docker and Docker Compose
- Node.js v12.x or v14.x
- npm 6.x or higher
- Go 1.14.x or higher
- Hyperledger Fabric 2.x

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/pharma-ledger-network.git
cd pharma-ledger-network
```

### Step 2: Set up Hyperledger Fabric

Make sure you have Hyperledger Fabric prerequisites installed:

```bash
# Install prerequisites
sudo apt update
sudo apt install -y git curl docker.io docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Test Docker
docker --version
docker-compose --version
```

### Step 3: Download Fabric Binaries and Start the Network

```bash
# Download Fabric binaries and Docker images
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s -- 2.1.0 1.4.7 0.4.20

# Copy binaries and config to the current directory
cp -R fabric-samples/bin .
cp -R fabric-samples/config .

# Start the network and create artifacts
./net-pln.sh up

# Create the channel
./createChannel.sh

# Deploy the smart contracts
./deploySmartContract.sh
```

These steps will:
- Download Fabric binaries and Docker images (version 2.1.0)
- Set up the necessary configuration files
- Start all the necessary containers
- Create the channel
- Deploy the chaincode for all organizations
- Set up the network for use

### Step 4: Install Application Dependencies

```bash
# Install dependencies for all organizations
cd organizations/manufacturer/application
npm install

cd ../../wholesaler/application
npm install

cd ../../pharmacy/application
npm install
```

### Step 5: Start the Applications

Open three separate terminal windows:

Terminal 1 (Manufacturer):
```bash
cd organizations/manufacturer/application
npm start
```

Terminal 2 (Wholesaler):
```bash
cd organizations/wholesaler/application
npm start
```

Terminal 3 (Pharmacy):
```bash
cd organizations/pharmacy/application
npm start
```

The applications will be available at:
- Manufacturer: http://localhost:30000
- Wholesaler: http://localhost:30001
- Pharmacy: http://localhost:30002

## Using the Application

### Step 1: Add User to Wallet

For each organization:
1. Navigate to the organization's URL
2. Click "Add To Wallet" in the sidebar
3. Enter a username (e.g., "Admin" for Manufacturer, "John" for Wholesaler, "Steve" for Pharmacy)
4. Click "Add User"

### Step 2: Track Equipment Through Supply Chain

1. In the Manufacturer application:
   - Navigate to "Make Equipment"
   - Fill in equipment details (number, name, manufacturer, owner)
   - Click "Make Equipment"

2. In the Wholesaler application:
   - Navigate to "Wholesaler Received"
   - Enter the same equipment number and a new owner name
   - Click "Receive Equipment"

3. In the Pharmacy application:
   - Navigate to "Receive Equipment"
   - Enter the same equipment number and a new owner name
   - Click "Receive Equipment"

### Step 3: Query Equipment Details

In any organization:
1. Navigate to "Query"
2. Enter the equipment number
3. Click "Query"

### Step 4: View Transaction History

In any organization:
1. Navigate to "Query History"
2. Enter the equipment number
3. Click "Query History"

## Shutting Down

To stop the applications, press Ctrl+C in each terminal window.

To shut down the network:

```bash
# Shut down the Fabric network
./net-pln.sh down
```

## Troubleshooting

### Common Issues

1. **Wallet not found error**:
   - Ensure you've added a user to the wallet first
   - For pharmacy operations, "Steve" must be added to the wallet

2. **Connection errors**:
   - Check if the Fabric network is running with `docker ps`
   - Ensure the channel was created successfully
   - Verify chaincode was deployed with `docker logs chaincode-container-name`

3. **Identity issues**:
   - Delete the wallet folders and recreate identities

4. **Network start issues**:
   - Make sure to run the commands in the correct order as listed in Step 3
   - If errors occur, try bringing the network down with `./net-pln.sh down` and starting again
   - Check Docker logs for specific error messages

## Project Structure

```
pharma-ledger-network/
├── bin/                # Fabric binaries
├── config/             # Fabric configuration files
├── organizations/
│   ├── manufacturer/
│   │   ├── application/
│   │   └── contract/
│   ├── wholesaler/
│   │   ├── application/
│   │   └── contract/
│   ├── pharmacy/
│   │   ├── application/
│   │   └── contract/
│   └── orderer/
├── net-pln.sh          # Script to start/stop the network
├── createChannel.sh    # Script to create the channel
└── deploySmartContract.sh # Script to deploy the smart contracts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on Hyperledger Fabric Samples
- Developed as part of "Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2" by O'Reilly 