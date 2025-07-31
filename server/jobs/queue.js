const { Queue } = require("bullmq");
const connection = require("../redis");

const codeQueue = new Queue("code-execution", { connection });

async function addCodeJob({ code, language, input }) {
  return await codeQueue.add(
    "run-code",
    {
      code,
      language,
      input: input || "",
    },
    {
      attempts: 2,
      removeOnComplete: true,
      removeOnFail: false,
      timeout: 15000,
    }
  );
}

module.exports = {
  addCodeJob,
  codeQueue,
};
