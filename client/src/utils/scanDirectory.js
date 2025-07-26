// utils/scanDirectory.js

// Utility to check if file is plain text (crude ASCII check)
const isTextFile = async (file) => {
  try {
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    return /^[\x00-\x7F]*$/.test(text); // crude ASCII text check
  } catch (err) {
    console.error("Error checking file encoding:", err);
    return false;
  }
};

export const scanDirectory = async (dirHandle) => {
  const tree = [];
  const contentMap = {};
  const unsupportedFiles = [];

  const walk = async (handle, parentTree, path = "") => {
    for await (const entry of handle.values()) {
      const fullPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === "file") {
        try {
          const file = await entry.getFile();
          const isText = await isTextFile(file);

          if (!isText) {
            unsupportedFiles.push(fullPath);
            continue;
          }

          const content = await file.text();
          parentTree.push({ name: entry.name, type: "file" });
          contentMap[fullPath] = content;
        } catch (err) {
          console.warn("⚠️ Failed to read file:", entry.name, err);
          unsupportedFiles.push(fullPath);
        }
      } else if (entry.kind === "directory") {
        const childTree = [];
        parentTree.push({
          name: entry.name,
          type: "folder",
          children: childTree,
        });

        await walk(entry, childTree, fullPath); // 🔁 Recurse
      }
    }
  };

  await walk(dirHandle, tree);

  return { tree, contentMap, unsupportedFiles };
};
