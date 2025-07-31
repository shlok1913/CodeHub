// jobs/worker.js

console.log("👷 Worker process starting...");
const { Worker } = require("bullmq");
const connection = require("../redis");
const runCodeInDocker = require("../docker/runCodeInDocker");


console.log("🔌 Initializing Worker with Redis...");
const worker = new Worker(
  "code-execution",
  async (job) => {
    const { code, language, input } = job.data;
    return await runCodeInDocker(code, language, input);
  },
  {
    connection,
    concurrency: 1, // Execute one job at a time
    lockDuration: 60000, // Lock the job for 60 seconds
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
