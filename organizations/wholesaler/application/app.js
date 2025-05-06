/*
 # O'Reilly - Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 # farma ledger supply chain network
 # App.js load application server:
 */
'use strict';
const express = require('express')
const app = express()
app.set('view engine', 'ejs')

const bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');
// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');

app.use(express.static('public'))

const { Wallets } = require('fabric-network');
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cache = require('memory-cache');
const WholesalerService = require('./services/wholesalerService.js');
const QueryService = require( "./services/queryService.js" );
const QueryHistoryService = require( "./services/queryHistoryService.js" );
const WalletService = require( "./services/walletsService.js" );
const wholesalerSvcInstance = new WholesalerService();
const querySvcInstance = new QueryService();
const queryHistorySvcInstance = new QueryHistoryService();
const walletSvcInstance = new WalletService();

app.get('/', function (req, res) {
   res.render('index');
})

app.post('/addUser', async (req, res, next) => {
  console.log(req.body.userName);
  var userName = req.body.userName;
  try {
    if(!userName || userName.length<1) {
      return res.status(500).json({message: "User is missing"});
    } else {
      const result = await walletSvcInstance.addToWallet(userName);
      console.log(result);
      cache.put('userName', userName);
      let msg = 'User '+ userName + ' was successfully registered and enrolled and is ready to interact with the fabric network';
      return res.status(200).json({message: msg});
    }
  } catch (error) {
    console.error('Error in /addUser endpoint:', error);
    if (error instanceof Error) {
      return res.status(500).json({message: `Error adding user to wallet: ${error.message}`, stack: error.stack});
    } else {
      return res.status(500).json(error);
    }
  }
})
app.post('/wholesalerDistribute', async (req, res, next) => {
  console.log(req.body);
  var equipmentNumber = req.body.equipmentNumber;
  var ownerName = req.body.ownerName;
  var userName = cache.get('userName')
  try {
    if(!userName || userName.length<1) {
      return res.status(500).json({message: "User is not logged in. Please add a user to wallet first."});
    } else if (!ownerName || !equipmentNumber) {
      return res.status(500).json({message: "Missing required fields: ownerName, equipmentNumber"});
    } else {
      // Check if user wallet exists
      const walletPath = path.resolve(__dirname, `identity/user/${userName}/wallet`);
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const identity = await wallet.get(`${userName}.id`);
      
      if (!identity) {
        return res.status(500).json({message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.`});
      }
      
      const result = await wholesalerSvcInstance.wholesalerDistribute(userName, equipmentNumber, ownerName);
      return res.status(200).json(result);
    }
  } catch (error) {
    return res.status(500).json({message: error.message || error});
  }
})
app.get('/queryHistoryByKey', async (req, res, next) => {
  console.log(req.body);
  var userName = cache.get('userName')
  //var userName = "brian";
  let key = req.query.key;
  try {
    if(!userName || userName.length<1) {
      return res.status(500).json({message: "User is not logged in. Please add a user to wallet first."});
    } else {
      // Check if user wallet exists
      const walletPath = path.resolve(__dirname, `identity/user/${userName}/wallet`);
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const identity = await wallet.get(`${userName}.id`);
      
      if (!identity) {
        return res.status(500).json({message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.`});
      }
      
      const result = await queryHistorySvcInstance.queryHistoryByKey(userName, key);
      return res.status(200).json(result);
    }
  } catch (error) {
    return res.status(500).json({message: error.message || error});
  }
})
app.get('/queryByKey', async (req, res, next) => {
  console.log(req.body);
  var userName = cache.get('userName')
  //var userName = "brian";
  let key = req.query.key;
  try {
    if(!userName || userName.length<1) {
      return res.status(500).json({message: "User is not logged in. Please add a user to wallet first."});
    } else {
      // Check if user wallet exists
      const walletPath = path.resolve(__dirname, `identity/user/${userName}/wallet`);
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const identity = await wallet.get(`${userName}.id`);
      
      if (!identity) {
        return res.status(500).json({message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.`});
      }
      
      const result = await querySvcInstance.queryByKey(userName, key);
      return res.status(200).json(result);
    }
  } catch (error) {
    return res.status(500).json({message: error.message || error});
  }
})
var port = process.env.PORT || 30001;
var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s", host, port)
})
