---
icon: server
---

# Proxy

## Overview

This document explains the functionality of two PHP files that implement a proxy system. The proxy is designed to securely forward HTTP requests while enforcing access control policies and preventing security vulnerabilities such as SSRF (Server-Side Request Forgery).

## File 1: `redirect.php`

### Purpose
This script acts as an HTTP proxy, forwarding client requests to backend services while enforcing security policies. It ensures that only allowed origins can access the proxy and prevents unauthorized access to internal network resources.

### Key Features
- **CORS Handling**: Implements Cross-Origin Resource Sharing (CORS) to control which origins can access the proxy.
- **Request Forwarding**: Extracts the target URL from the request and forwards it using cURL.
- **SSRF Protection**: Checks if the target URL resolves to an internal IP and blocks such requests.
- **Error Handling**: Ensures invalid requests return appropriate HTTP error codes and messages.
- **Security Enhancements**: Prevents XSS attacks by sanitizing output data.

## File 2: `proxy.php`

### Purpose
This file defines the `Proxy` class, which manages the allowed proxy endpoints and retrieves the appropriate target URL for forwarding.

### Key Features
- **Configuration Loading**: Reads allowed proxy target mappings from a JSON file.
- **Validation**: Ensures that only predefined paths are accessible through the proxy.
- **URL Resolution**: Matches incoming request paths to valid target URLs.

## Security Considerations
- **CORS Restrictions**: Only specific origins can access the proxy to prevent unauthorized cross-origin requests.
- **SSRF Mitigation**: Internal and reserved IP addresses are blocked from being accessed via the proxy.
- **Input Sanitization**: Ensures only valid JSON and URLs are processed, reducing the risk of injection attacks.

## Conclusion
These PHP scripts work together to provide a secure proxy mechanism for forwarding requests to predefined backend services. The implementation follows best security practices to mitigate common web vulnerabilities while ensuring flexibility in handling API requests.

