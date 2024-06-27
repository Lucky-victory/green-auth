import { Web3AuthHandler } from "../index";
import { db } from "../../../../db";
import { v4 as uuidV4 } from "uuid";

// Mock the database and uuid
jest.mock("../../../../db", () => ({
  db: {
    insert: jest.fn().mockReturnValue({ values: jest.fn() }),
  },
}));
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("Web3AuthHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (uuidV4 as jest.Mock).mockReturnValue("mocked-uuid");
  });

  describe("solanaRequestMessage", () => {
    it("should create and return a message for Solana authentication", async () => {
      const req = {
        body: {
          address: "solana-address",
          chain: "solana",
          network: "mainnet",
        },
      } as any;
      const res = {
        json: jest.fn(),
      } as any;

      await Web3AuthHandler.solanaRequestMessage(req, res);

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining(
          "Please sign this message to confirm your identity"
        ),
      });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining("Address: solana-address"),
      });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining("Chain: solana"),
      });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining("Network: mainnet"),
      });
    });

    it("should handle errors and return a 500 status", async () => {
      const req = {
        body: {},
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (db.insert as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await Web3AuthHandler.solanaRequestMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Database error",
      });
    });
  });

  describe("ethereumRequestMessage", () => {
    it("should create and return a message for Ethereum authentication", async () => {
      const req = {
        body: {
          address: "ethereum-address",
          chain: "ethereum",
          network: "mainnet",
        },
      } as any;
      const res = {
        json: jest.fn(),
      } as any;

      await Web3AuthHandler.ethereumRequestMessage(req, res);

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining(
          "Please sign this message to confirm your identity"
        ),
      });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining("Address: ethereum-address"),
      });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining("Chain: ethereum"),
      });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.stringContaining("Network: mainnet"),
      });
    });

    it("should handle errors and return a 500 status", async () => {
      const req = {
        body: {},
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (db.insert as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await Web3AuthHandler.ethereumRequestMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Database error",
      });
    });
  });
});
