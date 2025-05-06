/*
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * farma supply chain network smart contract - index  
 * Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 */
'use strict';

const PharmaledgerContract = require('./lib/pharmaledgercontract');

module.exports.PharmaledgerContract = PharmaledgerContract;
module.exports.contracts = [ PharmaledgerContract ];

