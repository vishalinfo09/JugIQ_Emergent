import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import HomeB from "@/pages/HomeB";
import { VariantSwitcher } from "@/components/jugiq-b/VariantSwitcher";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
// Variant A (Conversation-First) lives at "/"; Variant B (Decision Workspace) at "/b".
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/b" element={<HomeB />} />
      </Routes>
      <VariantSwitcher />
    </>
  );
}
