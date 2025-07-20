const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

const authRoutes = require("./routes/auth");


require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;




connectDB(); // ⬅️ connect to MongoDB




app.use(cors());
app.use(express.json());



app.use("/api/auth", authRoutes);




app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
