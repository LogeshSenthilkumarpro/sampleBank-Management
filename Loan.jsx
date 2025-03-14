import React from "react";
import { 
  Container, Typography, Box, Button, Card, CardContent, Grid, 
  Paper, Chip, Divider, useTheme, useMediaQuery
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "./Footer";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SchoolIcon from '@mui/icons-material/School';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';
import StarIcon from '@mui/icons-material/Star';

// Assuming you have a way to check if the user is logged in
// This could be from a context, redux store, or auth service
const isLoggedIn = () => {
  // Replace this with your actual authentication check
  return false; // For demonstration; update with real auth logic
};

const NavBar = () => (
  <AppBar position="static" color="primary" elevation={0} sx={{ 
    background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
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
      <Button color="inherit" component={RouterLink} to="/" sx={{ mx: 1, fontWeight: 500 }}>Home</Button>
      <Button color="inherit" component={RouterLink} to="/loan" sx={{ mx: 1, fontWeight: 500, borderBottom: '2px solid #ffeb3b' }}>Loans</Button>
      <Button color="inherit" component={RouterLink} to="/login" sx={{ mx: 1, fontWeight: 500 }}>Login</Button>
      <Button color="inherit" component={RouterLink} to="/admin" sx={{ mx: 1, fontWeight: 500 }}>Admin</Button>
      <Button 
        variant="contained" 
        component={RouterLink} 
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
    </Toolbar>
  </AppBar>
);

// Hero banner component
const HeroBanner = () => {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (isLoggedIn()) {
      navigate('/loan-application'); // Redirect to loan application page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };

  const handleCalculatorClick = () => {
    if (isLoggedIn()) {
      navigate('/loan-application'); // Redirect to loan application page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };

  return (
    <Box sx={{ 
      bgcolor: '#f5f7fa',
      backgroundImage: 'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      color: 'white',
      py: 8,
      borderBottom: '1px solid #e0e0e0',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Financial Solutions Tailored for You
            </Typography>
            <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9,color:"#fff" }}>
              Competitive rates, flexible terms, and a seamless application process to help you achieve your financial goals.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleApplyClick}
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
              >
                Apply Now
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                endIcon={<CalculateIcon />}
                onClick={handleCalculatorClick}
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
              >
                Loan Calculator
              </Button>
            </Box>
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
                  <StarIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                  <Typography>Competitive interest rates starting at 4.5%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                  <Typography>Quick approval within 24 hours</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                  <Typography>No hidden fees or prepayment penalties</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ color: '#ffeb3b', mr: 1 }} />
                  <Typography>Dedicated loan advisor for personalized service</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Rate display component
const CurrentRates = () => (
  <Box sx={{ py: 4, bgcolor: '#f5f7fa' }}>
    <Container>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderTop: '4px solid #1e3c72' }}>
            <Typography variant="subtitle2" color="textSecondary">Home Loan</Typography>
            <Typography variant="h4" sx={{ color: '#1e3c72', fontWeight: 700 }}>4.5%</Typography>
            <Typography variant="body2">Starting APR</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderTop: '4px solid #1e3c72' }}>
            <Typography variant="subtitle2" color="textSecondary">Education Loan</Typography>
            <Typography variant="h4" sx={{ color: '#1e3c72', fontWeight: 700 }}>5.2%</Typography>
            <Typography variant="body2">Starting APR</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderTop: '4px solid #1e3c72' }}>
            <Typography variant="subtitle2" color="textSecondary">Agricultural Loan</Typography>
            <Typography variant="h4" sx={{ color: '#1e3c72', fontWeight: 700 }}>3.8%</Typography>
            <Typography variant="body2">Starting APR</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderTop: '4px solid #1e3c72' }}>
            <Typography variant="subtitle2" color="textSecondary">Gold Loan</Typography>
            <Typography variant="h4" sx={{ color: '#1e3c72', fontWeight: 700 }}>7.5%</Typography>
            <Typography variant="body2">Starting APR</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const Loan = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleApplyLoan = () => {
    if (isLoggedIn()) {
      navigate('/loan-application'); // Redirect to loan application page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };
  
  const loanTypes = [
    { 
      title: "Agricultural Loan", 
      icon: <AgricultureIcon sx={{ fontSize: 40, color: '#1e3c72' }} />,
      content: "Agricultural loans provide financial assistance for farming operations, equipment purchases, land acquisition, and seasonal requirements. These loans help cover costs associated with purchasing seeds, fertilizers, equipment, and managing day-to-day farming operations. Interest rates are typically lower than standard loans, and repayment terms are more flexible, often aligned with harvest cycles.", 
      rate: "3.8%",
      features: ["Up to ₹25 lakh", "Terms up to 7 years", "Subsidized rates available"]
    },
    { 
      title: "Educational Loan", 
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#1e3c72' }} />,
      content: "Educational loans help finance higher education, covering tuition fees, books, accommodation, and other study-related expenses. These loans often come with lower interest rates and flexible repayment options, with some banks offering a grace period until after graduation. Repayment typically starts after course completion.", 
      rate: "5.2%",
      features: ["Up to ₹75 lakh for overseas studies", "No collateral for loans under ₹7.5 lakh", "Tax benefits under Section 80E"]
    },
    { 
      title: "Gold Loan", 
      icon: <LocalAtmIcon sx={{ fontSize: 40, color: '#1e3c72' }} />,
      content: "Gold loans offer quick funds by pledging gold jewelry or coins as collateral. These loans are a quick and convenient way to access funds without extensive paperwork or credit checks. The loan amount is determined based on the value of the gold, typically up to 75-90% of its market price. Benefit from high loan-to-value ratios and minimal documentation.", 
      rate: "7.5%",
      features: ["Up to 80% of gold value", "Approval within hours", "Flexible repayment options"]
    },
    { 
      title: "Mortgage Loan", 
      icon: <HomeIcon sx={{ fontSize: 40, color: '#1e3c72' }} />,
      content: "Mortgage loans help you purchase or refinance property with competitive interest rates and flexible terms. The property itself serves as collateral, and the loan is repaid over an extended period, typically 15 to 30 years. Our home loans feature transparent processes, quick approvals, and expert guidance.", 
      rate: "4.5%",
      features: ["Up to ₹5 crore", "Terms up to 30 years", "Free partial prepayments"]
    }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <HeroBanner />
      <CurrentRates />
      
      <Container sx={{ flexGrow: 1, py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="LOAN PRODUCTS" sx={{ bgcolor: '#e3f2fd', color: '#1e3c72', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Find the Right Loan for Your Needs
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our loan products are designed to meet diverse financial requirements with competitive rates, flexible terms, and a straightforward application process.
          </Typography>
          <Divider sx={{ mt: 4, mb: 6 }} />
        </Box>
        
        {loanTypes.map((loan, index) => (
          <Card 
            key={index} 
            elevation={2}
            sx={{ 
              mb: 5,
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Grid container>
              <Grid 
                item 
                xs={12} 
                md={5}
                sx={{ 
                  bgcolor: index % 2 === 0 ? '#f5f7fa' : '#e8f0fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ 
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {loan.icon}
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 2, color: '#1e3c72' }}>
                    {loan.title}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1e3c72', fontWeight: 700 }}>
                    {loan.rate} <Typography component="span" variant="body2">APR</Typography>
                  </Typography>
                  <Box sx={{ 
                    bgcolor: '#1e3c72', 
                    color: 'white', 
                    py: 1, 
                    px: 3, 
                    borderRadius: 5,
                    display: 'inline-block',
                    mt: 2
                  }}>
                    <Typography variant="button">
                      Starting Rate
                    </Typography>
                  </Box>
                </Box>
                {!isMobile && (
                  <Box sx={{ 
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                    top: '-150px',
                    right: '-150px',
                    opacity: 0.5
                  }} />
                )}
              </Grid>
              <Grid item xs={12} md={7}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                    {loan.content}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#1e3c72' }}>
                      Key Features
                    </Typography>
                    {loan.features.map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ color: '#ffeb3b', mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleApplyLoan}
                    sx={{ 
                      bgcolor: '#1e3c72', 
                      '&:hover': { 
                        bgcolor: '#2a5298' 
                      }
                    }}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Container>
      <Footer />
    </Box>
  );
};

export default Loan;