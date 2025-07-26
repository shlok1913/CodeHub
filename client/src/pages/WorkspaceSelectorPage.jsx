import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { scanDirectory } from "../utils/scanDirectory";

export default function WorkspaceSelector({ onSelect }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [contextMenu, setContextMenu] = useState(null); // { x, y, wsId }

  

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/workspace", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // console.log(data);
        setWorkspaces(data);
        // console.log(workspaces +  " riuae");
      } catch (err) {
        console.error("❌ Error loading workspaces:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newWorkspaceName }),
      });
      console.log("amer1");
      const result = await res.json();
      console.log("amer" + result);
      window.location.reload();
    } catch (err) {
      console.error("❌ Create failed:", err);
      alert("Failed to create workspace");
    }
  };

  const handleOpenLocalFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const { tree, contentMap, unsupportedFiles } = await scanDirectory(
        dirHandle
      );

      if (unsupportedFiles.length > 0) {
        alert(
          `❌ This folder contains unsupported or binary files:\n${unsupportedFiles.join(
            "\n"
          )}`
        );
        return;
      }

      // Step 1: Create Workspace
      const res = await fetch("http://localhost:3001/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: dirHandle.name }),
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        alert(data.message || "❌ Failed to create workspace");
        return;
      }

      // Step 2: Save Workspace Content
      const saveRes = await fetch(
        `http://localhost:3001/api/workspace/${data.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tree, contentMap }),
        }
      );

      if (!saveRes.ok) {
        alert("❌ Failed to save workspace. Rolling back...");

        // Step 3: Clean up the created workspace (optional)
        await fetch(`http://localhost:3001/api/workspace/${data.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return;
      }

      // All good — navigate to editor
      // navigate(`/editor/${data.id}`);
      window.location.reload();
    } catch (err) {
      console.error("❌ Error opening folder:", err);
      alert("❌ Something went wrong while opening this folder.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workspace?"))
      return;

    try {
      const res = await fetch(`http://localhost:3001/api/workspace/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("❌ Failed to delete workspace");
        return;
      }

      setWorkspaces(workspaces.filter((w) => w._id !== id));
    } catch (err) {
      console.error("❌ Error deleting:", err);
      alert("❌ Could not delete workspace.");
    }
  };

  const handleRename = async (workspace) => {
    const newName = prompt("Enter new workspace name:", workspace.name);
    if (!newName || newName.trim() === workspace.name) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/workspace/${workspace._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!res.ok) {
        alert("❌ Failed to rename workspace");
        return;
      }

      const updated = await res.json();
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspace._id ? { ...w, name: updated.updated.name } : w
        )
      );
    } catch (err) {
      console.error("❌ Error renaming:", err);
      alert("❌ Could not rename workspace.");
    }
  };

  if (loading) return <div>Loading workspaces...</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
            🗂️ Your Workspaces
          </h2>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-6 transition"
          >
            ➕ Create New Workspace
          </button>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-6 transition"
            onClick={handleOpenLocalFolder}
          >
            📂 Open Folder as Workspace
          </button>

          {workspaces.length > 0 ? (
            <ul className="space-y-3">
              {workspaces.map((ws) => (
                <li
                  key={ws._id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      wsId: ws._id,
                    });
                  }}
                >
                  <button
                    onClick={() => {
                      // onSelect(ws._id);
                      navigate(`/editor/${ws._id}`);
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-left shadow-sm transition"
                  >
                    {ws.name}
                  </button>
                </li>
              ))}
              {contextMenu && (
                <div
                  className="absolute z-50 bg-white shadow-lg border border-gray-200 rounded w-36"
                  style={{ top: contextMenu.y, left: contextMenu.x }}
                  onClick={() => setContextMenu(null)} // close on click
                  onContextMenu={(e) => e.preventDefault()} // prevent nested context
                >
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    onClick={() => {
                      const ws = workspaces.find(
                        (w) => w._id === contextMenu.wsId
                      );
                      handleRename(ws);
                      setContextMenu(null);
                    }}
                  >
                    ✏️ Rename
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
                    onClick={() => {
                      handleDelete(contextMenu.wsId);
                      setContextMenu(null);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">
              No workspaces yet — create one above.
            </p>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h3 className="text-xl font-medium mb-4">Create Workspace</h3>
              <input
                type="text"
                placeholder="Workspace Name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setNewWorkspaceName("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCreate();
                    setModalOpen(false);
                    setNewWorkspaceName("");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
