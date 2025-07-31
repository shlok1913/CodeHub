import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import Header from "../components/Header";
import TreeNode from "../components/TreeNode";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

// const templates = {
//   javascript: "// Write your JS code here",
//   cpp: `#include <iostream>
// using namespace std;

// int main() {
//   cout << "Hello from C++" << endl;
//   return 0;
// }`,
// };

export default function EditorPage() {
  const { id: workspaceId } = useParams(); // ✅ 'id' matches the route `/editor/:id`

  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [fileTree, setFileTree] = useState([]);
  const [contentMap, setContentMap] = useState({});
  const nextId = useRef(1);

  const [currentPath, setCurrentPath] = useState(null);
  const [code, setCode] = useState("");

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const [showTerminal, setShowTerminal] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false);

  // const getLanguageFromExtension = (filename) => {
  //   const ext = filename.split(".").pop().toLowerCase();
  //   switch (ext) {
  //     case "js":
  //       return "javascript";
  //     case "cpp":
  //     case "cc":
  //     case "cxx":
  //       return "cpp";
  //     default:
  //       return "unsupported";
  //   }
  // };

  const getLanguageFromExtension = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();

  switch (ext) {
    case "js":
      return "javascript";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "c":
      return "c";
    case "py":
      return "python";
    case "java":
      return "java";
    case "go":
      return "go";
    case "rb":
      return "ruby";
    default:
      return "unsupported";
  }
};


