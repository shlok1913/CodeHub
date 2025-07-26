// src/components/WorkspaceLayout.jsx
export default function WorkspaceLayout({ childrenSidebar, childrenEditor }) {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto p-4">
        {childrenSidebar}
      </aside>

      {/* Editor */}
      <main className="flex-1 bg-white overflow-y-auto p-4">
        {childrenEditor}
      </main>
    </div>
  );
}
