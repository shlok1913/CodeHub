// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import WorkspaceSelectorPage from "./pages/WorkspaceSelectorPage";
import EditorPage from "./pages/EditorPage";
import NotFound from "./pages/NotFound";  

function App() {
  const { user } = useAuth();

  return (
      <Routes>
        <Route
          path="/"
          element={user ? <WorkspaceSelectorPage /> : <AuthPage />}
        />
        <Route
          path="/editor/:id"
          element={user ? <EditorPage  /> : <Navigate to="/" />}
        />
        {/* Catch-all: block all undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default App;