import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import HomeB from "@/pages/HomeB";
import HomeC from "@/pages/HomeC";
import { VariantSwitcher } from "@/components/jugiq-b/VariantSwitcher";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
// Variant A (Conversation-First) at "/"; Variant B (Decision Workspace) at "/b";
// Candidate C (Hybrid) at "/c".
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/b" element={<HomeB />} />
        <Route path="/c" element={<HomeC />} />
      </Routes>
      <VariantSwitcher />
    </>
  );
}
