// jobs/worker.js

console.log("👷 Worker process starting...");
const { Worker } = require("bullmq");
const connection = require("../redis");
const runCodeInDocker = require("../docker/runCodeInDocker");
const Redis = require("ioredis");

const pub = new Redis(); // Redis publisher

console.log("🔌 Initializing Worker with Redis...");
const worker = new Worker(
  "code-execution",
  async (job) => {
    const { code, language, input } = job.data;

    // 🔄 Send progress update BEFORE actual execution
    await pub.publish(
      `job:${job.id}:result`,
      JSON.stringify({
        type: "progress",
        message: "Running your code...",
        jobId: job.id, // ✅ Add this
      })
    );

    try {
      const output = await runCodeInDocker(code, language, input);

      // publish successful result
      await pub.publish(
        `job:${job.id}:result`,
        JSON.stringify({
          type: "result",
          output,
          jobId: job.id, // ✅ Add this
        })
      );

      return { output };
    } catch (err) {
      // publish error
      await pub.publish(
        `job:${job.id}:result`,
        JSON.stringify({
          type: "error",
          error: err.message || "Unknown error",
          jobId: job.id, // ✅ Add this
        })
      );

      throw err;
    }
  },
  {
    connection,
    concurrency: 1,
    lockDuration: 60000,
  }
);

// Event listeners
worker.on("active", (job) => {
  console.log(`🎯 Job ${job.id} is running`);
});

worker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} finished`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});
