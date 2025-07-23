const Workspace = require("../models/Workspace");
const archiver = require("archiver");

const getAllWorkspaces = async (req, res) => {
  try {
    const all = await Workspace.find({ userId: req.user._id });
    // console.log(all);
    res.json(all);
  } catch (err) {
    console.error("❌ Failed to load all workspaces:", err);
    res.status(500).json({ message: "Error fetching workspaces" });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    res.json({
      tree: workspace.tree,
      contentMap: workspace.contentMap,
    });
  } catch (err) {
    console.error("Error fetching workspace:", err);
    res.status(500).json({ message: "❌ Failed to load workspace" });
  }
};

const createWorkspace = async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Workspace name is required" });
  console.log(name + "ksfhh");
  try {
    const newWorkspace = new Workspace({
      userId: req.user._id,
      name,
      tree: [],
      contentMap: {},
    });
    console.log("amritsaarrrr");
    await newWorkspace.save();
    console.log("adn");
    res.status(201).json({ success: true, id: newWorkspace._id });
  } catch (err) {
    console.error("Error creating workspace:", err);
    res.status(500).json({ message: "❌ Failed to create workspace" });
  }
};

const saveWorkspaceById = async (req, res) => {
  const { tree, contentMap } = req.body;
  try {
    await Workspace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { tree, contentMap },
      { new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving workspace:", err);
    res.status(500).json({ message: "❌ Failed to save workspace" });
  }
};

const downloadWorkspace = async (req, res) => {
  let i = 1;

  try {
    console.log(i++);
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    console.log(i++);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    console.log(i++);
    res.setHeader("Content-Disposition", "attachment; filename=workspace.zip");
    console.log(i++);
    res.setHeader("Content-Type", "application/zip");
    console.log(i++);

    const archive = archiver("zip", { zlib: { level: 9 } });
    console.log(i++);
    archive.pipe(res);
    console.log(i++);

    const addToArchive = (nodes, currentPath) => {
      nodes.forEach((node) => {
        const fullPath = currentPath
          ? `${currentPath}/${node.name}`
          : node.name;

        if (node.type === "file") {
          const content = workspace.contentMap[node.name] || "";
          archive.append(content, { name: fullPath });
        } else if (node.type === "folder") {
          addToArchive(node.children || [], fullPath);
        }
      });
    };
    console.log(i++);
    addToArchive(workspace.tree, "");
    console.log(i++);
    archive.finalize();
    console.log(i++);
  } catch (err) {
    console.error("❌ ZIP error:", err);
    res.status(500).json({ message: "❌ Failed to download workspace" });
  }
};

const deleteWorkspaceById = async (req, res) => {
  try {
    await Workspace.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to delete workspace" });
  }
};

// Delete Workspace
const deleteWorkspace = async (req, res) => {
  try {
    const result = await Workspace.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.json({ success: true, message: "Workspace deleted" });
  } catch (err) {
    console.error("❌ Error deleting workspace:", err);
    res.status(500).json({ message: "❌ Failed to delete workspace" });
  }
};

// Rename Workspace
const renameWorkspace = async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "New name is required" });
  }

  try {
    const updated = await Workspace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error("❌ Error renaming workspace:", err);
    res.status(500).json({ message: "❌ Failed to rename workspace" });
  }
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  saveWorkspaceById,
  downloadWorkspace,
  deleteWorkspaceById,
  renameWorkspace,
  deleteWorkspace,
};
