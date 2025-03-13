const nodemailer = require("nodemailer");

// Configure transporter (replace with your Gmail credentials or use environment variables)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // e.g., "cnb.bank.notification@gmail.com"
    pass: process.env.GMAIL_PASS, // App-specific password or environment variable
  },
});

const sendAccountApprovalEmail = async (customer) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: customer.email,
    subject: "Congratulations! Your CNB Bank Account is Approved",
    html: `
      <h2>Welcome to CNB Bank!</h2>
      <p>Dear ${customer.customer_name},</p>
      <p>Congratulations! Your bank account has been approved by our admin team. You can now log in to your customer dashboard and start using our services.</p>
      <h3>Account Details:</h3>
      <ul>
        <li><strong>Customer ID:</strong> ${customer.customer_id}</li>
        <li><strong>Account Number:</strong> ${customer.acct_number}</li>
        <li><strong>Initial Balance:</strong> INR ${customer.acct_balance.toFixed(2)}</li>
      </ul>
      <p>Please log in at <a href="http://your-app-url/customer">Customer Login</a> to manage your account.</p>
      <p>Best regards,<br>CNB Bank Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", customer.email);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email notification");
  }
};

const sendAccountRejectionEmail = async (customer) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: customer.email,
    subject: "Regret to Inform: Your CNB Bank Account Application Rejected",
    html: `
      <h2>CNB Bank Account Application Status</h2>
      <p>Dear ${customer.customer_name},</p>
      <p>We regret to inform you that your application for a bank account with CNB Bank has been rejected by our admin team. This decision was made based on our internal review process.</p>
      <h3>Application Details:</h3>
      <ul>
        <li><strong>Customer ID:</strong> ${customer.customer_id}</li>
        <li><strong>Account Number:</strong> ${customer.acct_number || "N/A"}</li>
      </ul>
      <p>If you believe this was an error or would like further clarification, please contact our support team at <a href="mailto:support@cnbank.com">support@cnbank.com</a>.</p>
      <p>We appreciate your interest in CNB Bank and hope to serve you in the future.</p>
      <p>Best regards,<br>CNB Bank Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully to:", customer.email);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email notification");
  }
};

module.exports = { sendAccountApprovalEmail, sendAccountRejectionEmail };