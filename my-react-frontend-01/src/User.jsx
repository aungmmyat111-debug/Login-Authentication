// src/User.jsx

import { useContext, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LockResetIcon from "@mui/icons-material/LockReset";
import { UserContext } from "./Context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function User() {
  const { user: loggedInUser } = useContext(UserContext);
  const isAdmin = loggedInUser?._id == "-1";

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [pageErrorMsg, setPageErrorMsg] = useState("");
  const [pageSuccessMsg, setPageSuccessMsg] = useState("");

  // Dialog state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dialogErrorMsg, setDialogErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    let ignore = false;

    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/api/user?page=${page + 1}`, {
          credentials: "include",
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setUsers(data.users || []);
          setHasNext((data.users || []).length === data.size);
        } else if (!ignore) {
          const err = await res.json();
          setPageErrorMsg(err.message || "Failed to load users");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load users:", err);
          setPageErrorMsg("Network error: Could not connect to backend server.");
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [isAdmin, page]);

  if (!isAdmin) {
    return (
      <Alert severity="error">
        You are not authorized to access the User management screen.
      </Alert>
    );
  }

  const openChangePasswordDialog = (row) => {
    setSelectedUser(row);
    setNewPassword("");
    setConfirmPassword("");
    setDialogErrorMsg("");
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setDialogErrorMsg("");
  };

  const onChangePassword = async () => {
    setDialogErrorMsg("");
    if (!newPassword) {
      setDialogErrorMsg("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setDialogErrorMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setDialogErrorMsg("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/user/${selectedUser._id}/password`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (res.ok) {
        setPageSuccessMsg(
          `Password for "${selectedUser.username}" has been changed.`
        );
        closeDialog();
      } else {
        const err = await res.json();
        setDialogErrorMsg(err.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Failed to change password:", err);
      setDialogErrorMsg("Network error: Could not reach backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cols = [
    { field: "username", headerName: "Username", flex: 2 },
    { field: "email", headerName: "Email", flex: 3 },
    { field: "firstname", headerName: "First Name", flex: 2 },
    { field: "lastname", headerName: "Last Name", flex: 2 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => (
        <Tooltip title="Change Password">
          <IconButton
            color="primary"
            onClick={() => openChangePasswordDialog(params.row)}
          >
            <LockResetIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <Typography variant="h6">Users</Typography>
      </div>

      {pageErrorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageErrorMsg("")}>
          {pageErrorMsg}
        </Alert>
      )}

      {pageSuccessMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPageSuccessMsg("")}>
          {pageSuccessMsg}
        </Alert>
      )}

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={cols}
          getRowId={(row) => row._id}
          hideFooter
          disableColumnMenu
        />
      </div>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button
          variant="outlined"
          disabled={page === 0}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Typography sx={{ alignSelf: "center" }}>Page {page + 1}</Typography>
        <Button
          variant="outlined"
          disabled={!hasNext}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>

      <Dialog open={Boolean(selectedUser)} onClose={closeDialog} fullWidth>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <Typography variant="h6">
              Change Password{selectedUser ? ` - ${selectedUser.username}` : ""}
            </Typography>
          </DialogContentText>

          {dialogErrorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogErrorMsg}
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <TextField
              required
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
            <TextField
              required
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onChangePassword}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
