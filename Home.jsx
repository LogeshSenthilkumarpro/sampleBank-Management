import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Box, 
  CardActions,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Stack,
  Chip,
  Rating
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

// Assuming you have a way to check if the user is logged in
const isLoggedIn = () => {
  // Replace this with your actual authentication check
  return false; // For demonstration; update with real auth logic
};

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <AppBar position="static" elevation={0} sx={{ 
      background: 'linear-gradient(45deg,#eeedf4, #2a5298 100%)',
    }}>
      <Toolbar>
        {/* Placeholder for logo on the left */}
        <Box sx={{ width: 50, height: 50, mr: 2 }}>
          {/* Add your logo here, e.g., <img src={logo} alt="CNB Bank Logo" /> */}
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

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTransactionClick = () => {
    if (isLoggedIn()) {
      navigate('/transactions'); // Redirect to transactions page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };
  
  const handlePortfolioClick = () => {
    if (isLoggedIn()) {
      navigate('/portfolio'); // Redirect to portfolio page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };
  
  const handleLoanClick = () => {
    if (isLoggedIn()) {
      navigate('/loan-application'); // Redirect to loan application page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };

  // Testimonials data
  const testimonials = [
    { 
      name: "Priya Sharma", 
      quote: "CNB Bank made managing my finances so easy and secure! Their mobile app is intuitive and I can complete most transactions in seconds.",
      rating: 5,
      role: "Business Owner"
    },
    { 
      name: "Rahul Verma", 
      quote: "The loan process was quick, and the rates are unbeatable. I got my home loan approved within days instead of weeks.",
      rating: 5,
      role: "Software Engineer"
    },
    { 
      name: "Anita Desai", 
      quote: "Excellent customer support and a user-friendly platform. Their representatives are always ready to help with any issues.",
      rating: 4,
      role: "Small Business Owner"
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Slide every 5 seconds
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#e5e2e1" }}>
      <NavBar />
      
      {/* Hero Section with Fixed Overlay */}
      <Paper 
        sx={{ 
          borderRadius: 0,
          bgcolor: '#f5f7fa',
          backgroundImage: 'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          color: 'white',
          py: 8,
          mb: 6, // Added bottom margin for spacing
          borderBottom: '1px solid #e0e0e0',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', // Lighter overlay as requested
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 'bold', mb: 2 }}>
                Welcome to CNB Bank
              </Typography>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ mb: 4, opacity: 0.9, color: '#fff' }}>
                Manage your finances with ease and security. Experience banking reimagined for the digital age.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    bgcolor: '#ffeb3b', 
                    color: '#1e3c72', 
                    px: 4, 
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#fff',
                      color: '#1e3c72'
                    }
                  }}
                  component={Link} 
                  to="/signup"
                >
                  Open an Account
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderColor: '#fff', 
                    color: '#fff',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#ffeb3b',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onClick={handleLoanClick}
                >
                  Apply for Loan
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ 
                p: 3, 
                bgcolor: 'rgba(255,255,255,0.9)',
                color: '#333',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
              }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e3c72' }}>
                    Why Choose CNB Bank?
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                    <Typography>Advanced security measures</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceWalletIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                    <Typography>Competitive rates on loans & savings</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SupportAgentIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                    <Typography>24/7 customer support</Typography>
                  </Box>
                </CardContent>
              </Card>
              {/* Logo placeholder */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Box 
                  component="img"
                  src="https://via.placeholder.com/150?text=CNB+Bank+Logo" // Replace with actual logo URL
                  alt="CNB Bank Logo"
                  sx={{ 
                    width: '150px', 
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Services Section with Adjusted Positioning */}
      <Container sx={{ mt: 5, position: 'relative', zIndex: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardMedia
                component="img"
                height="140"
                image="image.png"
                alt="Money Transfer"
                onClick={handleTransactionClick}
                sx={{ cursor: "pointer" }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1e3c72', mr: 2 }}>
                    <LocalAtmIcon sx={{ color: '#fff' }} />
                  </Avatar>
                  <Typography variant="h5">Money Transfer</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Transfer money between accounts securely and quickly with zero fees on domestic transfers.
                </Typography>
                <Button 
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleTransactionClick}
                  sx={{ 
                    mt: 1,
                    bgcolor: '#1e3c72',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#2a5298'
                    }
                  }}
                >
                  Transfer Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardMedia
                component="img"
                height="140"
                image="https://via.placeholder.com/150?text=Loan"
                alt="Loan"
                onClick={handleLoanClick}
                sx={{ cursor: "pointer" }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1e3c72', mr: 2 }}>
                    <AccountBalanceIcon sx={{ color: '#fff' }} />
                  </Avatar>
                  <Typography variant="h5">Apply for a Loan</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Get loans with competitive rates starting from 5.99% APR and flexible repayment terms.
                </Typography>
                <Button 
                  endIcon=<ArrowForwardIcon />
                  onClick={handleLoanClick}
                  sx={{ 
                    mt: 1,
                    bgcolor: '#1e3c72',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#2a5298'
                    }
                  }}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardMedia
                component="img"
                height="140"
                image="https://via.placeholder.com/150?text=Portfolio"
                alt="Portfolio"
                onClick={handlePortfolioClick}
                sx={{ cursor: "pointer" }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1e3c72', mr: 2 }}>
                    <AssessmentIcon sx={{ color: '#fff' }} />
                  </Avatar>
                  <Typography variant="h5">Portfolio Management</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  View and manage your financial portfolio with advanced insights and analytics tools.
                </Typography>
                <Button 
                  endIcon={<ArrowForwardIcon />}
                  onClick={handlePortfolioClick}
                  sx={{ 
                    mt: 1,
                    bgcolor: '#1e3c72',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#2a5298'
                    }
                  }}
                >
                  View Portfolio
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Container sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="WHY CHOOSE US" sx={{ bgcolor: '#e3f2fd', color: '#1e3c72', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Why Choose CNB Bank?
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            We combine cutting-edge technology with personal service to deliver an exceptional banking experience.
          </Typography>
          <Divider sx={{ mt: 4, mb: 6 }} />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <SecurityIcon sx={{ fontSize: 40, mb: 2, color: '#1e3c72' }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#1e3c72' }}>Secure Banking</Typography>
              <Typography variant="body2" color="text.secondary">
                Industry-leading encryption and multi-factor authentication keep your money and personal information safe and protected.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, mb: 2, color: '#1e3c72' }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#1e3c72' }}>Low Rates</Typography>
              <Typography variant="body2" color="text.secondary">
                Competitive loan and savings rates designed to help you save money and grow your wealth over time.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <SupportAgentIcon sx={{ fontSize: 40, mb: 2, color: '#1e3c72' }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#1e3c72' }}>24/7 Support</Typography>
              <Typography variant="body2" color="text.secondary">
                Our dedicated customer support team is available around the clock to assist you with any banking needs.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: '#1e3c72', color: 'white', py: 8 }}>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="TESTIMONIALS" sx={{ bgcolor: '#ffeb3b', color: '#1e3c72', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              What Our Customers Say
            </Typography>
            <Typography variant="body1" sx={{ mb: 5, opacity: 0.9, maxWidth: '800px', mx: 'auto' }}>
              Don't just take our word for it. Here's what some of our satisfied customers have to say.
            </Typography>
          </Box>
          
          <Box sx={{ position: 'relative', maxWidth: '900px', mx: 'auto' }}>
            <IconButton 
              sx={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
              onClick={handlePrevTestimonial}
            >
              <KeyboardArrowLeftIcon sx={{ color: '#1e3c72' }} />
            </IconButton>
            
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: 'white', color: 'text.primary', transition: 'opacity 0.5s' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Avatar 
                    src={`/api/placeholder/150/150?text=${testimonials[currentTestimonial].name.charAt(0)}`}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#1e3c72' }}
                  />
                  <Typography variant="h6">{testimonials[currentTestimonial].name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {testimonials[currentTestimonial].role}
                  </Typography>
                  <Rating 
                    value={testimonials[currentTestimonial].rating} 
                    readOnly 
                    precision={0.5}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <FormatQuoteIcon sx={{ color: '#1e3c72', fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                    "{testimonials[currentTestimonial].quote}"
                  </Typography>
                  <Chip 
                    label="Verified Customer" 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                    sx={{ color: '#1e3c72', borderColor: '#1e3c72' }}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <IconButton 
              sx={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
              onClick={handleNextTestimonial}
            >
              <KeyboardArrowRightIcon sx={{ color: '#1e3c72' }} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Latest Offers Section */}
      <Container sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="LATEST OFFERS" sx={{ bgcolor: '#e3f2fd', color: '#1e3c72', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Latest Offers
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Take advantage of our current promotions and special offers to maximize your banking benefits.
          </Typography>
          <Divider sx={{ mt: 4, mb: 6 }} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#1e3c72' }}>Zero-Fee Savings Account</Typography>
                <Typography variant="body2" color="text.secondary">
                  Open a savings account with no maintenance fees until 2025!
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: '#1e3c72',
                    '&:hover': {
                      bgcolor: '#e3f2fd'
                    }
                  }}
                  component={Link} 
                  to="/signup"
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#1e3c72' }}>Special Loan Rates</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get a personal loan at 5.99% APR for a limited time.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: '#1e3c72',
                    '&:hover': {
                      bgcolor: '#e3f2fd'
                    }
                  }}
                  component={Link} 
                  to="/loan"
                >
                  Apply Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default Home;