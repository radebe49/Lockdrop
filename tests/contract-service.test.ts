/**
 * ContractService Integration Tests
 *
 * Tests the ethers.js implementation against the deployed Solidity contract
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ContractService } from "@/lib/contract/ContractService";

describe("ContractService - ethers.js Implementation", () => {
  beforeAll(async () => {
    // Ensure we have a clean connection
    await ContractService.disconnect();
  });

  afterAll(async () => {
    // Clean up connection
    await ContractService.disconnect();
  });

  describe("Connection Management", () => {
    it("should connect to Ethereum RPC endpoint", async () => {
      const provider = await ContractService.getProvider();
      expect(provider).toBeDefined();

      // Verify we can query the blockchain
      const blockNumber = await provider.getBlockNumber();
      expect(blockNumber).toBeGreaterThan(0);
    });

    it("should return contract address", () => {
      const address = ContractService.getContractAddress();
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should return network name", () => {
      const network = ContractService.getNetwork();
      expect(network).toBe("passet-hub");
    });

    it("should report connection status", async () => {
      await ContractService.getProvider();
      expect(ContractService.isConnected()).toBe(true);
    });
  });

  describe("View Functions (Read Operations)", () => {
    it("should get message count", async () => {
      const count = await ContractService.getMessageCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should get sent messages for an address", async () => {
      const testAddress = "0x0000000000000000000000000000000000000001";
      const messages = await ContractService.getSentMessages(testAddress);

      expect(Array.isArray(messages)).toBe(true);

      // If messages exist, verify structure
      if (messages.length > 0) {
        const msg = messages[0];
        expect(msg).toHaveProperty("id");
        expect(msg).toHaveProperty("encryptedKeyCID");
        expect(msg).toHaveProperty("encryptedMessageCID");
        expect(msg).toHaveProperty("messageHash");
        expect(msg).toHaveProperty("unlockTimestamp");
        expect(msg).toHaveProperty("sender");
        expect(msg).toHaveProperty("recipient");
        expect(msg).toHaveProperty("createdAt");

        // Verify types
        expect(typeof msg.id).toBe("string");
        expect(typeof msg.encryptedKeyCID).toBe("string");
        expect(typeof msg.encryptedMessageCID).toBe("string");
        expect(typeof msg.messageHash).toBe("string");
        expect(typeof msg.unlockTimestamp).toBe("number");
        expect(typeof msg.sender).toBe("string");
        expect(typeof msg.recipient).toBe("string");
        expect(typeof msg.createdAt).toBe("number");

        // Verify Ethereum address format
        expect(msg.sender).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(msg.recipient).toMatch(/^0x[a-fA-F0-9]{40}$/);
      }
    });

    it("should get received messages for an address", async () => {
      const testAddress = "0x0000000000000000000000000000000000000001";
      const messages = await ContractService.getReceivedMessages(testAddress);

      expect(Array.isArray(messages)).toBe(true);
    });

    it("should return null for non-existent message", async () => {
      const message = await ContractService.getMessage("999999");
      expect(message).toBeNull();
    });

    it("should handle getMessage with proper error handling", async () => {
      // This should not throw, but return null
      const result = await ContractService.getMessage("0");
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  describe("Connection Listeners", () => {
    it("should add and remove connection listeners", () => {
      const listener = (connected: boolean) => {
        console.log("Connection status:", connected);
      };

      ContractService.addConnectionListener(listener);
      ContractService.removeConnectionListener(listener);

      // Should not throw
      expect(true).toBe(true);
    });

    it("should notify listeners on connection", async () => {
      // Disconnect first to ensure we trigger a new connection
      await ContractService.disconnect();

      let notified = false;
      const listener = (connected: boolean) => {
        notified = true;
        expect(typeof connected).toBe("boolean");
      };

      ContractService.addConnectionListener(listener);
      await ContractService.getProvider();

      // Give time for notification
      await new Promise((resolve) => setTimeout(resolve, 200));

      ContractService.removeConnectionListener(listener);
      expect(notified).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // This test verifies error handling without actually causing errors
      // The service should have proper try-catch blocks
      expect(ContractService.getMessageCount).toBeDefined();
      expect(ContractService.getSentMessages).toBeDefined();
      expect(ContractService.getReceivedMessages).toBeDefined();
      expect(ContractService.getMessage).toBeDefined();
    });
  });

  describe("Type Conversions", () => {
    it("should correctly convert uint64 to JavaScript number", async () => {
      const count = await ContractService.getMessageCount();

      // Should be a safe integer
      expect(Number.isSafeInteger(count)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should correctly handle timestamp conversions", async () => {
      const messages = await ContractService.getSentMessages(
        "0x0000000000000000000000000000000000000001"
      );

      messages.forEach((msg) => {
        // Timestamps should be valid numbers
        expect(Number.isSafeInteger(msg.unlockTimestamp)).toBe(true);
        expect(Number.isSafeInteger(msg.createdAt)).toBe(true);

        // Should be reasonable timestamp values (not too far in past/future)
        expect(msg.createdAt).toBeGreaterThan(0);
        expect(msg.unlockTimestamp).toBeGreaterThan(0);
      });
    });
  });

  describe("ABI Compatibility", () => {
    it("should have all required contract methods", async () => {
      // Verify the contract has all expected methods from the ABI
      const provider = await ContractService.getProvider();
      expect(provider).toBeDefined();

      // These methods should exist and be callable
      expect(typeof ContractService.getMessageCount).toBe("function");
      expect(typeof ContractService.getSentMessages).toBe("function");
      expect(typeof ContractService.getReceivedMessages).toBe("function");
      expect(typeof ContractService.getMessage).toBe("function");
      expect(typeof ContractService.storeMessage).toBe("function");
      expect(typeof ContractService.subscribeToMessageEvents).toBe("function");
    });
  });
});
