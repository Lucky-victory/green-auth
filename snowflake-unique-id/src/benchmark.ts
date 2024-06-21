const { SnowflakeIdGenerator } = require("./index");

const generator = new SnowflakeIdGenerator({ nodeId: 1 });

function runBenchmark(iterations: number) {
  console.time("Benchmark");

  for (let i = 0; i < iterations; i++) {
    generator.bigIntId();
    generator.urlSafeId();
  }

  console.timeEnd("Benchmark");
}

runBenchmark(1000000); // Generate 1 million IDs of each type
