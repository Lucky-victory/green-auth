# @green-auth/snowflake-unique-id

A TypeScript implementation of Twitter's Snowflake ID generation algorithm with additional features for URL-safe short IDs.

## Installation

```bash
npm install @green-auth/snowflake-unique-id
```

## Usage

### Basic Usage

```ts
import { SnowflakeIdGenerator } from "@green-auth/snowflake-unique-id";

const generator = new SnowflakeIdGenerator({ nodeId: 1 });

// Generate a BigInt ID
const bigIntId = generator.bigIntId();
console.log(bigIntId); // e.g., "459185200908210193"

// Generate a URL-safe short ID
const urlSafeId = generator.urlSafeId();
console.log(urlSafeId); // e.g., "aB3x_9Yz"
```

## Custom configuration

```ts
const customGenerator = new SnowflakeIdGenerator({
  nodeId: 2,
  epoch: 1672531200000, // Custom epoch (e.g., 2023-01-01)
  nodeBits: 8,
  sequenceBits: 14,
  defaultShortIdLength: 10,
});

const customUrlSafeId = customGenerator.urlSafeId(12);
console.log(customUrlSafeId); // e.g., "aBcDeF123456"
```

## Types

### SnowflakeOptions

options: An object with the following properties:

- `nodeId` (required): number - Unique identifier for this generator instance (0 to 2^nodeBits - 1)
- `epoch` (optional): number - Custom epoch in milliseconds (default: 1609459200000, 2021-01-01)
- `nodeBits` (optional): number - Number of bits to use for node ID (default: 10)
- `sequenceBits` (optional): number - Number of bits to use for sequence (default: 12)
- `defaultShortIdLength` (optional): number - Default length for short IDs (default: 8)

### Methods

`bigIntId()`
Generates a unique BigInt ID.

```ts
bigIntId(): string
```

Returns: A string representation of the BigInt ID.

`urlSafeId(length?: number)`

Generates a URL-safe unique ID.

```ts
urlSafeId(length?: number): string
```

Parameters:

- `length` (optional): number - The desired length of the URL-safe ID (default: value of defaultShortIdLength option)

Returns: A URL-safe string ID.
