/*
 # O'Reilly - Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 # farma ledger supply chain network
 */
'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const PharmaLedgerContract = require('../../contract/lib/pharmaledgercontract.js');
const path = require('path');

class QueryHistoryService {
  /**
  * 1. Select an identity from a wallet
  * 2. Connect to network gateway
  * 3. Access farma ledger supply chain network
  * 4. Construct request to issue commercial paper
  * 5. Submit invoke queryByKey transaction
  * 6. Process response
  **/
  async queryHistoryByKey(userName, key) {
    console.log("========== QUERY HISTORY SERVICE ==========");
    console.log("userName:", userName, "key:", key);
    
    // Validate inputs
    if(!userName || userName.length<1) {
        console.log("ERROR: User Name is not defined");
        throw ({ status: 500,  message: 'User Name is not defined.' });
    }
    if(!key || key.length<1) {
        console.log("ERROR: Key is not defined");
        throw ({ status: 500,  message: 'key is not defined.' });
    }
    
    // A wallet stores a collection of identities for use
    const walletPath = path.resolve(__dirname, `../identity/user/${userName}/wallet`);
    console.log("Looking for wallet at:", walletPath);
    
    // Check if wallet directory exists
    if (!fs.existsSync(walletPath)) {
        console.log("ERROR: Wallet directory not found at", walletPath);
        throw ({ status: 500, message: `Wallet directory not found for user: ${userName}. Please add user to wallet first.` });
    }
    console.log("Wallet directory found");
    
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    // Check if identity exists in wallet
    const identity = await wallet.get(`${userName}.id`);
    if (!identity) {
        console.log(`ERROR: Identity ${userName}.id not found in wallet`);
        throw ({ status: 500, message: `Identity not found in wallet: ${userName}` });
    }
    console.log(`Identity ${userName}.id found in wallet`);
    
    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();
    
    try {
      // Load connection profile; will be used to locate a gateway
      console.log("Loading connection profile");
      let connectionProfile = yaml.safeLoad(fs.readFileSync('../../../organizations/peerOrganizations/org3.example.com/connection-org3.json', 'utf8'));
      console.log("Connection profile loaded");
      
      let connectionOptions = {
        identity: `${userName}.id`,
        wallet: wallet,
        discovery: { enabled:true, asLocalhost: true }
      };
      console.log("Connection options:", JSON.stringify(connectionOptions));
      
      // Connect to gateway using application specified parameters
      console.log('Connect to Fabric gateway.');
      await gateway.connect(connectionProfile, connectionOptions);
      
      // Access farma ledger supply chain network
      console.log('Use network channel: plnchannel.');
      const network = await gateway.getNetwork('plnchannel');
      
      // Get addressability to farma ledger supply chain network contract
      console.log('Use org.pln.PharmaLedgerContract smart contract.');
      const contract = await network.getContract('pharmaLedgerContract', 'org.pln.PharmaLedgerContract');
      
      // query ledger data by key
      console.log('Submit pharmaledger queryHistoryByKey request for key:', key);
      const response = await contract.submitTransaction('queryHistoryByKey', key);
      console.log("Raw response:", response ? response.toString('utf8').substring(0, 100) + '...' : 'null');
      
      if (!response || response.length === 0) {
        console.log("No history found for key:", key);
      } else {
        console.log("History found for key:", key);
      }
      
      const parsedResponse = response ? JSON.parse(response) : response;
      console.log("History records count:", parsedResponse ? parsedResponse.length : 0);
      
      return parsedResponse;
    } catch (error) {
      console.log(`Error processing transaction. ${error}`);
      console.log(error.stack);
      
      // Check for specific error types
      if (error.message && error.message.includes('not found')) {
        console.log("ERROR: Record not found");
        throw ({ status: 404, message: `History for key ${key} not found.` });
      } else if (error.message && error.message.includes('permission denied')) {
        console.log("ERROR: Permission denied");
        throw ({ status: 403, message: `Permission denied for user ${userName} to access history for key ${key}.` });
      } else if (error.message && error.message.includes('connection refused')) {
        console.log("ERROR: Connection refused");
        throw ({ status: 500, message: 'Network connection error. Unable to connect to Hyperledger Fabric network.' });
      } else {
        console.log(`ERROR: Unknown error: ${error.message || error}`);
        throw ({ status: 500, message: `Error processing transaction: ${error.message || error}` });
      }
    } finally {
      // Disconnect from the gateway
      console.log('Disconnect from Fabric gateway.')
      gateway.disconnect();
    }
  }
}
module.exports = QueryHistoryService;
