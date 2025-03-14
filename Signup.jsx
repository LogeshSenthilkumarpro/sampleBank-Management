import React, { useState, useEffect } from "react";
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
  Paper,
  AppBar, 
  Toolbar,
  Grid,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase.js";
import { doc, setDoc, getDocs, query, where, collection, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIconAlt from '@mui/icons-material/AccountBalance';

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <AppBar position="static" elevation={0} sx={{ 
      background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
    }}>
      <Toolbar>
        {/* Placeholder for logo on the left */}
        <Box sx={{ width: 50, height: 50, mr: 2 }}>
          {/* Add your logo here */}
        </Box>
        
        {/* Centered Title */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            <Box component="span" sx={{ color: "#fff" }}>CNB </Box>
            <Box component="span" sx={{ color: "#ffeb3b" }}>Bank</Box>
          </Typography>
        </Box>

        {/* Navigation Buttons */}
        {!isMobile && (
          <>
            <Button color="inherit" component={Link} to="/" sx={{ mx: 1, fontWeight: 500 }}>Home</Button>
            <Button color="inherit" component={Link} to="/login" sx={{ mx: 1, fontWeight: 500 }}>Login</Button>
            <Button color="inherit" component={Link} to="/signup" sx={{ mx: 1, fontWeight: 500 }}>Signup</Button>
            <Button color="inherit" component={Link} to="/loan" sx={{ mx: 1, fontWeight: 500 }}>Loan</Button>
            <Button color="inherit" component={Link} to="/admin" sx={{ mx: 1, fontWeight: 500 }}>Admin</Button>
            <Button 
              variant="contained" 
              component={Link} 
              to="/signup" 
              sx={{ 
                mx: 1, 
                bgcolor: '#ffeb3b', 
                color: '#1e3c72', 
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#fff',
                }
              }}
            >
              Open Account
            </Button>
          </>
        )}
        {isMobile && (
          <IconButton color="inherit">
            <AccountBalanceWalletIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [signupEmail, setSignupEmail] = useState(location.state?.email || "");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupInitialBalance, setSignupInitialBalance] = useState("");
  const [signupDocuments, setSignupDocuments] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupAccountType, setSignupAccountType] = useState("savings");
  const [signupAadhaar, setSignupAadhaar] = useState("");
  const [signupPan, setSignupPan] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.fromGoogle) {
      setSignupEmail(location.state.email);
    }
  }, [location.state]);

  const generateId = async (prefix, collectionName, fieldName, length = 7) => {
    let newId;
    let isUnique = false;

    while (!isUnique) {
      const randomNum = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
      newId = `${prefix}${randomNum.slice(-length)}`;

      const querySnapshot = await getDocs(query(collection(db, collectionName), where(fieldName, "==", newId)));
      if (querySnapshot.empty) {
        isUnique = true;
      }
    }
    return newId;
  };

  const validateFields = () => {
    const nameWords = signupName.trim().split(/\s+/);
    if (nameWords.length < 2 || nameWords.some(word => word.length < 2)) {
      return "Name must contain at least 2 words with each word having 2 or more characters.";
    }

    const addressWords = signupAddress.trim().split(/\s+/);
    if (addressWords.length < 2 || addressWords.some(word => word.length < 2)) {
      return "Address must contain at least 2 words with each word having 2 or more characters.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(signupPhone.trim())) {
      return "Phone number must be exactly 10 digits.";
    }

    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(signupAadhaar.trim())) {
      return "Aadhaar number must be exactly 12 digits.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(signupPan.trim())) {
      return "PAN number must be 10 characters (e.g., ABCDE1234F).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail.trim())) {
      return "Please enter a valid email address.";
    }

    if (!location.state?.fromGoogle && signupPassword.trim().length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (parseInt(signupInitialBalance) < 1000) {
      return "Initial balance must be at least INR 1000.";
    }

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setIsSubmitting(true);

    const validationError = validateFields();
    if (validationError) {
      setSignupError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      let user;
      if (!location.state?.fromGoogle) {
        const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
        user = userCredential.user;
      } else {
        user = auth.currentUser;
      }

      const customerId = await generateId("2025", "customer_detail", "customer_id");
      const acctNumber = await generateId("1000", "bank_account", "acct_number");
      const ifscCode = "CNB0CHN";

      await setDoc(doc(db, "customer_detail", user.uid), {
        customer_img: signupDocuments.length > 0 ? signupDocuments[0].name : "",
        customer_name: signupName,
        customer_id: customerId,
        customer_phone: signupPhone,
        customer_addr: signupAddress,
        customer_points: 0,
        customer_pan: signupPan,
        customer_aadhaar: signupAadhaar,
        customer_email: signupEmail,
        createdAt: serverTimestamp(),
        acct_status: "pending",
      });

      await setDoc(doc(db, "bank_account", acctNumber), {
        acct_balance: parseInt(signupInitialBalance),
        acct_created_at: serverTimestamp(),
        acct_limit: 100000,
        acct_number: acctNumber,
        acct_status: "pending",
        acct_type: signupAccountType,
        customer_id: customerId,
      });

      await setDoc(doc(db, "lite_profile", acctNumber), {
        acct_number: acctNumber,
        ifsc_code: ifscCode,
        name: signupName,
      });

      await setDoc(doc(db, "bank_detail", "default"), {
        bank_addr: "Chennai, Tamilnadu",
        bank_name: "CNB Bank",
        ifsc_code: ifscCode,
      }, { merge: true });

      alert("Signup successful. Awaiting Admin approval.");
      navigate("/login");
    } catch (error) {
      setSignupError(error.message);
      console.error("Signup error:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <NavBar />
      
      {/* Hero Section */}
      <Paper 
        sx={{ 
          borderRadius: 0,
          bgcolor: '#f5f7fa',
          backgroundImage: 'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          color: 'white',
          py: 6,
          mb: 6,
          borderBottom: '1px solid #e0e0e0',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 'bold', mb: 2 }}>
            Open Your Account
          </Typography>
          <Typography variant={isMobile ? "body1" : "h6"} sx={{ mb: 2, opacity: 0.9, color: '#fff' }}>
            Join CNB Bank and start your financial journey with us
          </Typography>
          <Chip 
            icon={<PersonAddIcon />} 
            label="CREATE ACCOUNT" 
            sx={{ 
              bgcolor: '#ffeb3b', 
              color: '#1e3c72', 
              fontWeight: 600,
              px: 2,
              py: 2.5,
              '& .MuiChip-icon': {
                color: '#1e3c72'
              }
            }} 
          />
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e3c72', mb: 3 }}>
                Account Benefits
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                <Typography>Advanced security measures</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                <Typography>Competitive interest rates</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                <Typography>24/7 online banking</Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#1e3c72', fontWeight: 500 }}>
                  Join over 10,000+ customers who trust CNB Bank for their financial needs.
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: '#1e3c72',
                    width: 56,
                    height: 56,
                    margin: '0 auto',
                    mb: 2,
                  }}
                >
                  <PersonAddIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  Customer Registration
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Please fill out the form below to create your account
                </Typography>
                <Divider />
              </Box>
              
              <form onSubmit={handleSignup}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      autoComplete="email"
                      fullWidth
                      variant="outlined"
                      disabled={location.state?.fromGoogle}
                      error={signupError && signupError.includes("email")}
                      helperText={signupError && signupError.includes("email") ? signupError : ""}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  {!location.state?.fromGoogle && (
                    <Grid item xs={12}>
                      <TextField
                        label="Password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        fullWidth
                        variant="outlined"
                        error={signupError && signupError.includes("Password")}
                        helperText={signupError && signupError.includes("Password") ? signupError : ""}
                        InputProps={{
                          startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      autoComplete="name"
                      fullWidth
                      variant="outlined"
                      error={signupError && signupError.includes("Name")}
                      helperText={signupError && signupError.includes("Name") ? signupError : ""}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      type="text"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      required
                      autoComplete="tel"
                      fullWidth
                      variant="outlined"
                      error={signupError && signupError.includes("Phone")}
                      helperText={signupError && signupError.includes("Phone") ? signupError : ""}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      type="text"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      required
                      autoComplete="street-address"
                      fullWidth
                      variant="outlined"
                      error={signupError && signupError.includes("Address")}
                      helperText={signupError && signupError.includes("Address") ? signupError : ""}
                      InputProps={{
                        startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Aadhaar Number"
                      type="text"
                      value={signupAadhaar}
                      onChange={(e) => setSignupAadhaar(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      error={signupError && signupError.includes("Aadhaar")}
                      helperText={signupError && signupError.includes("Aadhaar") ? signupError : ""}
                      InputProps={{
                        startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="PAN Number"
                      type="text"
                      value={signupPan}
                      onChange={(e) => setSignupPan(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      error={signupError && signupError.includes("PAN")}
                      helperText={signupError && signupError.includes("PAN") ? signupError : ""}
                      InputProps={{
                        startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="account-type-label">Account Type</InputLabel>
                      <Select
                        labelId="account-type-label"
                        value={signupAccountType}
                        onChange={(e) => setSignupAccountType(e.target.value)}
                        required
                        label="Account Type"
                        startAdornment={<AccountBalanceIconAlt sx={{ mr: 1, color: 'action.active' }} />}
                      >
                        <MenuItem value="savings">Savings</MenuItem>
                        <MenuItem value="current">Current</MenuItem>
                        <MenuItem value="salary">Salary</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Initial Balance (min INR 1000)"
                      type="number"
                      value={signupInitialBalance}
                      onChange={(e) => setSignupInitialBalance(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      inputProps={{ min: 1000 }}
                      error={signupError && signupError.includes("Initial balance")}
                      helperText={signupError && signupError.includes("Initial balance") ? signupError : ""}
                      InputProps={{
                        startAdornment: <AccountBalanceWalletIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        color: '#1e3c72',
                        borderColor: '#1e3c72',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#2a5298',
                          bgcolor: 'rgba(30, 60, 114, 0.04)',
                        },
                      }}
                    >
                      Upload Documents
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={(e) => setSignupDocuments([...e.target.files])}
                      />
                    </Button>
                  </Grid>
                </Grid>

                {signupError && (
                  <Typography
                    color="error"
                    align="center"
                    paragraph
                    sx={{
                      py: 1,
                      px: 2,
                      bgcolor: 'rgba(211, 47, 47, 0.1)',
                      borderRadius: 1,
                      mt: 3,
                    }}
                  >
                    {signupError}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 4px 20px rgba(30, 60, 114, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(30, 60, 114, 0.6)',
                    },
                  }}
                  disabled={isSubmitting}
                  endIcon={<ArrowForwardIcon />}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Already have an account?
                </Typography>
                <Button 
                  component={Link} 
                  to="/login"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: '#1e3c72',
                    fontWeight: 500,
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Security Info Section */}
      <Box sx={{ bgcolor: '#1e3c72', color: 'white', py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
              <SecurityIcon sx={{ color: '#ffeb3b' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Secure & Encrypted Connection
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', opacity: 0.9 }}>
              Your information is protected with industry-standard encryption and multi-factor authentication to ensure your account remains secure.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Signup;