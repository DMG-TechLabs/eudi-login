---
icon: key
---

# Authorization Process

## Overview
This document describes the authorization process facilitated through the EUDI Wallet. The process ensures secure identity verification by interacting with the `/ui/presentations` endpoint and handling user authentication via QR codes.

## Steps

### 1. Initialize Transaction
- The system initializes an authorization transaction using a predefined configuration.
- This configuration defines the required attestations and constructs the request body accordingly.
- The constructed request body is sent to the `/ui/presentations` endpoint via the proxy.
- The response contains transaction information, confirming the transaction's initialization.

### 2. Generate QR Code for Authentication
- Using the `client_id` and `request_uri` from the response, a URI is created.
- The URI is encoded into a QR code.
- On mobile devices, a button is displayed for initiating authentication.

### 3. Poll for Authorization Status
- The system immediately starts polling the `/ui/presentations/{transaction_id}` endpoint via the proxy.
- Polling continues for a maximum of 2 minutes, checking for user confirmation.

### 4. User Confirmation & Authentication Completion
- The user confirms the transaction in the EUDI Wallet application.
- If the user holds all required attestations, the authorization is marked as complete.
- The user is redirected to the original website upon successful authentication.

## Security Considerations
- **Polling Timeout**: The system enforces a 2-minute timeout to prevent indefinite polling.
- **QR Code Encoding**: The authentication URI is securely encoded to avoid manipulation.
- **Proxy Handling**: Requests pass through a secure proxy to prevent direct exposure of backend endpoints.

## Conclusion
This process ensures secure and efficient user authentication using the EUDI Wallet, minimizing security risks while maintaining a seamless user experience.
