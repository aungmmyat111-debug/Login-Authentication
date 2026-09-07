// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Home />}>
        <Route path="item" element={<div>Item Management Screen</div>} />
      </Route>
    </Routes>
  );
}