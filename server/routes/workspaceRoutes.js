// routes/workspaceRoutes.js
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  saveWorkspaceById,
  downloadWorkspace,
  deleteWorkspaceById,
  deleteWorkspace,
  renameWorkspace,
} = require("../controllers/workspaceController");

router.use(requireAuth);

router.get("/", getAllWorkspaces);
router.post("/", createWorkspace);
router.get("/:id", getWorkspaceById);
router.post("/:id", saveWorkspaceById);
router.get("/:id/download", downloadWorkspace);
router.delete("/:id", deleteWorkspaceById);
router.delete("/:id", deleteWorkspace); // ✅ delete workspace
router.put("/:id", renameWorkspace); // ✅ rename workspace

module.exports = router;
