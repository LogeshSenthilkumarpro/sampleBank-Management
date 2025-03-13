import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import { getDocs, collection, doc, updateDoc, deleteDoc, query, where, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase.js";
import { AppBar, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "./Footer.jsx";
import { serverTimestamp } from "firebase/firestore"; // Added missing import

// These should be implemented in a separate emailService.js file
const sendAccountApprovalEmail = async ({ customer_name, customer_id, email, acct_number, acct_balance }) => {
  // Implementation should be moved to emailService.js
  console.log(`Sending approval email to ${email}`);
};

const sendAccountRejectionEmail = async ({ customer_name, customer_id, email, acct_number }) => {
  // Implementation should be moved to emailService.js
  console.log(`Sending rejection email to ${email}`);
};

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

const AdminDashboard = () => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [totalBankMoney, setTotalBankMoney] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [section, setSection] = useState("users_and_accounts");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!currentUser || userRole !== "admin") {
        navigate("/login");
        return;
      }

      const fetchData = async () => {
        try {
          const transactionsSnapshot = await getDocs(collection(db, "transactions"));
          const transactionsList = transactionsSnapshot.docs.map((doc) => doc.data());
          console.log("Fetched Transactions:", transactionsList);
          setTransactions(transactionsList);

          const accountsSnapshot = await getDocs(collection(db, "bank_account"));
          const accountsList = accountsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Fetched Accounts:", accountsList);
          setAccounts(accountsList);
          const total = accountsList.reduce((sum, account) => sum + (account.acct_balance || 0), 0);
          setTotalBankMoney(total);

          const customersSnapshot = await getDocs(collection(db, "customer_detail"));
          const customersList = customersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Fetched Customers:", customersList);
          setCustomers(customersList);

          const loanApplicationsSnapshot = await getDocs(collection(db, "loan_applications"));
          const loanApplicationsList = loanApplicationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Fetched Loan Applications:", loanApplicationsList);
          setLoanApplications(loanApplicationsList);

          setFetchLoading(false);
        } catch (err) {
          console.error("Fetch Error:", err);
          setError("Error fetching data: " + err.message);
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser, userRole, loading, navigate]);

  const handleAccountAction = async (accountId, action) => {
    try {
      const accountRef = doc(db, "bank_account", accountId);
      const account = accounts.find((a) => a.id === accountId);
      const customerId = account.customer_id;

      const customerQuery = query(collection(db, "customer_detail"), where("customer_id", "==", customerId));
      const customerSnapshot = await getDocs(customerQuery);

      if (customerSnapshot.empty) {
        throw new Error("Corresponding customer not found.");
      }

      const customerDoc = customerSnapshot.docs[0];
      const customerRef = doc(db, "customer_detail", customerDoc.id);
      const customerData = customerDoc.data();

      if (action === "delete") {
        await deleteDoc(accountRef);
        await deleteDoc(customerRef);
        setAccounts(accounts.filter((a) => a.id !== accountId));
        setCustomers(customers.filter((c) => c.id !== customerDoc.id));
        await sendAccountRejectionEmail({
          customer_name: customerData.customer_name,
          customer_id: customerData.customer_id,
          email: customerData.email,
          acct_number: account.acct_number,
        });
        alert("Account rejected and rejection email sent successfully.");
      } else {
        await updateDoc(accountRef, { acct_status: action });
        await updateDoc(customerRef, { acct_status: action });
        setAccounts(accounts.map((a) => (a.id === accountId ? { ...a, acct_status: action } : a)));
        setCustomers(
          customers.map((c) => (c.id === customerDoc.id ? { ...c, acct_status: action } : c))
        );

        if (action === "active") {
          const accountData = accounts.find((a) => a.id === accountId);
          await sendAccountApprovalEmail({
            customer_name: customerData.customer_name,
            customer_id: customerData.customer_id,
            email: customerData.email,
            acct_number: accountData.acct_number,
            acct_balance: accountData.acct_balance,
          });
          alert("Account approved and email notification sent successfully.");
        } else {
          alert(`Account status updated to ${action} successfully.`);
        }
      }

      const updatedAccountsSnapshot = await getDocs(collection(db, "bank_account"));
      const updatedAccountsList = updatedAccountsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(updatedAccountsList);
      const total = updatedAccountsList.reduce((sum, account) => sum + (account.acct_balance || 0), 0);
      setTotalBankMoney(total);
    } catch (err) {
      setError("Error updating account: " + err.message);
    }
  };

  const handleLoanAction = async (loanApplicationId, action) => {
    try {
      const loanRef = doc(db, "loan_applications", loanApplicationId);
      const loan = loanApplications.find((l) => l.id === loanApplicationId);

      if (action === "approve") {
        await updateDoc(loanRef, { status: "approved" });

        const accountRef = doc(db, "bank_account", loan.account_number);
        const accountDoc = await getDoc(accountRef);
        if (accountDoc.exists()) {
          const accountData = accountDoc.data();
          await updateDoc(accountRef, {
            acct_balance: accountData.acct_balance + loan.loan_amount,
          });
        }

        const loanRepaymentId = `REPAY_${loanApplicationId}`;
        const interestRate = 0.1;
        const loanTermMonths = 12;
        const monthlyInterest = (loan.loan_amount * interestRate) / loanTermMonths;
        const monthlyPrincipal = loan.loan_amount / loanTermMonths;
        const totalMonthlyPayment = monthlyInterest + monthlyPrincipal;

        await setDoc(doc(db, "loan_repayments", loanRepaymentId), {
          loan_application_id: loanApplicationId,
          customer_id: loan.customer_id,
          customer_name: loan.customer_name,
          account_number: loan.account_number,
          loan_amount: loan.loan_amount,
          interest_rate: interestRate,
          loan_term_months: loanTermMonths,
          monthly_principal: monthlyPrincipal,
          monthly_interest: monthlyInterest,
          total_monthly_payment: totalMonthlyPayment,
          amount_repaid: 0,
          status: "pending",
          created_at: serverTimestamp(),
        });

        alert("Loan approved and amount credited successfully.");
      } else if (action === "reject") {
        await updateDoc(loanRef, { status: "rejected" });
        alert("Loan rejected successfully.");
      } else if (action === "hold") {
        await updateDoc(loanRef, { status: "hold" });
        alert("Loan application placed on hold successfully.");
      }

      const updatedLoanApplicationsSnapshot = await getDocs(collection(db, "loan_applications"));
      const updatedLoanApplicationsList = updatedLoanApplicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoanApplications(updatedLoanApplicationsList);

      const updatedAccountsSnapshot = await getDocs(collection(db, "bank_account"));
      const updatedAccountsList = updatedAccountsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(updatedAccountsList);
      const total = updatedAccountsList.reduce((sum, account) => sum + (account.acct_balance || 0), 0);
      setTotalBankMoney(total);
    } catch (err) {
      setError("Error updating loan application: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setError("Failed to log out: " + err.message);
    }
  };

  const toggleDrawer = (open) => () => {
    console.log("Toggling drawer to:", open);
    setDrawerOpen(open);
  };

  const getCustomerLoanCount = (customerId) => {
    return loanApplications.filter((loan) => loan.customer_id === customerId && loan.status !== "rejected").length;
  };

  if (loading || fetchLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  console.log("Current Section:", section);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, mt: 4 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <IconButton onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log("Manually setting section to users_and_accounts");
              setSection("users_and_accounts");
            }}
            sx={{ mr: 2 }}
          >
            Show Users and Accounts
          </Button>
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
            {["Transactions", "Users and Accounts", "Loan Approval", "Loan Repayment"].map((text) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  const newSection = text.toLowerCase().replace(" ", "_");
                  console.log("Switching to section:", newSection);
                  setSection(newSection);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">Bank Summary</Typography>
            <Typography>Total Money in Bank: INR {totalBankMoney.toFixed(2)}</Typography>
          </CardContent>
        </Card>

        {section === "transactions" && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">All Transactions</Typography>
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
                        <TableCell>{txn.sender_name || txn.sender_acct_number}</TableCell>
                        <TableCell>
                          {txn.type === "within_bank" || txn.type === "deposit"
                            ? (txn.recipient_name || txn.recipient_acct_number)
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
        )}

        {section === "users_and_accounts" && (
          <Card sx={{ mt: 3, bgcolor: "lightblue" }}>
            <CardContent>
              {console.log("Rendering Users and Accounts Section")}
              <Typography variant="h6">Manage Users and Accounts</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Customer ID</TableCell>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>No. of Loans</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>No accounts found.</TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => {
                      const customer = customers.find((c) => c.customer_id === account.customer_id);
                      const loanCount = getCustomerLoanCount(account.customer_id);
                      return (
                        <TableRow key={account.id}>
                          <TableCell>{customer ? customer.customer_name : "Unknown"}</TableCell>
                          <TableCell>{account.customer_id}</TableCell>
                          <TableCell>{account.acct_number}</TableCell>
                          <TableCell>INR {account.acct_balance.toFixed(2)}</TableCell>
                          <TableCell>{account.acct_status}</TableCell>
                          <TableCell>{loanCount}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleAccountAction(account.id, "active")}
                              sx={{ mr: 1 }}
                              disabled={account.acct_status === "active"}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={() => handleAccountAction(account.id, "pending")}
                              sx={{ mr: 1 }}
                              disabled={account.acct_status === "pending"}
                            >
                              Hold
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleAccountAction(account.id, "delete")}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {section === "loan_approval" && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">Loan Approval</Typography>
              {loanApplications.length === 0 ? (
                <Typography>No loan applications found.</Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Application ID</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Loan Type</TableCell>
                      <TableCell>Loan Amount</TableCell>
                      <TableCell>CIBIL Score</TableCell>
                      <TableCell>Income Proof</TableCell>
                      <TableCell>Guarantee Nominee</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loanApplications.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.loan_application_id}</TableCell>
                        <TableCell>{loan.customer_name}</TableCell>
                        <TableCell>{loan.loan_type}</TableCell>
                        <TableCell>INR {loan.loan_amount.toFixed(2)}</TableCell>
                        <TableCell>{loan.cibil_score}</TableCell>
                        <TableCell>{loan.income_proof}</TableCell>
                        <TableCell>{loan.guarantee_nominee_name} ({loan.guarantee_nominee_phone})</TableCell>
                        <TableCell>{loan.status}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleLoanAction(loan.id, "approve")}
                            sx={{ mr: 1 }}
                            disabled={loan.status !== "pending" && loan.status !== "hold"}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={() => handleLoanAction(loan.id, "hold")}
                            sx={{ mr: 1 }}
                            disabled={loan.status !== "pending"}
                          >
                            Hold
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleLoanAction(loan.id, "reject")}
                            disabled={loan.status !== "pending" && loan.status !== "hold"}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {section === "loan_repayment" && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">Loan Repayment</Typography>
              <LoanRepaymentSection />
            </CardContent>
          </Card>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

const LoanRepaymentSection = () => {
  const [loanRepayments, setLoanRepayments] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoanRepayments = async () => {
      try {
        const loanRepaymentsSnapshot = await getDocs(collection(db, "loan_repayments"));
        const loanRepaymentsList = loanRepaymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoanRepayments(loanRepaymentsList);
        setFetchLoading(false);
      } catch (err) {
        setError("Error fetching loan repayments: " + err.message);
        setFetchLoading(false);
      }
    };
    fetchLoanRepayments();
  }, []);

  if (fetchLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      {loanRepayments.length === 0 ? (
        <Typography>No loan repayments found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loan Application ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Loan Amount</TableCell>
              <TableCell>Monthly Principal</TableCell>
              <TableCell>Monthly Interest</TableCell>
              <TableCell>Total Monthly Payment</TableCell>
              <TableCell>Amount Repaid</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loanRepayments.map((repayment) => {
              const isFullyPaid = repayment.amount_repaid >= repayment.loan_amount * (1 + repayment.interest_rate);
              return (
                <TableRow key={repayment.id}>
                  <TableCell>{repayment.loan_application_id}</TableCell>
                  <TableCell>{repayment.customer_name}</TableCell>
                  <TableCell>INR {repayment.loan_amount.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.monthly_principal.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.monthly_interest.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.total_monthly_payment.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.amount_repaid.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography color={isFullyPaid ? "green" : "red"}>
                      {isFullyPaid ? "Fully Paid" : "Pending"}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default AdminDashboard;