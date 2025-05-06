/*
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * farma supply chain network smart contract
 * Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
 */
'use strict';
// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

/**
 * Define PharmaLedger smart contract by extending Fabric Contract class
 *
 */
class PharmaLedgerContract extends Contract {

    constructor() {
        // Unique namespace pcn - PharmaChainNetwork when multiple contracts per chaincode file
        super('org.pln.PharmaLedgerContract');
    }
    /**
     * Instantiate to set up ledger.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No default implementation for this example
        console.log('Instantiate the PharmaLedger contract');
    }

    /**
     * Create pharma equipment
     *
     * @param {Context} ctx the transaction context
     * @param {String} equipment manufacturer
     * @param {String} equipmentNumber for this equipment
     * @param {String} equipment name
     * @param {String} name of the equipment owner
    */
   async makeEquipment(ctx, manufacturer, equipmentNumber, equipmentName, ownerName) {
        console.info('============= START : makeEquipment call ===========');
        let dt = new Date().toString();
        const equipment = {
            equipmentNumber,
            manufacturer,
            equipmentName,
            ownerName,
            previousOwnerType: 'MANUFACTURER',
            currentOwnerType: 'MANUFACTURER',
            createDateTime: dt,
            lastUpdated: dt
        };
        await ctx.stub.putState(equipmentNumber, Buffer.from(JSON.stringify(equipment)));
        console.info('============= END : Create equipment ===========');
   }
   /**
     * Manufacturer send equipment To Wholesaler
     *
     * @param {Context} ctx the transaction context
     * @param {String} equipmentNumber for this equipment
     * @param {String} name of the equipment owner
   */
   async wholesalerDistribute(ctx, equipmentNumber, ownerName) {
        console.info('============= START : wolesalerDistribute call ===========');
        const equipmentAsBytes = await ctx.stub.getState(equipmentNumber);
        if (!equipmentAsBytes || equipmentAsBytes.length === 0) {
            throw new Error(`${equipmentNumber} does not exist`);
        }
        let dt = new Date().toString();
        const strValue = Buffer.from(equipmentAsBytes).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
            if(record.currentOwnerType!=='MANUFACTURER') {
               throw new Error(` equipment - ${equipmentNumber} owner must be MANUFACTURER`);
            }
            record.previousOwnerType= record.currentOwnerType;
            record.currentOwnerType = 'WHOLESALER';
            record.ownerName = ownerName;
            record.lastUpdated = dt;
        } catch (err) {
            console.log(err);
            throw new Error(`equipment ${equipmentNumber} data can't be processed: ${err.message}`);
        }
        await ctx.stub.putState(equipmentNumber, Buffer.from(JSON.stringify(record)));
        console.info('============= END : wolesalerDistribute  ===========');
   }
   /**
     * Wholesaler send equipment To Pharmacy
     *
     * @param {Context} ctx the transaction context
     * @param {String} equipmentNumber for this equipment
     * @param {String} name of the equipment owner
   */
   async pharmacyReceived(ctx, equipmentNumber, ownerName) {
        console.info('============= START : pharmacyReceived call ===========');
        const equipmentAsBytes = await ctx.stub.getState(equipmentNumber);
        if (!equipmentAsBytes || equipmentAsBytes.length === 0) {
            throw new Error(`${equipmentNumber} does not exist`);
        }
        let dt = new Date().toString();
        const strValue = Buffer.from(equipmentAsBytes).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
            //make sure owner is wholesaler
            if(record.currentOwnerType!=='WHOLESALER') {
               throw new Error(` equipment - ${equipmentNumber} owner must be WHOLESALER`);
            }
            record.previousOwnerType= record.currentOwnerType;
            record.currentOwnerType = 'PHARMACY';
            record.ownerName = ownerName;
            record.lastUpdated = dt;
        } catch (err) {
            console.log(err);
            throw new Error(`equipment ${equipmentNumber} data can't be processed: ${err.message}`);
        }
        await ctx.stub.putState(equipmentNumber, Buffer.from(JSON.stringify(record)));
        console.info('============= END : pharmacyReceived  ===========');
   }
   /**
     * query ledger record By Key
     *
     * @param {Context} ctx the transaction context
     * @param {String} key for record
   */
   async queryByKey(ctx, key) {
        let value = await ctx.stub.getState(key);
        const strValue = Buffer.from(value).toString('utf8');
        let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
        return JSON.stringify({
           Key: key, Record: record
        });
   }
   async queryHistoryByKey(ctx, key) {
      console.info('getting history for key: ' + key);
      let iterator = await ctx.stub.getHistoryForKey(key);
      let result = [];
      let res = await iterator.next();
      while (!res.done) {
        if (res.value) {
          const obj = JSON.parse(res.value.value.toString('utf8'));
          result.push(obj);
        }
        res = await iterator.next();
      }
      await iterator.close();
      console.info(result);
      return JSON.stringify(result);
  }
}
module.exports = PharmaLedgerContract;
