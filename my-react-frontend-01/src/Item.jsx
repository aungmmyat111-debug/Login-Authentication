import { useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = import.meta.env.VITE_API_URL;

export default function Item() {
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    amount: "",
  });

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const loadItems = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/api/item`, {
          credentials: "include",
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setItems(data.itemList || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load items:", err);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const onItemDelete = async (rowId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`${API_URL}/api/item/${rowId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        // Remove item from UI state immediately
        setItems((prevItems) => prevItems.filter((item) => item._id !== rowId));
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete item");
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Network error: Could not connect to backend server.");
    }
  };

  const cols = [
    { field: "name", headerName: "Name", flex: 3 },
    { field: "category", headerName: "Category", flex: 3 },
    { field: "price", headerName: "Price ($)", flex: 2 },
    { field: "amount", headerName: "Amount", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={() => onItemDelete(params.row._id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const closeDialog = () => {
    setFormData({ name: "", category: "", price: "", amount: "" });
    setOpenDialog(false);
  };

  const onAddItem = async () => {
    if (!formData.name || !formData.category || !formData.price || !formData.amount) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/item`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          amount: Number(formData.amount),
        }),
      });

      if (res.ok) {
        await loadItems();
        closeDialog();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to add item");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Network error: Could not reach backend server.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <Typography variant="h6">Items</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Add Item
        </Button>
      </div>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={items}
          columns={cols}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25]}
        />
      </div>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <Typography variant="h6">Add New Item</Typography>
          </DialogContentText>
          <div className="flex flex-col gap-3">
            <TextField
              required
              label="Item Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <FormControl fullWidth required>
              <InputLabel id="label-item-category">Category</InputLabel>
              <Select
                labelId="label-item-category"
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <MenuItem value="Appliance">Appliance</MenuItem>
                <MenuItem value="Gadget">Gadget</MenuItem>
                <MenuItem value="Headphone">Headphone</MenuItem>
                <MenuItem value="Stationary">Stationary</MenuItem>
              </Select>
            </FormControl>
            <TextField
              required
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <TextField
              required
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={onAddItem}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}