import { SnowflakeIdGenerator } from "../src/index";
import { describe, expect, test, beforeEach } from "@jest/globals";
describe("SnowflakeIdGenerator", () => {
  let generator: SnowflakeIdGenerator;

  beforeEach(() => {
    generator = new SnowflakeIdGenerator({ nodeId: 1 });
  });

  test("constructor throws error for invalid nodeId", () => {
    expect(() => new SnowflakeIdGenerator({ nodeId: -1 })).toThrow();
    expect(() => new SnowflakeIdGenerator({ nodeId: 1024 })).toThrow();
  });

  test("bigIntId generates unique IDs", () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      const id = generator.bigIntId();
      expect(ids.has(id)).toBeFalsy();
      ids.add(id);
    }
  });

  test("urlSafeId generates IDs of correct length", () => {
    expect(generator.urlSafeId()).toHaveLength(8);
    expect(generator.urlSafeId(12)).toHaveLength(12);
  });

  test("urlSafeId generates unique IDs", () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      const id = generator.urlSafeId(16);
      expect(ids.has(id)).toBeFalsy();
      ids.add(id);
    }
  });

  test("urlSafeId uses only allowed characters", () => {
    const allowedChars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-0123456789";
    for (let i = 0; i < 100; i++) {
      const id = generator.urlSafeId();
      expect(
        id.split("").every((char) => allowedChars.includes(char))
      ).toBeTruthy();
    }
  });

  test("bigIntId generates monotonically increasing IDs", () => {
    let prevId = BigInt(generator.bigIntId());
    for (let i = 0; i < 1000; i++) {
      const currentId = BigInt(generator.bigIntId());
      expect(currentId).toBeGreaterThan(prevId);
      prevId = currentId;
    }
  });

  test("multiple generators with different nodeIds produce unique IDs", () => {
    const generator1 = new SnowflakeIdGenerator({ nodeId: 1 });
    const generator2 = new SnowflakeIdGenerator({ nodeId: 2 });
    const ids = new Set();

    for (let i = 0; i < 500; i++) {
      const id1 = generator1.bigIntId();
      const id2 = generator2.bigIntId();
      expect(ids.has(id1)).toBeFalsy();
      expect(ids.has(id2)).toBeFalsy();
      ids.add(id1);
      ids.add(id2);
    }
  });

  test("generator handles high concurrency", () => {
    const ids = new Set();
    const generateConcurrently = () => {
      for (let i = 0; i < 1000; i++) {
        const id = generator.bigIntId();
        expect(ids.has(id)).toBeFalsy();
        ids.add(id);
      }
    };

    // Simulate concurrent generation
    generateConcurrently();
    generateConcurrently();
    generateConcurrently();
  });
});
