import { Routes, Route, Navigate } from "react-router-dom";
import RulesPage from "./pages/RulesPage";

function App() {
  return (
    <Routes>
      <Route path="/rules" element={<RulesPage />} />
      <Route path="*" element={<Navigate to="/rules" replace />} />
    </Routes>
  );
}

export default App;
