const express = require("express");
const cors = require("cors");
// const runCodeInDocker = require("./docker/runCodeInDocker");
const connectDB = require("./db"); // ⬅️ added
const runRoutes = require("./routes/runRoutes"); // ✅ Queue-based route

const authRoutes = require("./routes/auth");

// const snippetRoutes = require("./routes/snippetRoutes");

const workspaceRoutes = require("./routes/workspaceRoutes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDB(); // ⬅️ connect to MongoDB

app.use(cors());
app.use(express.json());

// app.post("/run", (req, res) => {
//   const code = req.body.code;
//   console.log("Received code:", code);

//   // For now, return dummy output
//   res.json({ output: "✅ Code received! Execution will happen later." });
// });

app.use("/api/auth", authRoutes);

// app.use("/api/snippets", snippetRoutes);

app.use("/api/workspace", workspaceRoutes);

app.use("/run", runRoutes); // ✅ Queue-run endpoint

// 🧠 Start job worker (handles Redis jobs)
require("./jobs/worker"); // ✅ worker will use ../redis.js internally

// app.post("/run", async (req, res) => {
//   const { code, language , input } = req.body;
//   // console.log(input  + "AARYAAA");
//   try {
//     const output = await runCodeInDocker(code, language , input);
//     res.json({ output });
//   } catch (err) {
//     res.json({ output: "❌ Error running code" });
//   }
// });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
