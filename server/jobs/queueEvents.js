const { QueueEvents } = require("bullmq");
const connection = require("../redis");

// Single instance to listen to "code-execution" queue
const codeQueueEvents = new QueueEvents("code-execution", { connection });

module.exports = codeQueueEvents;
