// src/main.tsx
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Index } from "./routes/index";
import ThreadDetail from "./routes/threads/[id]";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/threads/:id" element={<ThreadDetail />} />
    </Routes>
  </BrowserRouter>
);
