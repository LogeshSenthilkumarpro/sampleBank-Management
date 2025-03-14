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
  ListItemIcon,
  Divider,
  IconButton,
  Box,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentsIcon from "@mui/icons-material/Payments";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import {
  getDoc,
  doc,
  getDocs,
  query,
  where,
  collection,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase.js";
import { AppBar, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "./Footer.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoanRepaymentSection from "./LoanRepaymentSection.jsx";

// Navigation Bar Component
const NavBar = () => (
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
        {/* Add your logo here */}
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
      <Button
        color="inherit"
        component={RouterLink}
        to="/"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Home
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/login"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Login
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/signup"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Signup
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/loan"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Loan
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/admin"
        sx={{ mx: 1, fontWeight: 500 }}
      >
        Admin
      </Button>
    </Toolbar>
  </AppBar>
);

// Main CustomerDashboard Component
const CustomerDashboard = () => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
  const [section, setSection] = useState("account_details"); // Default to "account_details"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loanRepayments, setLoanRepayments] = useState([]);
  const [actionLoading, setActionLoading] = useState(false); // For actions like transfers/deposits
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // For confirmation dialogs
  const [pendingAction, setPendingAction] = useState(null); // Store pending action details

  // Loan application states
  const [loanType, setLoanType] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [cibilScore, setCibilScore] = useState("");
  const [guaranteeNomineeName, setGuaranteeNomineeName] = useState("");
  const [guaranteeNomineePhone, setGuaranteeNomineePhone] = useState("");
  const [incomeProof, setIncomeProof] = useState("");
  const [loanBasis, setLoanBasis] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");
  const [goldGrams, setGoldGrams] = useState("");
  const [marks12th, setMarks12th] = useState("");
  const [loanError, setLoanError] = useState("");
  const [loanSuccess, setLoanSuccess] = useState("");

  // Fetch account data on component mount
  useEffect(() => {
    if (!loading) {
      if (!currentUser || userRole !== "customer") {
        navigate("/login");
        return;
      }

      const fetchAccount = async () => {
        try {
          setFetchLoading(true);
          const user = auth.currentUser;
          if (user) {
            const customerDoc = await getDoc(doc(db, "customer_detail", user.uid));
            if (customerDoc.exists()) {
              const customerData = customerDoc.data();
              setCustomerDetails(customerData);
              const customerId = customerData.customer_id;

              const q = query(
                collection(db, "bank_account"),
                where("customer_id", "==", customerId)
              );
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

                const repaymentsQuery = query(
                  collection(db, "loan_repayments"),
                  where("customer_id", "==", customerId)
                );
                const repaymentsSnapshot = await getDocs(repaymentsQuery);
                const repaymentsList = repaymentsSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setLoanRepayments(repaymentsList);
              } else {
                setError("No account found for this customer.");
              }
            } else {
              setError("Customer data not found.");
            }
          }
        } catch (err) {
          setError("Error fetching account: " + err.message);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchAccount();
    }
  }, [currentUser, userRole, loading, navigate]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setError("Failed to log out: " + err.message);
    }
  };

  // Generate unique transaction ID
  const generateTransactionId = () => {
    const prefix = "TXN";
    const randomNum = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();
    return `${prefix}${randomNum}`;
  };

  // Generate unique loan application ID
  const generateLoanApplicationId = () => {
    const prefix = "LOAN";
    const randomNum = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();
    return `${prefix}${randomNum}`;
  };

  // Handle transfer with confirmation dialog
  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    if (!amount || parseFloat(amount) <= 0) {
      setTransferError("Please enter a valid amount.");
      return;
    }

    // Open confirmation dialog
    setPendingAction({ type: "transfer" });
    setConfirmDialogOpen(true);
  };

  const confirmTransfer = async () => {
    setActionLoading(true);
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
          if (senderData.acct_balance < parseFloat(amount))
            throw new Error("Insufficient balance");
          if (senderData.acct_status !== "active")
            throw new Error("Sender account is not active");

          const recipientDocRef = doc(db, "bank_account", recipientAcctNumber);
          const recipientDoc = await transaction.get(recipientDocRef);
          if (!recipientDoc.exists())
            throw new Error("Recipient account not found");
          const recipientData = recipientDoc.data();
          if (recipientData.acct_status !== "active")
            throw new Error("Recipient account is not active");

          const recipientCustomerDoc = await getDoc(
            doc(db, "customer_detail", recipientData.customer_id)
          );
          const recipientName = recipientCustomerDoc.exists()
            ? recipientCustomerDoc.data().customer_name
            : "Unknown";

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
          if (senderData.acct_balance < parseFloat(amount))
            throw new Error("Insufficient balance");
          if (senderData.acct_status !== "active")
            throw new Error("Sender account is not active");

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

      // Update account and transactions
      const updatedAccountDoc = await getDoc(
        doc(db, "bank_account", account.acct_number)
      );
      setAccount(updatedAccountDoc.data());

      const transactionsQuery = query(
        collection(db, "transactions"),
        where("sender_acct_number", "==", account.acct_number)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      setTransactions(
        transactionsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          senderName: customerDetails.customer_name,
        }))
      );
    } catch (error) {
      setTransferError(error.message);
    } finally {
      setActionLoading(false);
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  // Handle deposit with confirmation dialog
  const handleDeposit = async (depositValue) => {
    setPendingAction({ type: "deposit", value: depositValue });
    setConfirmDialogOpen(true);
  };

  const confirmDeposit = async () => {
    setActionLoading(true);
    try {
      const depositValue = pendingAction.value;
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

      const updatedAccountDoc = await getDoc(
        doc(db, "bank_account", account.acct_number)
      );
      setAccount(updatedAccountDoc.data());

      const transactionsQuery = query(
        collection(db, "transactions"),
        where("sender_acct_number", "==", account.acct_number)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      setTransactions(
        transactionsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          senderName: customerDetails.customer_name,
        }))
      );

      setTransferSuccess(`Deposited INR ${depositValue.toLocaleString()} successfully`); // Fixed success message
    } catch (error) {
      setTransferError(error.message);
    } finally {
      setActionLoading(false);
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  // Handle loan submission (unchanged, but added for completeness)
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoanError("");
    setLoanSuccess("");

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
      setLoanError(
        "Please enter a valid 10-digit guarantee nominee phone number."
      );
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

    if (
      loanType === "educational" &&
      (!marks12th || marks12th < 400 || marks12th > 600)
    ) {
      setLoanError(
        "For Educational Loan, 12th marks must be between 400 and 600."
      );
      return;
    }
    if (loanType === "mortgage" && !propertyDetails) {
      setLoanError("For Mortgage Loan, please enter property details.");
      return;
    }
    if (loanType === "gold" && (!goldGrams || parseFloat(goldGrams) <= 0)) {
      setLoanError(
        "For Gold Loan, please enter a valid amount of gold in grams."
      );
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

      if (loanType === "educational") {
        loanApplicationData.marks_12th = parseInt(marks12th);
      } else if (loanType === "mortgage") {
        loanApplicationData.property_details = propertyDetails;
      } else if (loanType === "gold") {
        loanApplicationData.gold_grams = parseFloat(goldGrams);
        loanApplicationData.calculated_loan_amount = parseFloat(goldGrams) * 1000;
      }

      await setDoc(
        doc(db, "loan_applications", loanApplicationId),
        loanApplicationData
      );

      setLoanSuccess("Loan application submitted successfully. Awaiting admin approval.");
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

  // Toggle drawer for sidebar navigation
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Generate PDF statement (unchanged, but added for completeness)
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("CNB Bank Account Statement", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);

    // Customer Details
    doc.text("Customer Details", 14, 40);
    autoTable(doc, {
      startY: 45,
      head: [["Field", "Value"]],
      body: [
        ["Name", customerDetails.customer_name],
        ["Customer ID", customerDetails.customer_id],
        ["Account Number", account.acct_number],
        ["IFSC Code", account.ifsc_code || "N/A"],
        ["Phone", customerDetails.customer_phone],
        ["Address", customerDetails.customer_addr],
        ["Aadhaar", customerDetails.customer_aadhaar],
        ["PAN", customerDetails.customer_pan],
        ["Current Balance", `INR ${account.acct_balance.toFixed(2)}`],
        ["No. of Transactions", transactions.length],
        ["No. of Loans", loanRepayments.length],
      ],
    });

    // Transaction History
    doc.text("Transaction History", 14, doc.lastAutoTable.finalY + 10);
    const transactionData = transactions.map((txn) => [
      txn.transaction_id,
      txn.sender_name,
      txn.type === "within_bank" || txn.type === "deposit"
        ? txn.recipient_name
        : `${txn.recipient_acct_number} (${txn.recipient_bank_name})`,
      txn.amount > 0 ? `+${txn.amount}` : `${txn.amount}`,
      txn.type,
      txn.status,
      txn.created_at ? new Date(txn.created_at.toDate()).toLocaleString() : "N/A",
    ]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [
        ["Transaction ID", "Sender", "Recipient", "Amount", "Type", "Status", "Date"],
      ],
      body: transactionData,
      didDrawCell: (data) => {
        if (data.column.index === 3 && data.cell.raw.startsWith("+")) {
          doc.setTextColor(0, 128, 0); // Green for credit
        } else if (data.column.index === 3 && data.cell.raw.startsWith("-")) {
          doc.setTextColor(255, 0, 0); // Red for debit
        } else {
          doc.setTextColor(0, 0, 0); // Black for others
        }
      },
    });

    doc.save(`${customerDetails.customer_name}_Account_Statement.pdf`);
  };

  // Confirmation dialog handler
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const handleConfirmDialogProceed = () => {
    if (pendingAction?.type === "transfer") {
      confirmTransfer();
    } else if (pendingAction?.type === "deposit") {
      confirmDeposit();
    }
  };

  // Sidebar navigation items with icons
  const drawerItems = [
    { text: "Account Details", icon: <AccountBalanceIcon />, section: "account_details" },
    { text: "Transactions", icon: <ReceiptLongIcon />, section: "transactions" },
    { text: "Generate Money", icon: <MonetizationOnIcon />, section: "generate_money" },
    { text: "Loan", icon: <AttachMoneyIcon />, section: "loan" },
    { text: "Loan Repayment", icon: <PaymentsIcon />, section: "loan_repayment" },
  ];

  // Loading and error states
  if (loading || fetchLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!account || !customerDetails) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          No account data available.
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, mt: 4, mb: 4 }}>
        {/* Welcome Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            background: "linear-gradient(45deg, #f5f7fa 0%, #e4ebf5 100%)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome, {customerDetails.customer_name}!
          </Typography>
          <Typography variant="body1">
            Your account balance: <Chip label={`INR ${account.acct_balance.toLocaleString()}`} color="primary" />
          </Typography>
        </Paper>

        {/* Top Bar with Menu, Title, and Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={toggleDrawer(true)} aria-label="open menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" sx={{ ml: 2 }}>
              My Account
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Download your account statement">
              <Button
                variant="contained"
                color="primary"
                onClick={generatePDF}
                startIcon={<DownloadIcon />}
                sx={{ mr: 2 }}
              >
                Statement
              </Button>
            </Tooltip>
            <Tooltip title="Sign out of your account">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          variant={isMobile ? "temporary" : "permanent"}
          sx={{
            "& .MuiDrawer-paper": {
              width: isMobile ? 240 : 300,
              boxSizing: "border-box",
              background: "#f5f7fa",
            },
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            {drawerItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  setSection(item.section);
                  setDrawerOpen(false);
                }}
                sx={{
                  bgcolor: section === item.section ? "#e4ebf5" : "inherit",
                  "&:hover": { bgcolor: "#e4ebf5" },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ ml: isMobile ? 0 : "300px" }}>
          <Grid container spacing={3}>
            {section === "account_details" && (
              <>
                <Grid item xs={12} md={6}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Personal Details
                      </Typography>
                      <Typography>Name: {customerDetails.customer_name}</Typography>
                      <Typography>Phone: {customerDetails.customer_phone}</Typography>
                      <Typography>Address: {customerDetails.customer_addr}</Typography>
                      <Typography>Aadhaar: {customerDetails.customer_aadhaar}</Typography>
                      <Typography>PAN: {customerDetails.customer_pan}</Typography>
                      <Typography>Points: {customerDetails.customer_points}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Account Details
                      </Typography>
                      <Typography>Account Number: {account.acct_number}</Typography>
                      <Typography>Balance: INR {account.acct_balance.toLocaleString()}</Typography>
                      <Typography>Account Type: {account.acct_type}</Typography>
                      <Typography>Status: {account.acct_status}</Typography>
                      <Typography>Limit: INR {account.acct_limit.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {section === "transactions" && (
              <>
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Initiate Transfer
                      </Typography>
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
                            helperText="Enter the account number within CNB Bank"
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
                              helperText="Enter the name of the recipient bank"
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
                              helperText="Enter the account number at the recipient bank"
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
                              helperText="Enter the IFSC code of the recipient bank branch"
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
                          helperText="Enter the amount to transfer (minimum INR 1)"
                        />
                        <TextField
                          label="Description (Optional)"
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          helperText="Add a note or description for this transfer"
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
                          sx={{ mt: 2, py: 1.5 }}
                          disabled={actionLoading}
                          endIcon={<ArrowForwardIcon />}
                        >
                          {actionLoading ? <CircularProgress size={24} /> : "Transfer"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Transaction History
                      </Typography>
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
                            {transactions.map((txn, index) => (
                              <TableRow
                                key={txn.transaction_id}
                                sx={{
                                  bgcolor: index % 2 === 0 ? "#f9f9f9" : "inherit",
                                  "&:hover": { bgcolor: "#f1f1f1" },
                                }}
                              >
                                <TableCell>{txn.transaction_id}</TableCell>
                                <TableCell>{txn.sender_name}</TableCell>
                                <TableCell>
                                  {txn.type === "within_bank" || txn.type === "deposit"
                                    ? txn.recipient_name
                                    : `${txn.recipient_acct_number} (${txn.recipient_bank_name})`}
                                </TableCell>
                                <TableCell sx={{ color: txn.amount > 0 ? "green" : "red" }}>
                                  {txn.amount > 0 ? `+${txn.amount.toLocaleString()}` : `${txn.amount.toLocaleString()}`}
                                </TableCell>
                                <TableCell>
                                  {txn.type === "within_bank"
                                    ? "Within Bank"
                                    : txn.type === "interbank"
                                    ? "Interbank"
                                    : "Deposit"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={txn.status}
                                    color={txn.status === "completed" ? "success" : "warning"}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {txn.created_at
                                    ? new Date(txn.created_at.toDate()).toLocaleString()
                                    : "N/A"}
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
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generate Money (Deposit)
                    </Typography>
                    <Typography>
                      Current Balance: INR {account.acct_balance.toLocaleString()}
                    </Typography>
                    <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {[1000, 2000, 5000, 10000].map((value) => (
                        <Button
                          key={value}
                          variant="contained"
                          color="primary"
                          onClick={() => handleDeposit(value)}
                          sx={{ minWidth: 120 }}
                          disabled={actionLoading}
                        >
                          Deposit INR {value.toLocaleString()}
                        </Button>
                      ))}
                    </Box>
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
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Apply for a Loan
                    </Typography>
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
                        helperText="Enter the amount you wish to borrow"
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
                        helperText="Your credit score, obtained from a credit bureau"
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
                        helperText="Name of the person guaranteeing the loan"
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
                        helperText="10-digit phone number of the guarantee nominee"
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
                        helperText="Describe your income source or attach proof"
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
                          helperText="Your 12th standard marks, required for educational loans"
                        />
                      )}
                      {loanType === "mortgage" && (
                        <TextField
                          label="Property Details"
                          type="text"
                          value={propertyDetails}
                          onChange={(e) => setPropertyDetails(e.target.value)}
                          required
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          helperText="Describe the property being mortgaged"
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
                          helperText={`Estimated Loan Amount: INR ${
                            goldGrams ? (parseFloat(goldGrams) * 1000).toLocaleString() : 0
                          }`}
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
                        sx={{ mt: 2, py: 1.5 }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <CircularProgress size={24} /> : "Submit Loan Application"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {section === "loan_repayment" && (
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <LoanRepaymentSection
                      customerId={customerDetails.customer_id}
                      account={account}
                      setAccount={setAccount}
                      transactions={transactions}
                      setTransactions={setTransactions}
                      customerDetails={customerDetails}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
      <Footer />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction?.type === "transfer"
              ? `Are you sure you want to transfer INR ${amount.toLocaleString()} to ${
                  transferType === "within_bank"
                    ? `account ${recipientAcctNumber}`
                    : `${recipientAcctNumber} at ${recipientBankName}`
                }?`
              : pendingAction?.type === "deposit"
              ? `Are you sure you want to deposit INR ${pendingAction.value.toLocaleString()} to your account?`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDialogProceed} color="primary" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDashboard;