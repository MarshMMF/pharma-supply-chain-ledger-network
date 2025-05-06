/*
 # O'Reilly - Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 # farma ledger supply chain network
 */
'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { Wallets } = require('fabric-network');
const path = require('path');
const fixtures = path.resolve(__dirname, '../../../../organizations');

class WalletService {
  async addToWallet(user) {
    try {
      console.log('======== DEBUG INFO ========');
      console.log(`Current directory: ${process.cwd()}`);
      console.log(`__dirname: ${__dirname}`);
      console.log(`Fixtures path resolved to: ${fixtures}`);
      console.log('===========================');
      
      if(!user || user.length<1) {
          throw ({ status: 500,  message: 'User is not defined.' });
      }
        console.log(`Starting wallet creation for user ${user}`);
        // A wallet stores a collection of identities
        const walletPath = path.resolve(__dirname, `../identity/user/${user}/wallet`);
        console.log(`Wallet path: ${walletPath}`);
        
        // Create directory if it doesn't exist
        const walletDir = path.dirname(walletPath);
        if (!fs.existsSync(walletDir)) {
            console.log(`Creating directory: ${walletDir}`);
            fs.mkdirSync(walletDir, { recursive: true });
            console.log(`Created wallet directory at ${walletDir}`);
        }
        
        // Create user-specific directory
        const userDir = path.resolve(__dirname, `../identity/user/${user}`);
        if (!fs.existsSync(userDir)) {
            console.log(`Creating user directory: ${userDir}`);
            fs.mkdirSync(userDir, { recursive: true });
        }
        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet created at: ${walletPath}`);
        
        // Identity to credentials to be stored in the wallet
        const credPath = path.join(fixtures, '/peerOrganizations/org1.example.com/users/User1@org1.example.com');
        console.log(`Certificate path: ${credPath}`);
        
        // Check if files exist
        const certPath = path.join(credPath, '/msp/signcerts/User1@org1.example.com-cert.pem');
        const keyPath = path.join(credPath, '/msp/keystore/priv_sk');
        
        console.log(`Certificate file path: ${certPath}`);
        console.log(`Key file path: ${keyPath}`);
        
        if (!fs.existsSync(certPath)) {
            console.log(`ALERT: Certificate file not found at ${certPath}`);
            throw new Error(`Certificate file not found at ${certPath}`);
        }
        
        if (!fs.existsSync(keyPath)) {
            console.log(`ALERT: Private key file not found at ${keyPath}`);
            throw new Error(`Private key file not found at ${keyPath}`);
        }
        
        console.log(`Files exist, reading them now...`);
        const certificate = fs.readFileSync(certPath).toString();
        const privateKey = fs.readFileSync(keyPath).toString();
        console.log(`Certificate and private key read successfully`);
        console.log(`Certificate length: ${certificate.length}`);
        console.log(`Private key length: ${privateKey.length}`);
        
        // Load credentials into wallet
        const identityLabel = `${user}.id`;
        const identity = {
            credentials: {
                certificate,
                privateKey
            },
            mspId: 'Org1MSP',
            type: 'X.509'
        }
        console.log(`Putting identity in wallet with label: ${identityLabel}`);
        await wallet.put(identityLabel, identity);
        console.log(`Identity added to wallet successfully`);
        console.log(`addToWallet mspId:Org1MSP for user: ${user}`);
        return "User identity added to wallet successfully";
    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
        throw ({ status: 500,  message: `Error adding to wallet. ${error}` });
    }
  }
}
module.exports = WalletService;
