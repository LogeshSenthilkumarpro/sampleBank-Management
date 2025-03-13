import React from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "./Footer";

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

const Loan = () => {
  const navigate = useNavigate();

  const handleApplyLoan = () => {
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Loan Services
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Types of Loans
            </Typography>
            <Typography variant="h6">1. Agricultural Loan</Typography>
            <Typography paragraph>
              Designed for farmers to support agricultural activities such as purchasing seeds, fertilizers, or equipment.
            </Typography>
            <Typography variant="h6">2. Gold Loan</Typography>
            <Typography paragraph>
              A secured loan where you can pledge your gold jewelry to get funds quickly with low interest rates.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Procedures to Acquire a Loan
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="1. Eligibility Check: Ensure you meet the eligibility criteria (e.g., age, income, credit score)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Documentation: Submit required documents (e.g., ID proof, address proof, income proof, collateral for secured loans)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Application: Fill out the loan application form and submit it for review." />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Verification: The bank verifies your details and collateral (if applicable)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. Approval: Once approved, the loan amount is disbursed to your account." />
              </ListItem>
            </List>

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleApplyLoan}
            >
              Apply for a Loan
            </Button>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </Box>
  );
};

export default Loan;