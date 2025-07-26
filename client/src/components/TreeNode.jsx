// src/components/TreeNode.jsx
import React, { useState, useRef, useEffect } from "react";

export default function TreeNode({
  node,
  onSelect,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef();

  const handleRightClick = (e) => {
    e.preventDefault();
    setContextMenuPos({ x: e.pageX, y: e.pageY });
    setShowMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      style={{ marginLeft: 8, position: "relative" }}
      onContextMenu={handleRightClick}
    >
      {node.type === "folder" ? (
        <>
          {/* Folder name row with +file and +folder icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <div onClick={() => setOpen((o) => !o)}>
              {open ? "📂" : "📁"} {node.name}
            </div>
            <button
              onClick={() => onNewFile(node.id)}
              title="New File"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              📄
            </button>
            <button
              onClick={() => onNewFolder(node.id)}
              title="New Folder"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              📁
            </button>
          </div>

          {/* Children */}
          {open &&
            node.children?.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                onSelect={onSelect}
                onNewFile={onNewFile}
                onNewFolder={onNewFolder}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
        </>
      ) : (
        <div
          style={{  cursor: "pointer" }}
          onClick={() => onSelect(node)}
        >
          📄 {node.name}
        </div>
      )}

      {/* Right-click context menu */}
      {showMenu && (
        <ul
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${contextMenuPos.y}px`,
            left: `${contextMenuPos.x}px`,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "0.5rem",
            listStyle: "none",
            zIndex: 9999,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <li
            style={{ padding: "4px 8px", cursor: "pointer" }}
            onClick={() => {
              const newName = prompt("Rename to:", node.name);
              if (newName) onRename(node.id, newName);
              setShowMenu(false);
            }}
          >
            ✏️ Rename
          </li>
          <li
            style={{ padding: "4px 8px", cursor: "pointer", color: "red" }}
            onClick={() => {
              if (window.confirm(`Delete "${node.name}"?`)) {
                onDelete(node.id);
              }
              setShowMenu(false);
            }}
          >
            🗑️ Delete
          </li>
        </ul>
      )}
    </div>
  );
}
