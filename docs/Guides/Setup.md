---
icon: gear
---

# Setup

The following steps will help you get started.

## Step 1: Clone the repository

```bash
git clone https://github.com/DMG-TechLabs/eudi-login.git
```

## Step 2: Start the application

```bash
cd eudi-login
make start
```

>[!NOTE]
>If there is onether service running on port 80, 443, 8080, 8443 you need to stop it first or change the ports in the `docker-compose.yml` file.

If you have not installed the `make` tool on your system, you can use the following command:

```bash
docker compose up -d
```

## Step 3: Open the demo application in your browser

Open your browser and navigate to `http://localhost:80`.
(No custom configuration needed)

## Stop the application

```bash
make stop
```

If you have started the application using Docker Compose command, you can also use the following command:

```bash
docker compose down
```

# Logic of this setup

This setup is based on the following principles:

- The application is hosted on a Docker container.
- The demo application is configured to run on port localhost:80.
- The backend is configured to run on port localhost:8080.
- The demo application and backend are configured to start using the docker-compose.yml file.

The `Makefile` file is used to define the commands for starting and stopping the application.
The `docker-compose.yml` file is used to define the services that are part of the application.
The `retype.yml` file is used to define the documentation for the application.

The Demo application which resembles a banking application is usind the [EUDI Wallet]() for authenticating the user.
This is achived by using the [EUDI SDK]() which is a JavaScript library that allows you to integrate the EUDI Wallet into your application.
The Backend is responsible for handling the authentication process and returning the user data to the Demo application.
