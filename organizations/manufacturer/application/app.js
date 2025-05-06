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
// Unused imports removed: url, querystring, fs, yaml

app.use(express.static('public'));

const { Wallets } = require('fabric-network');
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const cache = require('memory-cache');
const EquipmentService = require('./services/equipmentService.js');
const QueryService = require('./services/queryService.js');
const QueryHistoryService = require('./services/queryHistoryService.js');
const WalletService = require('./services/walletsService.js');
const equipmentSvcInstance = new EquipmentService();
const querySvcInstance = new QueryService();
const queryHistorySvcInstance = new QueryHistoryService();
const walletSvcInstance = new WalletService();

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/addUser', async (req, res, next) => {
    console.log('addUser request body:', req.body);
    const userName = req.body.userName;
    try {
        if (!userName || userName.length < 1) {
            return res.status(500).json({ message: 'User is missing' });
        } else {
            console.log(`Calling addToWallet with username: ${userName}`);
            const result = await walletSvcInstance.addToWallet(userName);
            console.log(`Result from addToWallet: ${result}`);
            cache.put('userName', userName);
            let msg =
                'User ' +
                userName +
                ' was successfully registered and enrolled and is ready to intreact with the fabric network';
            return res.status(200).json({ message: msg });
        }
    } catch (error) {
        console.error('Error in /addUser endpoint:', error);
        if (error instanceof Error) {
            return res
                .status(500)
                .json({
                    message: `Error adding user to wallet: ${error.message}`,
                    stack: error.stack,
                });
        } else {
            return res.status(500).json(error);
        }
    }
});

app.post('/makeEquipment', async (req, res, next) => {
    console.log(req.body);
    const manufacturer = req.body.manufacturer;
    const equipmentNumber = req.body.equipmentNumber;
    const equipmentName = req.body.equipmentName;
    const ownerName = req.body.ownerName;
    const userName = cache.get('userName');
    try {
        if (!userName || userName.length < 1) {
            return res
                .status(500)
                .json({
                    message: 'User is not logged in. Please add a user to wallet first.',
                });
        } else if (
            !manufacturer ||
            !equipmentName ||
            !ownerName ||
            !equipmentNumber
        ) {
            return res
                .status(500)
                .json({
                    message:
                        'Missing required fields: manufacturer, equipmentName, ownerName, equipmentNumber',
                });
        } else {
            // Check if user wallet exists
            const walletPath = path.resolve(
                __dirname,
                `identity/user/${userName}/wallet`
            );
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identity = await wallet.get(`${userName}.id`);

            if (!identity) {
                return res
                    .status(500)
                    .json({
                        message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.`,
                    });
            }

            try {
                const result = await equipmentSvcInstance.makeEquipment(
                    userName,
                    manufacturer,
                    equipmentNumber,
                    equipmentName,
                    ownerName
                );
                return res.status(200).json(result);
            } catch (error) {
                console.error('Error in makeEquipment:', error);
                return res.status(500).json({
                    message: `Error creating equipment: ${error.message || error}`,
                    details: error.stack,
                });
            }
        }
    } catch (error) {
        console.error('Unexpected error in /makeEquipment:', error);
        return res.status(500).json({
            message: `Unexpected error: ${error.message || error}`,
            details: error.stack,
        });
    }
});

app.get('/queryHistoryByKey', async (req, res, next) => {
    console.log(req.body);
    const userName = cache.get('userName');
    //const userName = 'brian';
    let key = req.query.key;
    try {
        if (!userName || userName.length < 1) {
            return res
                .status(500)
                .json({
                    message: 'User is not logged in. Please add a user to wallet first.',
                });
        } else {
            // Check if user wallet exists
            const walletPath = path.resolve(
                __dirname,
                `identity/user/${userName}/wallet`
            );
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identity = await wallet.get(`${userName}.id`);

            if (!identity) {
                return res
                    .status(500)
                    .json({
                        message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.`,
                    });
            }

            const result = await queryHistorySvcInstance.queryHistoryByKey(
                userName,
                key
            );
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
});

app.get('/queryByKey', async (req, res, next) => {
    console.log(req.body);
    const userName = cache.get('userName');
    //const userName = 'brian';
    let key = req.query.key;
    try {
        if (!userName || userName.length < 1) {
            return res
                .status(500)
                .json({
                    message: 'User is not logged in. Please add a user to wallet first.',
                });
        } else {
            // Check if user wallet exists
            const walletPath = path.resolve(
                __dirname,
                `identity/user/${userName}/wallet`
            );
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identity = await wallet.get(`${userName}.id`);

            if (!identity) {
                return res
                    .status(500)
                    .json({
                        message: `Identity not found in wallet: ${userName}.id. Please add the user to wallet first.`,
                    });
            }

            const result = await querySvcInstance.queryByKey(userName, key);
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
});

const port = process.env.PORT || 30000;
const server = app.listen(port, function () {
    const host = server.address().address;
    const serverPort = server.address().port;
    console.log('App listening at http://%s:%s', host, serverPort);
});
