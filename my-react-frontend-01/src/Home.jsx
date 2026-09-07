// src/Home.jsx
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./Context/UserContext";

export default function Home() {
  const navigate = useNavigate();
  const { logout, isLoggedIn, isInitializing } = useContext(UserContext);

  useEffect(() => {
    if (!isLoggedIn && !isInitializing) {
      navigate("/login");
    }
  }, [isLoggedIn, isInitializing, navigate]);

  if (isInitializing) return null;

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Frontend 1.0
          </Typography>
          <Button color="inherit" onClick={() => navigate("/item")}>
            Item
          </Button>
          <Button
            color="inherit"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </div>
  );
}