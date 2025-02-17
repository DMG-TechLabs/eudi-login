# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added

- Same device login
- Warning user when no attestations are required
- Opening window on the side instead of new tab
- Better dialog

### Changed

- Load sdk from login page host (For demo only)


## [0.1.0] - 2025-02-17 

### Added

- Open Wallet logic and ui
- Docker image
- 1-1 proxy in php
- Uri decoding funtions
- Generating QR inside JS
- Loading attestations through the proxy
- Polling
- Decoding `vp_token`
- Response validation
- Retype docs site
- Demo in docker-compose
- Redirecting after authentication
- Login UI

### Changed

- Clean data presentation
- Using ES Modules

### Security

- Solved SSRF and XSS vulnerabilities in proxy


[0.1.0]: https://github.com/DMG-TechLabs/eudi-login/releases/tag/v0.1.0

