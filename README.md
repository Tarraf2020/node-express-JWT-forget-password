# Secure User Authentication with Node.js, Express, JWT, and Nodemailer

This project demonstrates a comprehensive user authentication system built using Node.js, Express.js, JSON Web Tokens (JWT), and Nodemailer. It encompasses user registration, secure API access with JWT authentication, and a password reset mechanism using Nodemailer.

## Prerequisites

To embark on this project, ensure you have the following prerequisites installed:

- Node.js (v16.17 or higher)
- npm
- MongoDB (optional, for persistent data storage)

## Installation and Setup

**Step 1: Install Node Modules**

Navigate to the project directory and install the required dependencies using npm:

```bash
npm install
```

**Step 2: Run the Application**

Launch the secure user authentication application using the following command:

```bash
npm run start
```

## Understanding the System

The user authentication system comprises the following components:

1. **User Registration:** Users can register their accounts by providing their credentials. The system securely hashes and stores passwords to protect user data.

2. **Secure API Access:** Upon successful login, users receive a JWT token that grants them access to protected API endpoints. The system verifies the validity of the JWT token before authorizing access.

3. **Password Reset:** Users can initiate a password reset process by providing their registered email address. The system generates a password reset token and sends it to the user's email via Nodemailer. By clicking the link in the email, users can set a new password.

## Contributions

Contributions to this project are welcome. Feel free to fork the repository, implement your enhancements, and submit a pull request.
