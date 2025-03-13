import React, { useState } from "react";
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "./firebase.js";
import { doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import { AppBar, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "./Footer"; // Import the Footer component

const NavBar = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Banking System
      </Typography>
      <Button color="inherit" component={Link} to="/">Home</Button>
      <Button color="inherit" component={Link} to="/login">Login</Button>
      <Button color="inherit" component={Link} to="/signup">Signup</Button>
      <Button color="inherit" component={Link} to="/loan">Loan</Button>
      <Button color="inherit" component={Link} to="/admin">Admin</Button>
    </Toolbar>
  </AppBar>
);

const Login = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginRole, setLoginRole] = useState("customer");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;
      await handlePostLogin(user);
    } catch (error) {
      setLoginError(error.message);
      console.error("Email/Password Login error:", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await handlePostLogin(user);
    } catch (error) {
      setLoginError(error.message);
      console.error("Google Login error:", error.message);
    }
  };

  const handlePostLogin = async (user) => {
    if (loginRole === "admin") {
      const adminDoc = await getDoc(doc(db, "admin", user.uid));
      if (!adminDoc.exists() || adminDoc.data().ROLE !== "ADMIN") {
        setLoginError("Invalid admin credentials.");
        return;
      }
      navigate("/admin");
    } else {
      const customerDoc = await getDoc(doc(db, "customer_detail", user.uid));
      if (!customerDoc.exists()) {
        navigate("/signup", { state: { email: user.email, fromGoogle: true } });
        return;
      }
      const customerData = customerDoc.data();
      const customerId = customerData.customer_id;

      const q = query(collection(db, "bank_account"), where("customer_id", "==", customerId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setLoginError("No account found for this customer.");
        return;
      }
      const accountData = querySnapshot.docs[0].data();
      if (accountData.acct_status !== "active") {
        setLoginError("Your account is not active. Please wait for admin approval.");
        await auth.signOut(); // Sign out the user if their account is not approved
        return;
      }

      navigate("/customer-dashboard");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleEmailPasswordLogin}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            autoComplete="email"
            fullWidth
            variant="outlined"
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          {loginError && (
            <Typography color="error" align="center" paragraph>
              {loginError}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2, padding: 1.5 }}
          >
            Login with Email/Password
          </Button>
        </form>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ marginTop: 2, padding: 1.5 }}
          onClick={handleGoogleLogin}
        >
          Login with Google
        </Button>
      </Container>
      <Footer />
    </Box>
  );
};

export default Login;