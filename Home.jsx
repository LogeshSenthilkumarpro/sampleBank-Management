import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardMedia, CardContent, Box, CardActions } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

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

const Home = () => {
  const navigate = useNavigate();

  const handleTransactionClick = () => navigate("/login");
  const handlePortfolioClick = () => navigate("/login");
  const handleLoanClick = () => navigate("/loan");

  // Testimonials data
  const testimonials = [
    { name: "Priya Sharma", quote: "CNB Bank made managing my finances so easy and secure!" },
    { name: "Rahul Verma", quote: "The loan process was quick, and the rates are unbeatable." },
    { name: "Anita Desai", quote: "Excellent customer support and a user-friendly platform." },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000); // Slide every 3 seconds
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container sx={{ flexGrow: 1, mt: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Welcome to CNB Bank
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
          Manage your finances with ease and security.
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://via.placeholder.com/150?text=Money+Transfer"
                alt="Money Transfer"
                onClick={handleTransactionClick}
                sx={{ cursor: "pointer" }}
              />
              <CardContent>
                <Typography variant="h5">Money Transfer</Typography>
                <Typography variant="body2" color="textSecondary">
                  Transfer money between accounts securely and quickly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://via.placeholder.com/150?text=Loan"
                alt="Loan"
                onClick={handleLoanClick}
                sx={{ cursor: "pointer" }}
              />
              <CardContent>
                <Typography variant="h5">Apply for a Loan</Typography>
                <Typography variant="body2" color="textSecondary">
                  Get loans with competitive rates and flexible terms.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://via.placeholder.com/150?text=Portfolio"
                alt="Portfolio"
                onClick={handlePortfolioClick}
                sx={{ cursor: "pointer" }}
              />
              <CardContent>
                <Typography variant="h5">Portfolio Management</Typography>
                <Typography variant="body2" color="textSecondary">
                  View and manage your account portfolio with ease.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Testimonials Section */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            What Our Customers Say
          </Typography>
          <Card sx={{ maxWidth: 600, mx: "auto", p: 2, transition: "opacity 0.5s" }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                "{testimonials[currentTestimonial].quote}"
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                - {testimonials[currentTestimonial].name}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Why Choose CNB Bank Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose CNB Bank?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Secure Banking</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Industry-leading encryption keeps your money safe.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Low Rates</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Competitive loan and savings rates for your benefit.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">24/7 Support</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Our team is here to assist you anytime.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Latest Offers Section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Latest Offers
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Zero-Fee Savings Account</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Open a savings account with no maintenance fees until 2025!
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" component={Link} to="/signup">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Special Loan Rates</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Get a personal loan at 5.99% APR for a limited time.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" component={Link} to="/loan">
                    Apply Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Home;