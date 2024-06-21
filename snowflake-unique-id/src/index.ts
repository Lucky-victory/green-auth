/**
 * Configuration options for the SnowflakeIdGenerator
 */
interface SnowflakeOptions {
  /** Unique identifier for this generator instance (0 to 2^nodeBits - 1) */
  nodeId: number;
  /**
   * Custom epoch in milliseconds (default: 1609459200000, 2021-01-01)
   * This is the starting point for your timestamp calculations
   */
  epoch?: number;
  /**
   * Number of bits to use for node ID (default: 10)
   * Determines the maximum number of nodes in your distributed system
   */
  nodeBits?: number;
  /**
   * Number of bits to use for sequence (default: 12)
   * Determines how many IDs can be generated per millisecond on a single node
   */
  sequenceBits?: number;
  /**
   * Default length for short IDs (default: 8)
   * Used when generating URL-safe IDs without specifying a length
   */
  defaultShortIdLength?: number;
}

/**
 * SnowflakeIdGenerator class for generating unique, time-sortable IDs
 */
export class SnowflakeIdGenerator {
  private nodeId: bigint;
  private epoch: bigint;
  private sequence: bigint = 0n;
  private lastTimestamp: bigint = -1n;

  private nodeBits: bigint;
  private sequenceBits: bigint;
  private defaultShortIdLength: number;

  // Dynamic calculation of bit-related constants
  private maxNodeId: bigint;
  private maxSequence: bigint;
  private timestampLeftShift: bigint;
  private nodeIdShift: bigint;

  /**
   * Constructor for SnowflakeIdGenerator
   * @param options Configuration options for the generator
   */
  constructor(options: SnowflakeOptions) {
    const {
      nodeId,
      epoch = 1609459200000, // Default: 2021-01-01T00:00:00.000Z
      nodeBits = 10,
      sequenceBits = 12,
      defaultShortIdLength = 8,
    } = options;

    this.nodeBits = BigInt(nodeBits);
    this.sequenceBits = BigInt(sequenceBits);
    this.defaultShortIdLength = defaultShortIdLength;

    // Calculate constants
    this.maxNodeId = (1n << this.nodeBits) - 1n;
    this.maxSequence = (1n << this.sequenceBits) - 1n;
    this.timestampLeftShift = this.nodeBits + this.sequenceBits;
    this.nodeIdShift = this.sequenceBits;

    if (nodeId < 0 || nodeId > Number(this.maxNodeId)) {
      throw new Error(`Node ID must be between 0 and ${this.maxNodeId}`);
    }

    this.nodeId = BigInt(nodeId);
    this.epoch = BigInt(epoch);
  }

  /**
   * Generates a unique BigInt ID
   * @returns A string representation of the BigInt ID
   */
  public bigIntId() {
    return this.nextId();
  }

  /**
   * Generates a URL-safe unique ID
   * @param len Length of the ID (default is 8)
   * @returns A URL-safe string ID
   */
  public urlSafeId(len: number = 8) {
    return this.nextShortId(len);
  }

  /**
   * Generates the next unique ID
   * @returns A string representation of the unique ID
   */
  private nextId(): string {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate ID.");
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.maxSequence;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << this.timestampLeftShift) |
      (this.nodeId << this.nodeIdShift) |
      this.sequence;

    return id.toString();
  }

  /**
   * Generates a short, URL-safe ID
   * @param length Length of the short ID
   * @returns A URL-safe string ID
   */
  private nextShortId(length: number = this.defaultShortIdLength): string {
    const id = BigInt(this.nextId());
    const randomBits = this.calculateRandomBits(length);
    const randomPart = this.getRandomBigInt(randomBits);
    const combinedId = (id << BigInt(randomBits)) | randomPart;
    return this.toBase62(combinedId, length);
  }

  /**
   * Calculates the number of random bits to use in short ID generation
   * @param idLength Desired length of the ID
   * @returns Number of random bits to use
   */
  private calculateRandomBits(idLength: number): number {
    // Estimate bits of information in the ID
    const totalBits = Math.floor(idLength * Math.log2(62));

    // Use about 1/4 of total bits for randomness, with some bounds
    return Math.max(8, Math.min(16, Math.floor(totalBits / 4)));
  }

  /**
   * Generates a random BigInt with the specified number of bits
   * @param bits Number of random bits to generate
   * @returns A random BigInt
   */
  private getRandomBigInt(bits: number): bigint {
    const randomBytes = new Uint8Array(Math.ceil(bits / 8));
    crypto.getRandomValues(randomBytes);
    let result = 0n;
    for (let i = 0; i < randomBytes.length; i++) {
      result = (result << 8n) | BigInt(randomBytes[i]);
    }
    return result & ((1n << BigInt(bits)) - 1n); // Mask to the desired number of bits
  }

  /**
   * Converts a BigInt to a base62 string
   * @param num BigInt to convert
   * @param length Desired length of the output string
   * @returns Base62 encoded string
   */
  private toBase62(num: bigint, length: number): string {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-0123456789";
    const base = BigInt(characters.length);
    let encoded = "";

    while (num > 0) {
      const remainder = num % base;
      encoded = characters[Number(remainder)] + encoded;
      num = num / base;
    }

    // Pad with random characters if necessary
    while (encoded.length < length) {
      encoded =
        characters[Math.floor(Math.random() * characters.length)] + encoded;
    }

    // Truncate if the encoded string is longer than the desired length
    return encoded.slice(-length);
  }

  /**
   * Gets the current timestamp as a BigInt
   * @returns Current timestamp as BigInt
   */
  private currentTimestamp(): bigint {
    return BigInt(Date.now());
  }

  /**
   * Waits until the next millisecond
   * @param lastTimestamp Last timestamp used
   * @returns New timestamp
   */
  private waitNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }
}
