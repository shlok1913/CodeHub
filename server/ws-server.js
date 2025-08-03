// server/ws-server.js
const WebSocket = require("ws");
const Redis = require("ioredis");

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 8080 }); // you can use another port if needed

// Create Redis client for subscribing to job:<jobId>:result events
const sub = new Redis();

// Map to track which client is listening for which jobId
const clientJobMap = new Map();

wss.on("connection", (ws) => {
  console.log("🔌 New WebSocket connection established.");

  // When client sends a message (like { type: 'subscribe', jobId: 'xyz' })
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "subscribe" && data.jobId) {
        console.log(`📨 Client subscribed to job ${data.jobId}`);
        clientJobMap.set(data.jobId, ws);
      }
    } catch (err) {
      console.error("Invalid message received from client", err);
    }
  });

  // On socket close, clean up subscriptions
  ws.on("close", () => {
    for (const [jobId, client] of clientJobMap.entries()) {
      if (client === ws) {
        clientJobMap.delete(jobId);
      }
    }
    console.log("❌ WebSocket connection closed");
  });
});

// Subscribe to all Redis channels matching job:<jobId>:result
sub.psubscribe("job:*:result", (err, count) => {
  if (err) console.error("Redis psubscribe error:", err);
  else console.log("✅ Subscribed to Redis job:*:result channels");
});

sub.on("pmessage", (pattern, channel, message) => {
  // Extract jobId from channel name
  const jobId = channel.split(":")[1];
  const client = clientJobMap.get(jobId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(message); // message should be a JSON string with output/progress
  }
});
