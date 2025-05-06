/*
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * farma supply chain network smart contract - index  
 * Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 */
'use strict';

const PharmaLedgerContract = require('./lib/pharmaledgercontract.js');

module.exports.PharmaLedgerContract = PharmaLedgerContract;
module.exports.contracts = [ PharmaLedgerContract ];

