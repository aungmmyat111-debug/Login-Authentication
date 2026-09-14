// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Login";
import Item from "./Item";
import User from "./User";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Home />}>
        <Route path="item" element={<Item />} />
        <Route path="user" element={<User />} />
      </Route>
    </Routes>
  );
}