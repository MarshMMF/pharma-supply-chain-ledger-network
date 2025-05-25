# Pharma Ledger Network

A blockchain-based pharmaceutical supply chain tracking system built on Hyperledger Fabric.

## Overview

Pharma Ledger Network is a decentralized application that enables tracking of pharmaceutical equipment throughout the supply chain from manufacturers to pharmacies through wholesalers. The system provides immutable records of ownership changes and ensures complete traceability and accountability in the pharmaceutical supply chain.

## Features

- Multi-organization network with separate roles (Manufacturer, Wholesaler, Pharmacy)
- Equipment creation and tracking through the supply chain
- Ownership transfer with immutable history
- Secure identity management through wallets
- Queryable transaction history

## System Requirements

- Linux
- Docker and Docker Compose
- Node.js
- Go
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
npm i

cd ../../wholesaler/application
npm i

cd ../../pharmacy/application
npm i
```

### Step 5: Start the Applications

Open three separate terminal windows:

Terminal 1 (Manufacturer):
```bash
cd organizations/manufacturer/application
node app.js
```

Terminal 2 (Wholesaler):
```bash
cd organizations/wholesaler/application
node app.js
```

Terminal 3 (Pharmacy):
```bash
cd organizations/pharmacy/application
node app.js
```
