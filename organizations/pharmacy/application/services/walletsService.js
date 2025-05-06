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
      if(!user || user.length<1) {
          throw ({ status: 500,  message: 'User is not defined.' });
      }
        // A wallet stores a collection of identities
        const walletPath = path.resolve(__dirname, `../identity/user/${user}/wallet`);
        
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
        const credPath = path.join(fixtures, '/peerOrganizations/org3.example.com/users/User1@org3.example.com');
        const certificate = fs.readFileSync(path.join(credPath, '/msp/signcerts/User1@org3.example.com-cert.pem')).toString();
        const privateKey = fs.readFileSync(path.join(credPath, '/msp/keystore/priv_sk')).toString();
        // Load credentials into wallet
        const identityLabel = `${user}.id`;
        const identity = {
            credentials: {
                certificate,
                privateKey
            },
            mspId: 'Org3MSP',
            type: 'X.509'
        }
        await wallet.put(identityLabel, identity);
        console.log(`addToWallet mspId:Org3MSP for user: ${user}`);
        
        // Always add 'Steve' identity to the wallet too
        if (user !== 'Steve') {
            // Create Steve's wallet if it doesn't exist
            const steveWalletPath = path.resolve(__dirname, '../identity/user/Steve/wallet');
            const steveWalletDir = path.dirname(steveWalletPath);
            if (!fs.existsSync(steveWalletDir)) {
                console.log(`Creating Steve's directory: ${steveWalletDir}`);
                fs.mkdirSync(steveWalletDir, { recursive: true });
            }
            
            const steveWallet = await Wallets.newFileSystemWallet(steveWalletPath);
            console.log(`Steve's wallet created at: ${steveWalletPath}`);
            
            // Add Steve's identity to wallet
            const steveIdentityLabel = 'Steve.id';
            const steveIdentity = {
                credentials: {
                    certificate,
                    privateKey
                },
                mspId: 'Org3MSP',
                type: 'X.509'
            }
            await steveWallet.put(steveIdentityLabel, steveIdentity);
            console.log(`Also added identity to wallet for user: Steve`);
        }
        
        return "User identity added to wallet successfully";
    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
        throw ({ status: 500,  message: `Error adding to wallet. ${error}` });
    }
  }
}
module.exports = WalletService;
