const express = require("express");
const cors = require("cors");
const runCodeInDocker = require("./runcodeindocker");
const connectDB = require("./db");

const authRoutes = require("./routes/auth");

const workspaceRoutes = require("./routes/workspaceRoutes");


require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;




connectDB(); // ⬅️ connect to MongoDB




app.use(cors());
app.use(express.json());



app.use("/api/auth", authRoutes);

app.use("/api/workspace", workspaceRoutes);




app.post("/run", async (req, res) => {
  const { code, language, input } = req.body;
  // console.log(input  + "AARYAAA");
  try {
    const output = await runCodeInDocker(code, language, input);
    res.json({ output });
  } catch (err) {
    res.json({ output: "❌ Error running code" });
  }
});







app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
