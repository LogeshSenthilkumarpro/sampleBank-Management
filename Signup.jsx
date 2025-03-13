import React, { useState, useEffect } from "react";
import { Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Container } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase.js";
import { doc, setDoc, getDocs, query, where, collection, serverTimestamp } from "firebase/firestore";
import { AppBar, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";

const NavBar = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        CNB Bank
      </Typography>
      <Button color="inherit" component={Link} to="/">Home</Button>
      <Button color="inherit" component={Link} to="/login">Login</Button>
      <Button color="inherit" component={Link} to="/signup">Signup</Button>
      <Button color="inherit" component={Link} to="/loan">Loan</Button>
      <Button color="inherit" component={Link} to="/admin">Admin</Button>
    </Toolbar>
  </AppBar>
);

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Customer Signup
        </Typography>
        <form onSubmit={handleSignup}>
          <TextField
            label="Email"
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required
            autoComplete="email"
            fullWidth
            variant="outlined"
            margin="normal"
            autoFocus
            disabled={location.state?.fromGoogle}
            error={signupError && signupError.includes("email")}
            helperText={signupError && signupError.includes("email") ? signupError : ""}
          />
          {!location.state?.fromGoogle && (
            <TextField
              label="Password"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              autoComplete="new-password"
              fullWidth
              variant="outlined"
              margin="normal"
              error={signupError && signupError.includes("Password")}
              helperText={signupError && signupError.includes("Password") ? signupError : ""}
            />
          )}
          <TextField
            label="Name"
            type="text"
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            required
            autoComplete="name"
            fullWidth
            variant="outlined"
            margin="normal"
            error={signupError && signupError.includes("Name")}
            helperText={signupError && signupError.includes("Name") ? signupError : ""}
          />
          <TextField
            label="Phone Number"
            type="text"
            value={signupPhone}
            onChange={(e) => setSignupPhone(e.target.value)}
            required
            autoComplete="tel"
            fullWidth
            variant="outlined"
            margin="normal"
            error={signupError && signupError.includes("Phone")}
            helperText={signupError && signupError.includes("Phone") ? signupError : ""}
          />
          <TextField
            label="Address"
            type="text"
            value={signupAddress}
            onChange={(e) => setSignupAddress(e.target.value)}
            required
            autoComplete="street-address"
            fullWidth
            variant="outlined"
            margin="normal"
            error={signupError && signupError.includes("Address")}
            helperText={signupError && signupError.includes("Address") ? signupError : ""}
          />
          <TextField
            label="Aadhaar Number"
            type="text"
            value={signupAadhaar}
            onChange={(e) => setSignupAadhaar(e.target.value)}
            required
            fullWidth
            variant="outlined"
            margin="normal"
            error={signupError && signupError.includes("Aadhaar")}
            helperText={signupError && signupError.includes("Aadhaar") ? signupError : ""}
          />
          <TextField
            label="PAN Number"
            type="text"
            value={signupPan}
            onChange={(e) => setSignupPan(e.target.value)}
            required
            fullWidth
            variant="outlined"
            margin="normal"
            error={signupError && signupError.includes("PAN")}
            helperText={signupError && signupError.includes("PAN") ? signupError : ""}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="account-type-label">Account Type</InputLabel>
            <Select
              labelId="account-type-label"
              value={signupAccountType}
              onChange={(e) => setSignupAccountType(e.target.value)}
              required
              label="Account Type"
            >
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="current">Current</MenuItem>
              <MenuItem value="salary">Salary</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Initial Balance (min INR 1000)"
            type="number"
            value={signupInitialBalance}
            onChange={(e) => setSignupInitialBalance(e.target.value)}
            required
            fullWidth
            variant="outlined"
            margin="normal"
            inputProps={{ min: 1000 }}
            error={signupError && signupError.includes("Initial balance")}
            helperText={signupError && signupError.includes("Initial balance") ? signupError : ""}
          />
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ marginTop: 2, marginBottom: 2 }}
          >
            Upload Documents
            <input
              type="file"
              multiple
              hidden
              onChange={(e) => setSignupDocuments([...e.target.files])}
            />
          </Button>
          {signupError && (
            <Typography color="error" align="center" paragraph>
              {signupError}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2, padding: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Container>
      <Footer />
    </Box>
  );
};

export default Signup;