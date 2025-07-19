const express = require("express");
const cors = require("cors");

const connectDB = require("./db");


require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;




connectDB(); // ⬅️ connect to MongoDB

app.use(cors());
app.use(express.json());




app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
