import React from "react";
import { Box, Typography, Link, Container } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: "auto", 
        backgroundColor: "#f5f5f5", 
        borderTop: "1px solid #e0e0e0"
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Bank Management System. All rights reserved.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Support & Contact Details:</strong>
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Email: <Link href="mailto:support@bankmanagement.com">support@bankmanagement.com</Link>
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Phone: <Link href="tel:+1234567890">+1 (234) 567-890</Link>
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Address: 123 Bank Street, Financial City, Country
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;