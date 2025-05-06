/*
 * Test script for wallet service
 */
'use strict';

const WalletService = require('./services/walletsService.js');
const walletService = new WalletService();

// Test adding a user to the wallet
async function testAddToWallet() {
  try {
    console.log('Testing wholesaler addToWallet function...');
    const userName = 'testWholesaler';
    console.log(`Adding user: ${userName}`);
    const result = await walletService.addToWallet(userName);
    console.log('Result:', result);
    console.log('Test completed successfully.');
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

testAddToWallet(); 