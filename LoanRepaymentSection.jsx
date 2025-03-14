import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { db } from "./firebase.js"; // Adjust path as needed
import {
  getDocs,
  query,
  where,
  collection,
  runTransaction,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const LoanRepaymentSection = ({
  customerId,
  account,
  setAccount,
  transactions,
  setTransactions,
  customerDetails,
}) => {
  const [loanRepayments, setLoanRepayments] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const fetchLoanRepayments = async () => {
      try {
        const q = query(
          collection(db, "loan_repayments"),
          where("customer_id", "==", customerId)
        );
        const loanRepaymentsSnapshot = await getDocs(q);
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
  }, [customerId]);

  const calculateScore = (repayment) => {
    const totalDue = repayment.loan_amount * (1 + repayment.interest_rate);
    const paidPercentage = (repayment.amount_repaid / totalDue) * 100;
    return Math.min(100, Math.round(paidPercentage)); // Score out of 100
  };

  const handleRepayment = async (repaymentId, paymentType) => {
    setPaymentError("");
    setPaymentSuccess("");

    let paymentAmount = 0; // Declare paymentAmount outside the transaction

    try {
      await runTransaction(db, async (transaction) => {
        const repaymentRef = doc(db, "loan_repayments", repaymentId);
        const repaymentDoc = await transaction.get(repaymentRef);
        if (!repaymentDoc.exists()) throw new Error("Loan repayment not found");
        const repaymentData = repaymentDoc.data();

        const accountRef = doc(db, "bank_account", account.acct_number);
        const accountDoc = await transaction.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Account not found");
        const accountData = accountDoc.data();

        let description = "";
        if (paymentType === "principal") {
          paymentAmount = repaymentData.monthly_principal;
          description = "Loan Principal Payment";
        } else if (paymentType === "interest") {
          paymentAmount = repaymentData.monthly_interest;
          description = "Loan Interest Payment";
        } else if (paymentType === "both") {
          paymentAmount = repaymentData.total_monthly_payment;
          description = "Loan EMI Payment (Principal + Interest)";
        }

        if (accountData.acct_balance < paymentAmount)
          throw new Error("Insufficient balance for repayment");

        transaction.update(accountRef, {
          acct_balance: accountData.acct_balance - paymentAmount,
        });

        transaction.update(repaymentRef, {
          amount_repaid: repaymentData.amount_repaid + paymentAmount,
          status:
            repaymentData.amount_repaid + paymentAmount >=
            repaymentData.loan_amount * (1 + repaymentData.interest_rate)
              ? "completed"
              : "pending",
        });

        const transactionId = `TXN${Math.floor(
          1000000000 + Math.random() * 9000000000
        )}`;
        transaction.set(doc(db, "transactions", transactionId), {
          transaction_id: transactionId,
          sender_acct_number: account.acct_number,
          sender_name: customerDetails.customer_name,
          recipient_acct_number: "CNB_LOAN_REPAYMENT",
          recipient_name: "CNB Bank Loan Repayment",
          amount: -paymentAmount, // Negative to indicate debit
          description,
          type: "loan_repayment",
          status: "completed",
          created_at: serverTimestamp(),
        });
      });

      // Update local state
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

      const updatedRepaymentsSnapshot = await getDocs(
        query(
          collection(db, "loan_repayments"),
          where("customer_id", "==", customerId)
        )
      );
      setLoanRepayments(
        updatedRepaymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      setPaymentSuccess(`Payment of INR ${paymentAmount} completed successfully`);
    } catch (err) {
      setPaymentError(err.message);
    }
  };

  if (fetchLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <Typography variant="h6">Loan Repayment (EMI)</Typography>
      {loanRepayments.length === 0 ? (
        <Typography>No active loans found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loan ID</TableCell>
              <TableCell>Loan Amount</TableCell>
              <TableCell>Monthly Principal</TableCell>
              <TableCell>Monthly Interest</TableCell>
              <TableCell>Total Monthly EMI</TableCell>
              <TableCell>Amount Repaid</TableCell>
              <TableCell>Remaining Amount</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loanRepayments.map((repayment) => {
              const totalDue = repayment.loan_amount * (1 + repayment.interest_rate);
              const remainingAmount = totalDue - repayment.amount_repaid;
              const score = calculateScore(repayment);
              return (
                <TableRow key={repayment.id}>
                  <TableCell>{repayment.loan_application_id}</TableCell>
                  <TableCell>INR {repayment.loan_amount.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.monthly_principal.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.monthly_interest.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.total_monthly_payment.toFixed(2)}</TableCell>
                  <TableCell>INR {repayment.amount_repaid.toFixed(2)}</TableCell>
                  <TableCell>INR {remainingAmount.toFixed(2)}</TableCell>
                  <TableCell>{score}/100</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRepayment(repayment.id, "principal")}
                      sx={{ mr: 1 }}
                      disabled={remainingAmount <= 0}
                    >
                      Pay Principal
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleRepayment(repayment.id, "interest")}
                      sx={{ mr: 1 }}
                      disabled={remainingAmount <= 0}
                    >
                      Pay Interest
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleRepayment(repayment.id, "both")}
                      disabled={remainingAmount <= 0}
                    >
                      Pay EMI
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      {paymentError && (
        <Typography color="error" align="center" paragraph>
          {paymentError}
        </Typography>
      )}
      {paymentSuccess && (
        <Typography color="primary" align="center" paragraph>
          {paymentSuccess}
        </Typography>
      )}
    </>
  );
};

export default LoanRepaymentSection;