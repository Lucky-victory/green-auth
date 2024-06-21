API
SnowflakeIdGenerator
Constructor
typescriptCopynew SnowflakeIdGenerator(options: SnowflakeOptions)

options.nodeId: Unique identifier for this generator instance (required)
options.epoch: Custom epoch in milliseconds (default: 1609459200000, 2021-01-01)
options.nodeBits: Number of bits to use for node ID (default: 10)
options.sequenceBits: Number of bits to use for sequence (default: 12)
options.defaultShortIdLength: Default length for short IDs (default: 8)

Methods

bigIntId(): Generates a unique BigInt ID as a string
urlSafeId(length?: number): Generates a URL-safe unique ID of specified length (default: 8)
