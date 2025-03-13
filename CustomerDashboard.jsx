import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger menu icon
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import { getDoc, doc, getDocs, query, where, collection, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase.js";
import { AppBar, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "./Footer.jsx";

const NavBar = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Banking System
      </Typography>
      <Button color="inherit" component={RouterLink} to="/">Home</Button>
      <Button color="inherit" component={RouterLink} to="/login">Login</Button>
      <Button color="inherit" component={RouterLink} to="/signup">Signup</Button>
      <Button color="inherit" component={RouterLink} to="/loan">Loan</Button>
      <Button color="inherit" component={RouterLink} to="/admin">Admin</Button>
    </Toolbar>
  </AppBar>
);

const CustomerDashboard = () => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transferType, setTransferType] = useState("within_bank");
  const [recipientAcctNumber, setRecipientAcctNumber] = useState("");
  const [recipientBankName, setRecipientBankName] = useState("");
  const [recipientIfscCode, setRecipientIfscCode] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [section, setSection] = useState("transactions"); // For side menu
  const [drawerOpen, setDrawerOpen] = useState(false); // Toggle drawer

  // Loan Section States
  const [loanType, setLoanType] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [guaranteeNomineeName, setGuaranteeNomineeName] = useState("");
  const [guaranteeNomineePhone, setGuaranteeNomineePhone] = useState("");
  const [incomeProof, setIncomeProof] = useState("");
  const [loanBasis, setLoanBasis] = useState(""); // Property, Gold, etc.
  const [propertyDetails, setPropertyDetails] = useState(""); // For Mortgage
  const [goldGrams, setGoldGrams] = useState(""); // For Gold Loan
  const [marks12th, setMarks12th] = useState(""); // For Educational Loan
  const [loanError, setLoanError] = useState("");
  const [loanSuccess, setLoanSuccess] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!currentUser || userRole !== "customer") {
        navigate("/login");
        return;
      }

      const fetchAccount = async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            const customerDoc = await getDoc(doc(db, "customer_detail", user.uid));
            if (customerDoc.exists()) {
              const customerData = customerDoc.data();
              setCustomerDetails(customerData);
              const customerId = customerData.customer_id;

              const q = query(collection(db, "bank_account"), where("customer_id", "==", customerId));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const accountDoc = querySnapshot.docs[0];
                setAccount(accountDoc.data());

                const transactionsQuery = query(
                  collection(db, "transactions"),
                  where("sender_acct_number", "==", accountDoc.data().acct_number)
                );
                const transactionsSnapshot = await getDocs(transactionsQuery);
                const transactionsList = transactionsSnapshot.docs.map((doc) => ({
                  ...doc.data(),
                  senderName: customerData.customer_name,
                }));
                setTransactions(transactionsList);
              } else {
                setError("No account found for this customer.");
              }
            } else {
              setError("Customer data not found.");
            }
            setFetchLoading(false);
          }
        } catch (err) {
          setError("Error fetching account: " + err.message);
          setFetchLoading(false);
        }
      };
      fetchAccount();
    }
  }, [currentUser, userRole, loading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setError("Failed to log out: " + err.message);
    }
  };

  const generateTransactionId = () => {
    const prefix = "TXN";
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    return `${prefix}${randomNum}`;
  };

  const generateLoanApplicationId = () => {
    const prefix = "LOAN";
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    return `${prefix}${randomNum}`;
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    if (!amount || parseFloat(amount) <= 0) {
      setTransferError("Please enter a valid amount.");
      return;
    }

    try {
      if (transferType === "within_bank") {
        if (!recipientAcctNumber) {
          setTransferError("Recipient account number is required.");
          return;
        }

        await runTransaction(db, async (transaction) => {
          const senderDocRef = doc(db, "bank_account", account.acct_number);
          const senderDoc = await transaction.get(senderDocRef);
          if (!senderDoc.exists()) throw new Error("Sender account not found");
          const senderData = senderDoc.data();
          if (senderData.acct_balance < parseFloat(amount)) throw new Error("Insufficient balance");
          if (senderData.acct_status !== "active") throw new Error("Sender account is not active");

          const recipientDocRef = doc(db, "bank_account", recipientAcctNumber);
          const recipientDoc = await transaction.get(recipientDocRef);
          if (!recipientDoc.exists()) throw new Error("Recipient account not found");
          const recipientData = recipientDoc.data();
          if (recipientData.acct_status !== "active") throw new Error("Recipient account is not active");

          const recipientCustomerDoc = await getDoc(doc(db, "customer_detail", recipientData.customer_id));
          const recipientName = recipientCustomerDoc.exists() ? recipientCustomerDoc.data().customer_name : "Unknown";

          transaction.update(senderDocRef, {
            acct_balance: senderData.acct_balance - parseFloat(amount),
          });
          transaction.update(recipientDocRef, {
            acct_balance: recipientData.acct_balance + parseFloat(amount),
          });

          const transactionId = generateTransactionId();
          transaction.set(doc(db, "transactions", transactionId), {
            transaction_id: transactionId,
            sender_acct_number: account.acct_number,
            sender_name: customerDetails.customer_name,
            recipient_acct_number: recipientAcctNumber,
            recipient_name: recipientName,
            amount: parseFloat(amount),
            description: description || "Transfer within bank",
            type: "within_bank",
            status: "completed",
            created_at: serverTimestamp(),
          });
        });

        setTransferSuccess("Transfer completed successfully");
      } else if (transferType === "interbank") {
        if (!recipientBankName || !recipientAcctNumber || !recipientIfscCode) {
          setTransferError("All recipient bank details are required.");
          return;
        }

        await runTransaction(db, async (transaction) => {
          const senderDocRef = doc(db, "bank_account", account.acct_number);
          const senderDoc = await transaction.get(senderDocRef);
          if (!senderDoc.exists()) throw new Error("Sender account not found");
          const senderData = senderDoc.data();
          if (senderData.acct_balance < parseFloat(amount)) throw new Error("Insufficient balance");
          if (senderData.acct_status !== "active") throw new Error("Sender account is not active");

          transaction.update(senderDocRef, {
            acct_balance: senderData.acct_balance - parseFloat(amount),
          });

          const transactionId = generateTransactionId();
          transaction.set(doc(db, "transactions", transactionId), {
            transaction_id: transactionId,
            sender_acct_number: account.acct_number,
            sender_name: customerDetails.customer_name,
            recipient_bank_name: recipientBankName,
            recipient_acct_number: recipientAcctNumber,
            recipient_ifsc_code: recipientIfscCode,
            amount: parseFloat(amount),
            description: description || "Transfer to other bank",
            type: "interbank",
            status: "pending",
            created_at: serverTimestamp(),
          });
        });

        setTransferSuccess("Interbank transfer initiated (simulated)");
      }

      const updatedAccountDoc = await getDoc(doc(db, "bank_account", account.acct_number));
      setAccount(updatedAccountDoc.data());

      const transactionsQuery = query(
        collection(db, "transactions"),
        where("sender_acct_number", "==", account.acct_number)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      setTransactions(transactionsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        senderName: customerDetails.customer_name,
      })));
    } catch (error) {
      setTransferError(error.message);
    }
  };

  const handleDeposit = async (depositValue) => {
    try {
      await runTransaction(db, async (transaction) => {
        const accountDocRef = doc(db, "bank_account", account.acct_number);
        const accountDoc = await transaction.get(accountDocRef);
        if (!accountDoc.exists()) throw new Error("Account not found");
        const accountData = accountDoc.data();

        transaction.update(accountDocRef, {
          acct_balance: accountData.acct_balance + parseFloat(depositValue),
        });

        const transactionId = generateTransactionId();
        transaction.set(doc(db, "transactions", transactionId), {
          transaction_id: transactionId,
          sender_acct_number: account.acct_number,
          sender_name: customerDetails.customer_name,
          recipient_acct_number: account.acct_number,
          recipient_name: customerDetails.customer_name,
          amount: parseFloat(depositValue),
          description: "Deposit",
          type: "deposit",
          status: "completed",
          created_at: serverTimestamp(),
        });
      });

      const updatedAccountDoc = await getDoc(doc(db, "bank_account", account.acct_number));
      setAccount(updatedAccountDoc.data());

      const transactionsQuery = query(
        collection(db, "transactions"),
        where("sender_acct_number", "==", account.acct_number)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      setTransactions(transactionsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        senderName: customerDetails.customer_name,
      })));

      setTransferSuccess(`Deposited INR ${depositValue} successfully`);
    } catch (error) {
      setTransferError(error.message);
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoanError("");
    setLoanSuccess("");

    // Common Validations
    if (!loanType) {
      setLoanError("Please select a loan type.");
      return;
    }
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setLoanError("Please enter a valid loan amount.");
      return;
    }
    if (!cibilScore || cibilScore < 300 || cibilScore > 900) {
      setLoanError("Please enter a valid CIBIL score (300-900).");
      return;
    }
    if (!guaranteeNomineeName) {
      setLoanError("Please enter the guarantee nominee name.");
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!guaranteeNomineePhone || !phoneRegex.test(guaranteeNomineePhone)) {
      setLoanError("Please enter a valid 10-digit guarantee nominee phone number.");
      return;
    }
    if (!incomeProof) {
      setLoanError("Please enter your income proof.");
      return;
    }
    if (!loanBasis) {
      setLoanError("Please select the basis for the loan.");
      return;
    }

    // Loan Type Specific Validations
    if (loanType === "educational" && (!marks12th || marks12th < 400 || marks12th > 600)) {
      setLoanError("For Educational Loan, 12th marks must be between 400 and 600.");
      return;
    }
    if (loanType === "mortgage" && !propertyDetails) {
      setLoanError("For Mortgage Loan, please enter property details.");
      return;
    }
    if (loanType === "gold" && (!goldGrams || parseFloat(goldGrams) <= 0)) {
      setLoanError("For Gold Loan, please enter a valid amount of gold in grams.");
      return;
    }

    try {
      const loanApplicationId = generateLoanApplicationId();
      const loanApplicationData = {
        loan_application_id: loanApplicationId,
        customer_id: customerDetails.customer_id,
        customer_name: customerDetails.customer_name,
        account_number: account.acct_number,
        loan_type: loanType,
        loan_amount: parseFloat(loanAmount),
        cibil_score: parseInt(cibilScore),
        guarantee_nominee_name: guaranteeNomineeName,
        guarantee_nominee_phone: guaranteeNomineePhone,
        income_proof: incomeProof,
        loan_basis: loanBasis,
        status: "pending",
        created_at: serverTimestamp(),
      };

      // Add loan type specific data
      if (loanType === "educational") {
        loanApplicationData.marks_12th = parseInt(marks12th);
      } else if (loanType === "mortgage") {
        loanApplicationData.property_details = propertyDetails;
      } else if (loanType === "gold") {
        loanApplicationData.gold_grams = parseFloat(goldGrams);
        loanApplicationData.calculated_loan_amount = parseFloat(goldGrams) * 1000; // 1g = 1000 INR
      }

      // Submit loan application to Firebase
      await setDoc(doc(db, "loan_applications", loanApplicationId), loanApplicationData);

      setLoanSuccess("Loan application submitted successfully. Awaiting admin approval.");
      // Reset form
      setLoanType("");
      setLoanAmount("");
      setCibilScore("");
      setGuaranteeNomineeName("");
      setGuaranteeNomineePhone("");
      setIncomeProof("");
      setLoanBasis("");
      setPropertyDetails("");
      setGoldGrams("");
      setMarks12th("");
    } catch (error) {
      setLoanError("Error submitting loan application: " + error.message);
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  if (loading || fetchLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!account || !customerDetails) return <p>No account data available.</p>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, mt: 4 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <IconButton onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            My Account
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          variant="temporary"
          sx={{ "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" } }}
        >
          <Toolbar />
          <Divider />
          <List>
            {["Transactions", "Generate Money", "Loan"].map((text) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  setSection(text.toLowerCase().replace(" ", "_"));
                  setDrawerOpen(false); // Close drawer after selection
                }}
              >
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Personal Details</Typography>
                <Typography>Name: {customerDetails.customer_name}</Typography>
                <Typography>Phone: {customerDetails.customer_phone}</Typography>
                <Typography>Address: {customerDetails.customer_addr}</Typography>
                <Typography>Aadhaar: {customerDetails.customer_aadhaar}</Typography>
                <Typography>PAN: {customerDetails.customer_pan}</Typography>
                <Typography>Points: {customerDetails.customer_points}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Account Details</Typography>
                <Typography>Account Number: {account.acct_number}</Typography>
                <Typography>Balance: INR {account.acct_balance.toFixed(2)}</Typography>
                <Typography>Account Type: {account.acct_type}</Typography>
                <Typography>Status: {account.acct_status}</Typography>
                <Typography>Limit: INR {account.acct_limit}</Typography>
              </CardContent>
            </Card>
          </Grid>
  
          {section === "transactions" && (
            <>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Initiate Transfer</Typography>
                    <form onSubmit={handleTransfer}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="transfer-type-label">Transfer Type</InputLabel>
                        <Select
                          labelId="transfer-type-label"
                          value={transferType}
                          onChange={(e) => setTransferType(e.target.value)}
                          label="Transfer Type"
                        >
                          <MenuItem value="within_bank">Within Bank</MenuItem>
                          <MenuItem value="interbank">To Other Bank</MenuItem>
                        </Select>
                      </FormControl>
                      {transferType === "within_bank" && (
                        <TextField
                          label="Recipient Account Number"
                          type="text"
                          value={recipientAcctNumber}
                          onChange={(e) => setRecipientAcctNumber(e.target.value)}
                          required
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                      )}
                      {transferType === "interbank" && (
                        <>
                          <TextField
                            label="Recipient Bank Name"
                            type="text"
                            value={recipientBankName}
                            onChange={(e) => setRecipientBankName(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            margin="normal"
                          />
                          <TextField
                            label="Recipient Account Number"
                            type="text"
                            value={recipientAcctNumber}
                            onChange={(e) => setRecipientAcctNumber(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            margin="normal"
                          />
                          <TextField
                            label="Recipient IFSC Code"
                            type="text"
                            value={recipientIfscCode}
                            onChange={(e) => setRecipientIfscCode(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            margin="normal"
                          />
                        </>
                      )}
                      <TextField
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        inputProps={{ min: 1 }}
                      />
                      <TextField
                        label="Description (Optional)"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                      />
                      {transferError && (
                        <Typography color="error" align="center" paragraph>
                          {transferError}
                        </Typography>
                      )}
                      {transferSuccess && (
                        <Typography color="primary" align="center" paragraph>
                          {transferSuccess}
                        </Typography>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2, padding: 1.5 }}
                      >
                        Transfer
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Transaction History</Typography>
                    {transactions.length === 0 ? (
                      <Typography>No transactions found.</Typography>
                    ) : (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Sender</TableCell>
                            <TableCell>Recipient</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions.map((txn) => (
                            <TableRow key={txn.transaction_id}>
                              <TableCell>{txn.transaction_id}</TableCell>
                              <TableCell>{txn.sender_name}</TableCell>
                              <TableCell>
                                {txn.type === "within_bank" || txn.type === "deposit"
                                  ? txn.recipient_name
                                  : `${txn.recipient_acct_number} (${txn.recipient_bank_name})`}
                              </TableCell>
                              <TableCell>INR {txn.amount}</TableCell>
                              <TableCell>
                                {txn.type === "within_bank" ? "Within Bank" : txn.type === "interbank" ? "Interbank" : "Deposit"}
                              </TableCell>
                              <TableCell>{txn.status}</TableCell>
                              <TableCell>
                                {txn.created_at ? new Date(txn.created_at.toDate()).toLocaleString() : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
  
          {section === "generate_money" && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Generate Money (Deposit)</Typography>
                  <Typography>Current Balance: INR {account.acct_balance.toFixed(2)}</Typography>
                  <div style={{ marginTop: 20 }}>
                    {[1000, 2000, 5000, 10000].map((value) => (
                      <Button
                        key={value}
                        variant="contained"
                        color="primary"
                        onClick={() => handleDeposit(value)}
                        sx={{ margin: 1 }}
                      >
                        Deposit INR {value}
                      </Button>
                    ))}
                  </div>
                  {transferError && (
                    <Typography color="error" align="center" paragraph>
                      {transferError}
                    </Typography>
                  )}
                  {transferSuccess && (
                    <Typography color="primary" align="center" paragraph>
                      {transferSuccess}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
  
          {section === "loan" && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Apply for a Loan</Typography>
                  <form onSubmit={handleLoanSubmit}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="loan-type-label">Loan Type</InputLabel>
                      <Select
                        labelId="loan-type-label"
                        value={loanType}
                        onChange={(e) => setLoanType(e.target.value)}
                        label="Loan Type"
                        required
                      >
                        <MenuItem value="agricultural">Agricultural</MenuItem>
                        <MenuItem value="educational">Educational</MenuItem>
                        <MenuItem value="gold">Gold</MenuItem>
                        <MenuItem value="housing">Housing</MenuItem>
                        <MenuItem value="mortgage">Mortgage</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Loan Amount (INR)"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      inputProps={{ min: 1 }}
                    />
                    <TextField
                      label="CIBIL Score (300-900)"
                      type="number"
                      value={cibilScore}
                      onChange={(e) => setCibilScore(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      inputProps={{ min: 300, max: 900 }}
                    />
                    <TextField
                      label="Guarantee Nominee Name"
                      type="text"
                      value={guaranteeNomineeName}
                      onChange={(e) => setGuaranteeNomineeName(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                    <TextField
                      label="Guarantee Nominee Phone Number"
                      type="text"
                      value={guaranteeNomineePhone}
                      onChange={(e) => setGuaranteeNomineePhone(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                    <TextField
                      label="Income Proof (e.g., Salary, Business IT)"
                      type="text"
                      value={incomeProof}
                      onChange={(e) => setIncomeProof(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="loan-basis-label">Loan Basis</InputLabel>
                      <Select
                        labelId="loan-basis-label"
                        value={loanBasis}
                        onChange={(e) => setLoanBasis(e.target.value)}
                        label="Loan Basis"
                        required
                      >
                        <MenuItem value="property">Property</MenuItem>
                        <MenuItem value="gold">Gold</MenuItem>
                        <MenuItem value="income">Income</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Dynamic Fields Based on Loan Type */}
                    {loanType === "educational" && (
                      <TextField
                        label="12th Marks (out of 600)"
                        type="number"
                        value={marks12th}
                        onChange={(e) => setMarks12th(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        inputProps={{ min: 400, max: 600 }}
                      />
                    )}
                    {loanType === "mortgage" && (
                      <TextField
                        label="Property Details"
                        type="text"
                        value={propertyDetails}
                        onChange={(e) => setPropertyDetails(e.target.value)}
                        required
                        fullWidth variant="outlined"
                        margin="normal"
                      />
                    )}
                    {loanType === "gold" && (
                      <TextField
                        label="Gold Grams"
                        type="number"
                        value={goldGrams}
                        onChange={(e) => setGoldGrams(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        inputProps={{ min: 1 }}
                        helperText={`Estimated Loan Amount: INR ${goldGrams ? parseFloat(goldGrams) * 1000 : 0}`}
                      />
                    )}

                    {loanError && (
                      <Typography color="error" align="center" paragraph>
                        {loanError}
                      </Typography>
                    )}
                    {loanSuccess && (
                      <Typography color="primary" align="center" paragraph>
                        {loanSuccess}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ marginTop: 2, padding: 1.5 }}
                    >
                      Submit Loan Application
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};
export default CustomerDashboard;