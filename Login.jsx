import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Card,
  CardContent,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "./firebase.js";
import { doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import { AppBar, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import SecurityIcon from "@mui/icons-material/Security";
import LoginIcon from "@mui/icons-material/Login";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmailIcon from "@mui/icons-material/Email";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <Toolbar>
        {/* Placeholder for logo on the left */}
        <Box sx={{ width: 50, height: 50, mr: 2 }}>
          {/* Add your logo here, e.g., <img src={logo} alt="CNB Bank Logo" /> */}
        </Box>

        {/* Centered Title */}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            <Box component="span" sx={{ color: "#fff" }}>
              CNB{" "}
            </Box>
            <Box component="span" sx={{ color: "#ffeb3b" }}>
              Bank
            </Box>
          </Typography>
        </Box>

        {/* Navigation Buttons */}
        {!isMobile && (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/signup"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Signup
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/loan"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Loan
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/admin"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Admin
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/signup"
              sx={{
                mx: 1,
                bgcolor: "#ffeb3b",
                color: "#1e3c72",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#fff",
                },
              }}
            >
              Open Account
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginRole, setLoginRole] = useState("customer");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setLoginRole(newRole);
    }
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
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

      const q = query(
        collection(db, "bank_account"),
        where("customer_id", "==", customerId)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setLoginError("No account found for this customer.");
        return;
      }
      const accountData = querySnapshot.docs[0].data();
      if (accountData.acct_status !== "active") {
        setLoginError(
          "Your account is not active. Please wait for admin approval."
        );
        await auth.signOut(); // Sign out the user if their account is not approved
        return;
      }

      navigate("/customer-dashboard");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <NavBar />

      {/* Hero Section */}
      <Paper
        sx={{
          borderRadius: 0,
          bgcolor: "#f5f7fa",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          color: "white",
          py: 6,
          mb: 6,
          borderBottom: "1px solid #e0e0e0",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{ mb: 2, opacity: 0.9, color:"#fff"}}
            >
              Log in to access your secure banking dashboard
            </Typography>
            <Chip
              icon={<SecurityIcon />}
              label="Secure Authentication"
              sx={{
                bgcolor: "rgba(255, 235, 59, 0.8)",
                color: "#1e3c72",
                fontWeight: 500,
              }}
            />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 3, mb: 8 }}>
        <Card
          elevation={5}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            py: 2,
          }}
        >
          <CardContent>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "#1e3c72",
                  width: 56,
                  height: 56,
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <LockOutlinedIcon fontSize="large" />
              </Avatar>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 600, color: "#1e3c72" }}
              >
                Account Login
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Please enter your credentials to continue
              </Typography>
            </Box>

            {/* Role Selection Toggle */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
              <Paper
                elevation={2}
                sx={{
                  p: 0.5,
                  borderRadius: 3,
                  bgcolor: "#f5f7fa",
                }}
              >
                <ToggleButtonGroup
                  value={loginRole}
                  exclusive
                  onChange={handleRoleChange}
                  aria-label="user role"
                  sx={{ width: "100%" }}
                >
                  <ToggleButton
                    value="customer"
                    aria-label="customer"
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: "#1e3c72",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#2a5298",
                        },
                      },
                      "&:hover": {
                        bgcolor: "rgba(30, 60, 114, 0.04)",
                      },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <PeopleAltIcon sx={{ fontSize: 28, mb: 1 }} />
                      <Typography sx={{ fontWeight: 500 }}>Customer</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton
                    value="admin"
                    aria-label="admin"
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: "#1e3c72",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#2a5298",
                        },
                      },
                      "&:hover": {
                        bgcolor: "rgba(30, 60, 114, 0.04)",
                      },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <AdminPanelSettingsIcon sx={{ fontSize: 28, mb: 1 }} />
                      <Typography sx={{ fontWeight: 500 }}>Admin</Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Paper>
            </Box>

            <form onSubmit={handleEmailPasswordLogin}>
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
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                sx={{ mb: 3 }}
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
                InputProps={{
                  startAdornment: (
                    <LockOutlinedIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {loginError && (
                <Typography
                  color="error"
                  align="center"
                  paragraph
                  sx={{
                    py: 1,
                    px: 2,
                    bgcolor: "rgba(211, 47, 47, 0.1)",
                    borderRadius: 1,
                    mb: 3,
                  }}
                >
                  {loginError}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  mb: 2,
                  background: "linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(30, 60, 114, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 25px rgba(30, 60, 114, 0.6)",
                  },
                }}
                endIcon={<LoginIcon />}
              >
                Login with Email/Password
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Chip label="OR" sx={{ px: 1 }} />
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                py: 1.5,
                color: "#1e3c72",
                borderColor: "#1e3c72",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#2a5298",
                  bgcolor: "rgba(30, 60, 114, 0.04)",
                },
              }}
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />}
            >
              Continue with Google
            </Button>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Button
                component={Link}
                to="/signup"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: "#1e3c72",
                  fontWeight: 500,
                }}
              >
                Create New Account
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Security Info Section */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
            <SecurityIcon sx={{ color: "#1e3c72" }} />
            <Typography variant="subtitle2" color="textSecondary">
              Secure & Encrypted Connection
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ maxWidth: 500, mx: "auto" }}
          >
            Your information is protected with industry-standard encryption and
            multi-factor authentication to ensure your account remains secure.
          </Typography>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Login;