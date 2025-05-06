/*
 # O'Reilly - Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 # farma ledger supply chain network
 # App.js load application server:
 */
'use strict';
const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');
// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');

app.use(express.static('public'));

// Disable caching for all API endpoints
app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

const { Wallets } = require('fabric-network');
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cache = require('memory-cache');
const PharmacyService = require('./services/pharmacyService.js');
const QueryService = require('./services/queryService.js');
const QueryHistoryService = require('./services/queryHistoryService.js');
const WalletService = require('./services/walletsService.js');
const pharmacySvcInstance = new PharmacyService();
const querySvcInstance = new QueryService();
const queryHistorySvcInstance = new QueryHistoryService();
const walletSvcInstance = new WalletService();

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/addUser', async (req, res, next) => {
    console.log(req.body.userName);
    var userName = req.body.userName;
    try {
        if (!userName || userName.length < 1) {
            return res.status(500).json({ message: "User is missing" });
        } else {
            const result = await walletSvcInstance.addToWallet(userName);
            console.log(result);
            cache.put('userName', userName);
            let msg = 'User ' + userName + ' was successfully registered and enrolled and is ready to interact with the fabric network';
            
            // Special message for when we create Steve
            if (userName === 'Steve') {
                msg = 'User Steve was successfully registered and enrolled. This is the required identity for ledger operations.';
            } else {
                msg += '. Additionally, the required "Steve" identity was also prepared for ledger operations.';
            }
            
            return res.status(200).json({ message: msg });
        }
    } catch (error) {
        console.error('Error in /addUser endpoint:', error);
        if (error instanceof Error) {
            return res.status(500).json({ message: `Error adding user to wallet: ${error.message}`, stack: error.stack });
        } else {
            return res.status(500).json(error);
        }
    }
});

app.post('/pharmacyReceived', async (req, res, next) => {
    console.log(req.body);
    var equipmentNumber = req.body.equipmentNumber;
    var ownerName = req.body.ownerName;
    var userName = cache.get('userName');
    try {
        if (!userName || userName.length < 1) {
            return res.status(500).json({ message: "User is not logged in. Please add a user to wallet first." });
        } else if (!ownerName || !equipmentNumber) {
            return res.status(500).json({ message: "Missing required fields: ownerName, equipmentNumber" });
        } else {
            // Check if user wallet exists
            const walletPath = path.resolve(__dirname, `identity/user/${userName}/wallet`);
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identity = await wallet.get(`${userName}.id`);
            
            if (!identity) {
                return res.status(500).json({ message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.` });
            }
            
            // Check if Steve exists in wallet
            const stevePath = path.resolve(__dirname, `identity/user/Steve/wallet`);
            const steveWallet = await Wallets.newFileSystemWallet(stevePath);
            const steveIdentity = await steveWallet.get(`Steve.id`);
            
            if (!steveIdentity) {
                return res.status(500).json({ message: `Identity not found in wallet: Steve.id. Please add Steve to wallet first.` });
            }
            
            // Always use Steve for actual ledger operations
            const result = await pharmacySvcInstance.pharmacyReceived("Steve", equipmentNumber, ownerName);
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
});

app.get('/queryHistoryByKey', async (req, res, next) => {
    console.log("========== QUERY HISTORY ENDPOINT ==========");
    console.log("Request query:", req.query);
    console.log("Request body:", req.body);
    var userName = cache.get('userName');
    console.log("User from cache:", userName);
    let key = req.query.key;
    console.log("Key to query:", key);
    try {
        if (!userName || userName.length < 1) {
            console.log("No user found in cache");
            return res.status(500).json({ message: "User is not logged in. Please add a user to wallet first." });
        } else if (!key) {
            console.log("No key provided in request");
            return res.status(400).json({ message: "Missing required parameter: key" });
        } else {
            // Check if user wallet exists
            const walletPath = path.resolve(__dirname, `identity/user/${userName}/wallet`);
            console.log("Looking for wallet at:", walletPath);
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identity = await wallet.get(`${userName}.id`);
            
            if (!identity) {
                console.log(`Identity ${userName}.id not found in wallet`);
                return res.status(500).json({ message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.` });
            }
            console.log(`Identity ${userName}.id found in wallet`);
            
            // Always use Steve for actual ledger operations
            console.log("Calling queryHistoryByKey service with user: Steve and key:", key);
            const result = await queryHistorySvcInstance.queryHistoryByKey("Steve", key);
            console.log("Query history result:", JSON.stringify(result).substring(0, 200) + (JSON.stringify(result).length > 200 ? '...' : ''));
            return res.status(200).json(result);
        }
    } catch (error) {
        console.error('Error in queryHistoryByKey:', error);
        if (error.status && error.message) {
            return res.status(error.status).json({ message: error.message });
        } else {
            return res.status(500).json({ message: error.message || JSON.stringify(error) });
        }
    }
});

app.get('/queryByKey', async (req, res, next) => {
    console.log(req.body);
    var userName = cache.get('userName');
    let key = req.query.key;
    try {
        if (!userName || userName.length < 1) {
            return res.status(500).json({ message: "User is not logged in. Please add a user to wallet first." });
        } else if (!key) {
            return res.status(400).json({ message: "Missing required parameter: key" });
        } else {
            // Check if user wallet exists
            const walletPath = path.resolve(__dirname, `identity/user/${userName}/wallet`);
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identity = await wallet.get(`${userName}.id`);
            
            if (!identity) {
                return res.status(500).json({ message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.` });
            }
            
            // Always use Steve for actual ledger operations
            const result = await querySvcInstance.queryByKey("Steve", key);
            return res.status(200).json(result);
        }
    } catch (error) {
        console.error('Error in queryByKey:', error);
        if (error.status && error.message) {
            return res.status(error.status).json({ message: error.message });
        } else {
            return res.status(500).json({ message: error.message || JSON.stringify(error) });
        }
    }
});

var port = process.env.PORT || 30002;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Pharmacy application listening at http://%s:%s", host, port);
});
