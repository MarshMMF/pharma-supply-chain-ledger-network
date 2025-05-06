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

class QueryService {
  /**
  * 1. Select an identity from a wallet
  * 2. Connect to network gateway
  * 3. Access farma ledger supply chain network
  * 4. Construct request to issue commercial paper
  * 5. Submit invoke queryByKey transaction
  * 6. Process response
  **/
  async queryByKey(userName, key) {
    // Validate inputs
    if(!userName || userName.length<1) {
        throw ({ status: 500,  message: 'User Name is not defined.' });
    }
    if(!key || key.length<1) {
        throw ({ status: 500,  message: 'key is not defined.' });
    }
    
    // A wallet stores a collection of identities for use
    const walletPath = path.resolve(__dirname, `../identity/user/${userName}/wallet`);
    
    // Check if wallet directory exists
    if (!fs.existsSync(walletPath)) {
        throw ({ status: 500, message: `Wallet directory not found for user: ${userName}. Please add user to wallet first.` });
    }
    
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    // Check if identity exists in wallet
    const identity = await wallet.get(`${userName}.id`);
    if (!identity) {
        throw ({ status: 500, message: `Identity not found in wallet: ${userName}` });
    }
    
    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();
    console.log('userName:'+ userName + " key:"+ key);
    
    try {
      // Load connection profile; will be used to locate a gateway
      let connectionProfile = yaml.safeLoad(fs.readFileSync('../../../organizations/peerOrganizations/org3.example.com/connection-org3.json', 'utf8'));
      let connectionOptions = {
        identity: `${userName}.id`,
        wallet: wallet,
        discovery: { enabled:true, asLocalhost: true }
      };
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
      console.log('Submit pharmaledger queryByKey request.');
      const response = await contract.submitTransaction('queryByKey', key);
      //console.log(response);
      return response?JSON.parse(response):response;
    } catch (error) {
      console.log(`Error processing transaction. ${error}`);
      console.log(error.stack);
      
      // Check for specific error types
      if (error.message && error.message.includes('not found')) {
        throw ({ status: 404, message: `Record with key ${key} not found.` });
      } else if (error.message && error.message.includes('permission denied')) {
        throw ({ status: 403, message: `Permission denied for user ${userName} to access key ${key}.` });
      } else if (error.message && error.message.includes('connection refused')) {
        throw ({ status: 500, message: 'Network connection error. Unable to connect to Hyperledger Fabric network.' });
      } else {
        throw ({ status: 500, message: `Error processing transaction: ${error.message || error}` });
      }
    } finally {
      // Disconnect from the gateway
      console.log('Disconnect from Fabric gateway.')
      gateway.disconnect();
    }
  }
}
module.exports = QueryService;
