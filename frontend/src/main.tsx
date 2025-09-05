// src/main.tsx
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Index } from "./routes/index";
import ThreadDetail from "./routes/threads/[id]";
import AdminPage from "./routes/admin";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/threads/:id" element={<ThreadDetail />} />
      <Route path="/admin" element={<AdminPage />} /> {/* ← 追加 */}
    </Routes>
  </BrowserRouter>
);
