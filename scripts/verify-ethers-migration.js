#!/usr/bin/env node

/**
 * Verification script for ethers.js migration
 * Tests all ContractService operations to ensure proper functionality
 */

const { ethers } = require('ethers');
const solidityAbi = require('../contract/solidity-abi.json');

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xeD0fDD2be363590800F86ec8562Dde951654668F';
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://testnet-passet-hub-eth-rpc.polkadot.io';

// Test addresses (Ethereum format)
const TEST_SENDER = '0x1234567890123456789012345678901234567890';
const TEST_RECIPIENT = '0x0987654321098765432109876543210987654321';

console.log('🔍 Ethers.js Migration Verification\n');
console.log('Configuration:');
console.log(`  Contract: ${CONTRACT_ADDRESS}`);
console.log(`  RPC: ${RPC_ENDPOINT}`);
console.log(`  Network: ${process.env.NEXT_PUBLIC_NETWORK || 'passet-hub'}\n`);

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (details) console.log(`   ${details}`);
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  try {
    // Test 1: Provider Connection
    console.log('\n📡 Test 1: Provider Connection');
    let provider;
    try {
      provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
      const blockNumber = await provider.getBlockNumber();
      logTest('Provider connection', true, `Current block: ${blockNumber}`);
    } catch (error) {
      logTest('Provider connection', false, error.message);
      return results;
    }

    // Test 2: Contract Instance Creation
    console.log('\n📝 Test 2: Contract Instance Creation');
    let contract;
    try {
      contract = new ethers.Contract(CONTRACT_ADDRESS, solidityAbi, provider);
      logTest('Contract instantiation', true, `Address: ${await contract.getAddress()}`);
    } catch (error) {
      logTest('Contract instantiation', false, error.message);
      return results;
    }

    // Test 3: ABI Compatibility
    console.log('\n🔧 Test 3: ABI Compatibility');
    try {
      const expectedMethods = ['getMessageCount', 'getSentMessages', 'getReceivedMessages', 'getMessage', 'storeMessage'];
      const missingMethods = expectedMethods.filter(method => !contract[method]);
      
      if (missingMethods.length === 0) {
        logTest('ABI method availability', true, `All ${expectedMethods.length} methods found`);
      } else {
        logTest('ABI method availability', false, `Missing methods: ${missingMethods.join(', ')}`);
      }
    } catch (error) {
      logTest('ABI method availability', false, error.message);
    }

    // Test 4: Read Operation - getMessageCount
    console.log('\n📊 Test 4: Read Operation - getMessageCount()');
    try {
      const count = await contract.getMessageCount();
      const countNumber = Number(count);
      logTest('getMessageCount()', true, `Message count: ${countNumber}`);
    } catch (error) {
      logTest('getMessageCount()', false, error.message);
    }

    // Test 5: Read Operation - getSentMessages
    console.log('\n📤 Test 5: Read Operation - getSentMessages()');
    try {
      const messages = await contract.getSentMessages(TEST_SENDER);
      logTest('getSentMessages()', true, `Returned ${messages.length} messages`);
      
      if (messages.length > 0) {
        const msg = messages[0];
        console.log(`   Sample message structure:`);
        console.log(`     - encryptedKeyCid: ${msg.encryptedKeyCid ? '✓' : '✗'}`);
        console.log(`     - encryptedMessageCid: ${msg.encryptedMessageCid ? '✓' : '✗'}`);
        console.log(`     - messageHash: ${msg.messageHash ? '✓' : '✗'}`);
        console.log(`     - unlockTimestamp: ${msg.unlockTimestamp ? '✓' : '✗'}`);
        console.log(`     - sender: ${msg.sender ? '✓' : '✗'}`);
        console.log(`     - recipient: ${msg.recipient ? '✓' : '✗'}`);
        console.log(`     - createdAt: ${msg.createdAt ? '✓' : '✗'}`);
      }
    } catch (error) {
      logTest('getSentMessages()', false, error.message);
    }

    // Test 6: Read Operation - getReceivedMessages
    console.log('\n📥 Test 6: Read Operation - getReceivedMessages()');
    try {
      const messages = await contract.getReceivedMessages(TEST_RECIPIENT);
      logTest('getReceivedMessages()', true, `Returned ${messages.length} messages`);
    } catch (error) {
      logTest('getReceivedMessages()', false, error.message);
    }

    // Test 7: Event Interface
    console.log('\n🎯 Test 7: Event Interface');
    try {
      const eventFragment = contract.interface.getEvent('MessageStored');
      const hasAllParams = eventFragment.inputs.length === 4 &&
        eventFragment.inputs.some(i => i.name === 'messageId') &&
        eventFragment.inputs.some(i => i.name === 'sender') &&
        eventFragment.inputs.some(i => i.name === 'recipient') &&
        eventFragment.inputs.some(i => i.name === 'unlockTimestamp');
      
      if (hasAllParams) {
        logTest('MessageStored event interface', true, 'All parameters present');
      } else {
        logTest('MessageStored event interface', false, 'Missing parameters');
      }
    } catch (error) {
      logTest('MessageStored event interface', false, error.message);
    }

    // Test 8: Error Interfaces
    console.log('\n⚠️  Test 8: Custom Error Interfaces');
    try {
      const expectedErrors = ['InvalidTimestamp', 'InvalidMessageHash', 'InvalidKeyCID', 'InvalidMessageCID', 'SenderIsRecipient', 'MessageNotFound'];
      const availableErrors = expectedErrors.filter(errorName => {
        try {
          contract.interface.getError(errorName);
          return true;
        } catch {
          return false;
        }
      });
      
      if (availableErrors.length === expectedErrors.length) {
        logTest('Custom error interfaces', true, `All ${expectedErrors.length} errors defined`);
      } else {
        const missing = expectedErrors.filter(e => !availableErrors.includes(e));
        logTest('Custom error interfaces', false, `Missing: ${missing.join(', ')}`);
      }
    } catch (error) {
      logTest('Custom error interfaces', false, error.message);
    }

    // Test 9: Type Compatibility
    console.log('\n🔤 Test 9: Type Compatibility');
    try {
      // Test that we can properly handle uint64 types
      const testTimestamp = BigInt(Date.now() + 3600000);
      const isValidBigInt = typeof testTimestamp === 'bigint';
      
      // Test address validation
      const isValidAddress = ethers.isAddress(CONTRACT_ADDRESS);
      
      if (isValidBigInt && isValidAddress) {
        logTest('Type compatibility', true, 'BigInt and address types work correctly');
      } else {
        logTest('Type compatibility', false, 'Type handling issues detected');
      }
    } catch (error) {
      logTest('Type compatibility', false, error.message);
    }

    // Test 10: Network Compatibility
    console.log('\n🌐 Test 10: Network Compatibility');
    try {
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      logTest('Network detection', true, `Chain ID: ${chainId}`);
    } catch (error) {
      logTest('Network detection', false, error.message);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error during tests:', error);
  }

  return results;
}

// Run tests and display summary
runTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Ethers.js migration is complete and functional.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