const getMonacoLanguage = (language) => {
  switch (language) {
    case "cpp":
      return "cpp";
    case "c":
      return "c";
    case "javascript":
      return "javascript";
    case "python":
      return "python";
    case "java":
      return "java";
    case "go":
      return "go";
    case "ruby":
      return "ruby";
    default:
      return "plaintext"; // fallback for unsupported
  }
};



  useEffect(() => {
    if (!user || !token) return;
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/workspace/${workspaceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { tree, contentMap } = await res.json();
        setFileTree(tree || []);
        setContentMap(contentMap || {});
        nextId.current = findMaxId(tree) + 1;
      } catch (err) {
        console.error("❌ Failed to fetch workspace", err);
        alert("❌ Invalid workspace ID");
        navigate("/"); // redirect to home
      }
    })();
  }, [user, token]);

  const findMaxId = (tree) => {
    let max = 0;
    const dfs = (nodes) => {
      for (const node of nodes) {
        if (node.id > max) max = node.id;
        if (node.children) dfs(node.children);
      }
    };
    dfs(tree);
    return max;
  };

  const findNodeById = (nodes, targetId) => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNodeById(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const downloadZip = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/workspace/${workspaceId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch ZIP");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "workspace.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error downloading ZIP:", err);
      alert("❌ Failed to download ZIP");
    }
  };

  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(async () => {
      try {
        await fetch(`http://localhost:3001/api/workspace/${workspaceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tree: fileTree, contentMap }),
        });
        setSaveStatus("✅ Saved");
        setTimeout(() => setSaveStatus(""), 1500);
      } catch (err) {
        console.error("❌ Auto-save failed:", err);
        setSaveStatus("❌ Auto-save failed");
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [fileTree, contentMap, token]);

  const handleNewFile = (parentId) => {
    let name = prompt("New file name:");
    if (!name) return;
    if (!name.includes(".")) name += ".txt";

    const parent = findNodeById(fileTree, parentId);
    const siblings = parent?.children || fileTree;

    const isDuplicate = siblings.some((node) => {
      if (node.type !== "file") return false;
      const [base1, ext1] = node.name.split(".");
      const [base2, ext2] = name.split(".");
      return base1 === base2 && ext1 === ext2;
    });

    if (isDuplicate) {
      alert("🚫 File with same name and extension already exists!");
      return;
    }

    const newNode = { id: nextId.current++, name, type: "file" };
    setFileTree((tree) => insertNode(tree, parentId, newNode));
    setContentMap((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNewFolder = (parentId) => {
    const name = prompt("New folder name:");
    if (!name) return;

    const parent = findNodeById(fileTree, parentId);
    const siblings = parent?.children || fileTree;

    const isDuplicate = siblings.some(
      (node) => node.type === "folder" && node.name === name
    );

    if (isDuplicate) {
      alert("🚫 Folder with this name already exists!");
      return;
    }

    const newNode = {
      id: nextId.current++,
      name,
      type: "folder",
      children: [],
    };
    setFileTree((tree) => insertNode(tree, parentId, newNode));
  };

  const insertNode = (tree, parentId, newNode) => {
    if (parentId === null) return [...tree, newNode];
    return tree.map((node) => {
      if (node.id === parentId && node.type === "folder") {
        const children = node.children
          ? [...node.children, newNode]
          : [newNode];
        return { ...node, children };
      } else if (node.children) {
        return {
          ...node,
          children: insertNode(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };
  const handleRename = (id, newName) => {
    const renameRecursive = (nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          const oldName = node.name;

          if (node.type === "file") {
            setContentMap((prev) => {
              const updated = { ...prev };
              updated[newName] = updated[oldName] || "";
              delete updated[oldName];
              return updated;
            });

            if (currentPath === oldName) {
              setCurrentPath(newName);
              setCode(contentMap[oldName] || "");
            }

            // Update open tabs if using multi-tab editor
            setOpenTabs((tabs) =>
              tabs.map((tab) => (tab === oldName ? newName : tab))
            );
          }

          return { ...node, name: newName };
        } else if (node.children) {
          return { ...node, children: renameRecursive(node.children) };
        }
        return node;
      });

    setFileTree((tree) => renameRecursive(tree));
  };

  const renameById = (nodes, targetId, newName) => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return {
          ...node,
          children: renameById(node.children, targetId, newName),
        };
      }
      return node;
    });
  };

  const handleDelete = (idToDelete) => {
    const deletedNames = [];

    const deleteRecursive = (nodes) => {
      return nodes
        .filter((node) => {
          const shouldDelete = node.id === idToDelete;
          if (shouldDelete && node.type === "file") {
            deletedNames.push(node.name);
          }
          return !shouldDelete;
        })
        .map((node) => {
          if (node.children) {
            return { ...node, children: deleteRecursive(node.children) };
          }
          return node;
        });
    };

    setFileTree((tree) => deleteRecursive(tree));

    setContentMap((prev) => {
      const updated = { ...prev };
      deletedNames.forEach((name) => delete updated[name]);
      return updated;
    });

    // If deleted file is currently open, clear editor
    if (deletedNames.includes(currentPath)) {
      setCurrentPath(null);
      setCode("");
    }

    // Also close tab if you’ve implemented tabs (optional)
    setOpenTabs((tabs) => tabs.filter((tab) => !deletedNames.includes(tab)));
  };

  const deleteById = (nodes, targetId, deletedFileNames) => {
    return nodes
      .map((node) => {
        if (node.id === targetId) {
          collectFiles(node, deletedFileNames);
          return null;
        }
        if (node.children) {
          return {
            ...node,
            children: deleteById(node.children, targetId, deletedFileNames),
          };
        }
        return node;
      })
      .filter(Boolean);
  };

  const collectFiles = (node, names) => {
    if (node.type === "file") names.push(node.name);
    if (node.children) {
      node.children.forEach((child) => collectFiles(child, names));
    }
  };

  const handleRun = async () => {
    if (language === "unsupported") {
      setOutput("❌ Cannot run: Unsupported file type.");
      return;
    }

    setShowTerminal(true);
    setOutput(""); // Optional: Clear output on new run
  };

const handleExecute = async () => {
  setOutput("⏳ Queued for execution...");
  try {
    console.log("asdf");
    const res = await fetch("http://localhost:3001/run/runn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, input: userInput }),
    });
    const data = await res.json();
    console.log("WJGF");
    if (data.output) {
      setOutput(data.output);
    } else if (data.error) {
      setOutput(`❌ ${data.error}`);
    } else {
      setOutput("❌ Unknown error occurred");
    }
  } catch (err) {
    setOutput("❌ Error connecting to server");
    console.error(err);
  }
};


  useEffect(() => {
    if (!currentPath) return;
    const lang = getLanguageFromExtension(currentPath);
    setLanguage(lang);
  }, [currentPath]);

  return (
    <>
      <Header />

      {/* Workspace Controls */}
      <div className="p-2 flex gap-4 bg-gray-50 border-b">
        <button
          onClick={() => {
            navigate("/");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded"
        >
          🔁 Switch Workspace
        </button>
        <button
          onClick={downloadZip}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded"
        >
          ⬇️ Download ZIP
        </button>
      </div>

      {/* Main Editor Layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-96px)]">
        {/* Sidebar */}
        {/* Sidebar */}
<div className="w-full md:w-64 bg-white border-r overflow-y-auto p-4">
  {/* Workspace Name */}
  <div className="text-lg font-semibold text-gray-800 mb-4 px-2 truncate">
    📁 CodeHub
  </div>

  {/* Action Buttons */}
  <div className="mb-4 flex gap-2">
    <button
      onClick={() => handleNewFile(null)}
      className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
    >
      <span>📄</span> File
    </button>
    <button
      onClick={() => handleNewFolder(null)}
      className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
    >
      <span>📁</span> Folder
    </button>
  </div>

  {/* File Tree */}
  {fileTree.map((node) => (
    <TreeNode
      key={node.id}
      node={node}
      onSelect={(file) => {
        const isOpen = openTabs.some((tab) => tab.name === file.name);
        if (!isOpen) {
          setOpenTabs([...openTabs, { name: file.name, id: file.id }]);
        }
        setActiveTab(file.name);
        setCurrentPath(file.name);
        setCode(contentMap[file.name] || "");
      }}
      onNewFile={handleNewFile}
      onNewFolder={handleNewFolder}
      onRename={handleRename}
      onDelete={handleDelete}
    />
  ))}
</div>


        {/* Editor Panel */}
        <div
          className={`flex-grow overflow-y-auto p-4 bg-gray-50 ${
            isFullScreen ? "hidden" : ""
          }`}
        >
          {currentPath ? (
            <>
              <div className="relative border-b border-gray-300 mb-4">
                {/* Scrollable tabs container */}
                <div className="overflow-x-auto scrollbar-hide pr-[120px]">
                  {" "}
                  {/* leave space for run btn */}
                  <div className="flex w-max whitespace-nowrap">
                    {openTabs.map((tab) => (
                      <div
                        key={tab.name}
                        onClick={() => {
                          setActiveTab(tab.name);
                          setCurrentPath(tab.name);
                          setCode(contentMap[tab.name] || "");
                        }}
                        className={`flex items-center px-4 py-1 h-[36px] cursor-pointer border-r border-gray-300 transition ${
                          tab.name === activeTab
                            ? "bg-white border-t border-l border-r border-b-0 font-semibold"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <span className="truncate max-w-[200px]">
                          {tab.name}
                        </span>
                        {tab.name === activeTab && (
                          <span
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTabs((tabs) =>
                                tabs.filter((t) => t.name !== tab.name)
                              );
                              if (activeTab === tab.name) {
                                const remaining = openTabs.filter(
                                  (t) => t.name !== tab.name
                                );
                                const next = remaining[remaining.length - 1];
                                if (next) {
                                  setActiveTab(next.name);
                                  setCurrentPath(next.name);
                                  setCode(contentMap[next.name] || "");
                                } else {
                                  setActiveTab(null);
                                  setCurrentPath(null);
                                  setCode("");
                                }
                              }
                            }}
                          >
                            ❌
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Run button */}
                <div className="absolute right-2 inset-y-0 flex items-center">
                  <button
                    onClick={handleRun}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 h-[36px] rounded-t-md transition"
                  >
                    ▶️ Run
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <Editor
                height="300px"
                language={getMonacoLanguage(language)}
                value={code}
                onChange={(value) => {
                  const updated = value || "";
                  setCode(updated);
                  setContentMap((prev) => ({
                    ...prev,
                    [currentPath]: updated,
                  }));
                }}
                theme="vs-dark"
              />

              {showTerminal && (
                <div className="mt-2 text-right">
                  <button
                    className="text-sm text-red-400 hover:text-red-500 underline"
                    onClick={() => setShowTerminal(false)}
                  >
                    ⬇️ Hide Terminal
                  </button>
                </div>
              )}

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  showTerminal ? "max-h-[500px] mt-6" : "max-h-0"
                }`}
              >
                <div className="bg-black text-green-400 font-mono text-sm rounded-md p-4 shadow-inner border border-gray-700">
                  <div className="mb-2">
                    <span className="text-white">$ Input:</span>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      rows={3}
                      placeholder="Enter stdin here..."
                      className="w-full mt-1 bg-black text-green-400 border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-green-600 resize-y"
                    />
                  </div>

                  <button
                    onClick={handleExecute}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-1 rounded mt-2 mb-4"
                  >
                    ▶️ Execute
                  </button>

                  <div className="overflow-auto max-h-60 bg-black border border-gray-600 rounded-md p-3 whitespace-pre-wrap">
                    <span className="text-white">💻 Output:</span>
                    <pre className="mt-2">{output}</pre>
                  </div>

                  {saveStatus && (
                    <div className="mt-2 text-xs text-gray-400">
                      {saveStatus}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-sm">
              📝 Select or create a file to start editing.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
