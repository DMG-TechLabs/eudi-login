---
icon: rocket
---
# Getting Started

## Adding the EUDI SDK to your project

The EUDI SDK is a JavaScript library that allows you to integrate the EUDI Wallet into your application.
To use the SDK, you need to include the `eudi-sdk.js` file in your HTML file.

>[!NOTE]
> The SDK is temporarily hosted on GitHub. It will be moved to a CDN in the future.

```html
<script src="https://raw.githubusercontent.com/DMG-TechLabs/eudi-login/refs/heads/main/src/eudi-sdk.js"></script>
```

## Initializing the SDK

To use the SDK, you need to pass into the `EUDILogin` function (that is used to start the authentication process) the configuration options.

```javascript
EUDILogin(config, target);
```

>[!NOTE]
> The anonymous compatibility is only available for the `AgeOver18`, `PseudonymDeferred`, `PowerOfRepresentation` and `Reservation` attestations.

- `config`: An object containing the configuration options for the authentication process. The available options are:
  - `required`:
    - `AgeOver18`: Whether the user is over 18 years old.
    - `HealthID`: Whether to include Health ID attestation.
    - `IBAN`: Whether to include IBAN attestation.
    - `Loyalty`: Whether to include Loyalty attestation.
    - `mDL`: Whether to include mobile Driver’s License (mDL) attestation.
    - `MSISDN`: Whether to include MSISDN (phone number) attestation.
    - `PhotoId`: Whether to include Photo ID attestation.
    - `PID`: Whether to include Personal ID (PID) attestation.
    - `PowerOfRepresentation`: Whether to include Power of Representation attestation.
    - `PseudonymDeferred`: Whether to include Pseudonym Deferred attestation.
    - `Reservation`: Whether to include Reservation attestation.
    - `TaxNumber`: Whether to include Tax Number attestation.
  - `visibility`: Enum to define the level of visibility in the returned data after the authentication process. Available values are:
    - `Visibility.PUBLIC`: The returned data will include all available fields from the requested attestations.
    - `Visibility.ANONYMOUS_OPT`: The user can choose to not share their personal identifiable information.
    - `Visibility.ANONYMOUS`: The returned data will not include any personal identifiable information.
- `target`: (optional) The URL to redirect to after the authentication process. If not provided there will be no redirect.

## Handling the authentication result

After the authentication process is complete, the SDK will redirect to the specified `target` URL.
If the authentication process is successful, the URL will contain the user's data in the query parameters.
If the authentication process is cancelled or fails, the URL will contain an error message.

Possible values for the `event.data` property are:

- `"Missing attestations"`: The user did not provide all required attestations.
- `"Cancelled"`: The authentication process was cancelled.
- An object containing the user's data.


## Retrieving the user data

To retrieve the user data, you can use the `EUDILoadData` function.
This function returns a `Map` object that contains the user's data.

```javascript
const userData = EUDILoadData();
```

The `Map` object contains the following keys:

- `AgeOver18`: The user's age verified by the EUDI Wallet.
- `HealthID`: The user's Health ID.
- `IBAN`: The user's IBAN.
- `Loyalty`: The user's Loyalty card number.
- `mDL`: The user's mDL number.
- `MSISDN`: The user's MSISDN (phone number).
- `PhotoId`: The user's Photo ID.
- `PID`: The user's Personal ID.
- `PowerOfRepresentation`: The user's Power of Representation.
- `PseudonymDeferred`: The user's Pseudonym Deferred.
- `Reservation`: The user's Reservation.
- `TaxNumber`: The user's Tax Number.

## Example

Here's an example of how to use the SDK in a simple HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EUDI Login</title>
    <script src="https://raw.githubusercontent.com/DMG-TechLabs/eudi-login/refs/heads/main/src/eudi-sdk.js"></script>
</head>
<body>
    <button onclick="login()">Login with EUDI Wallet</button>

    <script>
        function login() {
            const config = {
                required: {
                    AgeOver18: true,
                    HealthID: false,
                    IBAN: false,
                    Loyalty: false,
                    mDL: false,
                    MSISDN: true,
                    PhotoId: true,
                    PID: true,
                    PowerOfRepresentation: true,
                    PseudonymDeferred: false,
                    Reservation: false,
                    TaxNumber: false
                },
                visibility: Visibility.PUBLIC
            };
            EUDILogin(config, "./homepage");
        }
    </script>
</body>
</html>
```

In this example, the user will be prompted to login with the EUDI Wallet.
After the authentication process is complete, the user will be redirected to `https://your-domain.com/homepage`.
