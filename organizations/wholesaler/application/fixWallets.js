/*
 # Fix Wallet Files Script
 # This script will fix any wallet files with incorrect extensions
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

async function fixWallets() {
  try {
    // Path to user directory
    const userDir = path.resolve(__dirname, 'identity/user');
    
    // Check if user directory exists
    if (!fs.existsSync(userDir)) {
      console.log('No user directory found. Nothing to fix.');
      return;
    }
    
    // Get all user directories
    const users = fs.readdirSync(userDir);
    console.log(`Found ${users.length} user directories: ${users.join(', ')}`);
    
    for (const user of users) {
      const walletPath = path.resolve(userDir, user, 'wallet');
      
      // Check if wallet directory exists
      if (!fs.existsSync(walletPath)) {
        console.log(`No wallet directory found for user ${user}. Skipping.`);
        continue;
      }
      
      console.log(`Processing wallet for user ${user}...`);
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      
      // Get all identities in the wallet
      const identities = await wallet.list();
      console.log(`Found ${identities.length} identities: ${identities.join(', ')}`);
      
      // Check for double extension files
      for (const id of identities) {
        if (id.endsWith('.id.id')) {
          console.log(`Found double extension file: ${id}`);
          
          // Get the identity data
          const identityData = await wallet.get(id);
          
          // Compute the correct identity label
          const correctLabel = id.replace('.id.id', '.id');
          
          // Store with correct label
          await wallet.put(correctLabel, identityData);
          console.log(`Identity stored with correct label: ${correctLabel}`);
          
          // Remove the incorrect file
          await wallet.remove(id);
          console.log(`Removed incorrect identity file: ${id}`);
        }
      }
      
      // Final check
      const updatedIdentities = await wallet.list();
      console.log(`Final identities for user ${user}: ${updatedIdentities.join(', ')}`);
    }
    
    console.log('Wallet fix complete!');
  } catch (error) {
    console.error(`Error fixing wallets: ${error}`);
    console.error(error.stack);
  }
}

// Run the function
fixWallets().then(() => {
  console.log('Script completed.');
}).catch(err => {
  console.error('Script failed:', err);
}); 