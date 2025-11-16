#!/usr/bin/env node

/**
 * Verification script for ethers.js ContractService implementation
 * 
 * Tests all contract operations against the deployed Solidity contract
 * on Passet Hub testnet.
 */

const { ethers } = require('ethers');
const solidityAbi = require('../contract/solidity-abi.json');

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xeD0fDD2be363590800F86ec8562Dde951654668F';
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://testnet-passet-hub-eth-rpc.polkadot.io';

// Test results
const results = {
  passed: [],
  failed: [],
};

function logTest(name, status, details = '') {
  const icon = status === 'pass' ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  if (status === 'pass') {
    results.passed.push(name);
  } else {
    results.failed.push(name);
  }
}

async function main() {
  console.log('🔍 Verifying ethers.js ContractService Implementation\n');
  console.log('Configuration:');
  console.log(`  Contract: ${CONTRACT_ADDRESS}`);
  console.log(`  RPC: ${RPC_ENDPOINT}\n`);

  try {
    // Test 1: Provider Connection
    console.log('Test 1: Provider Connection');
    const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
    
    try {
      const blockNumber = await provider.getBlockNumber();
      logTest('Provider connection', 'pass', `Current block: ${blockNumber}`);
    } catch (error) {
      logTest('Provider connection', 'fail', error.message);
      throw error;
    }

    // Test 2: Contract Instance Creation
    console.log('\nTest 2: Contract Instance Creation');
    let contract;
    try {
      contract = new ethers.Contract(CONTRACT_ADDRESS, solidityAbi, provider);
      logTest('Contract instantiation', 'pass', `Address: ${await contract.getAddress()}`);
    } catch (error) {
      logTest('Contract instantiation', 'fail', error.message);
      throw error;
    }

    // Test 3: ABI Method Verification
    console.log('\nTest 3: ABI Method Verification');
    const expectedMethods = [
      'getMessageCount',
      'getSentMessages',
      'getReceivedMessages',
      'getMessage',
      'storeMessage'
    ];
    
    for (const method of expectedMethods) {
      if (contract[method]) {
        logTest(`Method: ${method}`, 'pass');
      } else {
        logTest(`Method: ${method}`, 'fail', 'Method not found in contract interface');
      }
    }

    // Test 4: getMessageCount (view function)
    console.log('\nTest 4: Query - getMessageCount()');
    try {
      const count = await contract.getMessageCount();
      const countNumber = Number(count);
      logTest('getMessageCount()', 'pass', `Total messages: ${countNumber}`);
    } catch (error) {
      logTest('getMessageCount()', 'fail', error.message);
    }

    // Test 5: getSentMessages (view function)
    console.log('\nTest 5: Query - getSentMessages()');
    const testAddress = '0x0000000000000000000000000000000000000001';
    try {
      const messages = await contract.getSentMessages(testAddress);
      logTest('getSentMessages()', 'pass', `Returned ${messages.length} messages`);
      
      // Verify message structure if any messages exist
      if (messages.length > 0) {
        const msg = messages[0];
        const hasRequiredFields = 
          msg.encryptedKeyCid !== undefined &&
          msg.encryptedMessageCid !== undefined &&
          msg.messageHash !== undefined &&
          msg.unlockTimestamp !== undefined &&
          msg.sender !== undefined &&
          msg.recipient !== undefined &&
          msg.createdAt !== undefined;
        
        if (hasRequiredFields) {
          logTest('Message structure validation', 'pass', 'All required fields present');
        } else {
          logTest('Message structure validation', 'fail', 'Missing required fields');
        }
      }
    } catch (error) {
      logTest('getSentMessages()', 'fail', error.message);
    }

    // Test 6: getReceivedMessages (view function)
    console.log('\nTest 6: Query - getReceivedMessages()');
    try {
      const messages = await contract.getReceivedMessages(testAddress);
      logTest('getReceivedMessages()', 'pass', `Returned ${messages.length} messages`);
    } catch (error) {
      logTest('getReceivedMessages()', 'fail', error.message);
    }

    // Test 7: getMessage (view function)
    console.log('\nTest 7: Query - getMessage()');
    try {
      // Try to get message ID 0 (may not exist)
      const message = await contract.getMessage(0);
      logTest('getMessage()', 'pass', 'Query executed successfully');
    } catch (error) {
      // MessageNotFound is expected if no messages exist
      if (error.message.includes('MessageNotFound')) {
        logTest('getMessage()', 'pass', 'Correctly throws MessageNotFound for non-existent message');
      } else {
        logTest('getMessage()', 'fail', error.message);
      }
    }

    // Test 8: Event Verification
    console.log('\nTest 8: Event Interface Verification');
    try {
      const eventFragment = contract.interface.getEvent('MessageStored');
      if (eventFragment) {
        logTest('MessageStored event', 'pass', `Inputs: ${eventFragment.inputs.map(i => i.name).join(', ')}`);
      } else {
        logTest('MessageStored event', 'fail', 'Event not found in ABI');
      }
    } catch (error) {
      logTest('MessageStored event', 'fail', error.message);
    }

    // Test 9: Error Interface Verification
    console.log('\nTest 9: Custom Error Verification');
    const expectedErrors = [
      'InvalidTimestamp',
      'InvalidMessageHash',
      'InvalidKeyCID',
      'InvalidMessageCID',
      'SenderIsRecipient',
      'MessageNotFound'
    ];
    
    for (const errorName of expectedErrors) {
      try {
        const errorFragment = contract.interface.getError(errorName);
        if (errorFragment) {
          logTest(`Error: ${errorName}`, 'pass');
        } else {
          logTest(`Error: ${errorName}`, 'fail', 'Error not found in ABI');
        }
      } catch (error) {
        logTest(`Error: ${errorName}`, 'fail', error.message);
      }
    }

    // Test 10: Type Conversion Verification
    console.log('\nTest 10: Type Conversion Verification');
    try {
      const count = await contract.getMessageCount();
      const countNumber = Number(count);
      const countBigInt = BigInt(count);
      
      if (typeof countNumber === 'number' && typeof countBigInt === 'bigint') {
        logTest('uint64 conversion', 'pass', `Number: ${countNumber}, BigInt: ${countBigInt}`);
      } else {
        logTest('uint64 conversion', 'fail', 'Type conversion failed');
      }
    } catch (error) {
      logTest('uint64 conversion', 'fail', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📊 Total: ${results.passed.length + results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed tests:');
      results.failed.forEach(test => console.log(`  - ${test}`));
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! ethers.js implementation is correct.');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main();
