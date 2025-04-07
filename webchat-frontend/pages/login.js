import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Sai tài khoản hoặc mật khẩu");
        return;
      }


      localStorage.setItem("username", data.username);
      router.push("/chat"); 
    } catch (err) {
      setError("Lỗi kết nối server");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 10, p: 3, boxShadow: 3 }}>
      <Typography variant="h5" mb={2}>Đăng nhập</Typography>

      <TextField
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />

      {error && (
        <Typography color="error" mt={1}>
          ⚠ {error}
        </Typography>
      )}

      <Button fullWidth variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>
        Đăng nhập
      </Button>
    </Box>
  );
}
