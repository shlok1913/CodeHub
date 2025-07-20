const mongoose = require("mongoose");

const WorkspaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  tree: {
    type: Array,
    default: [],
  },
  contentMap: {
    type: Object,
    default: {},
  },
});

module.exports = mongoose.model("Workspace", WorkspaceSchema);
