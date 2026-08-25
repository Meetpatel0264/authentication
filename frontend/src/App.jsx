import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;