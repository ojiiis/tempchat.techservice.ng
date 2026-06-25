# TempChat

Temporary end-to-end encrypted browser chat.

TempChat is a privacy-focused web chat application that allows two users to communicate securely without creating accounts, installing apps, or storing messages permanently.

Website: https://tempchat.techservice.ng

---

## Features

- End-to-end encrypted messaging
- No user registration
- Temporary chat rooms
- Browser-based encryption
- RSA public/private key exchange
- AES session encryption
- Real-time communication
- Self-destructing conversations
- Open source

---

## How It Works

1. User A creates a room.
2. User B joins the room.
3. Both browsers generate RSA key pairs.
4. Public keys are exchanged.
5. An AES session key is securely exchanged.
6. Messages are encrypted in the browser.
7. The server only relays encrypted data.

The server never sees plaintext messages.

---

## Security Model

### Protected Against

- Server administrators reading messages.
- Database leaks.
- Message storage attacks.
- Network interception.

### Not Protected Against

- Compromised devices.
- Malware.
- Browser extensions.
- Screenshots taken by participants.
- Users sharing room links.

---

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript
- Web Crypto API

### Backend

- Node.js
- Express.js
- Server-Sent Events (SSE)

### Cryptography

- RSA-OAEP
- AES-GCM
- SubtleCrypto API

---

## Installation

Clone the repository:

```bash
git clone https://github.com/ojiiis/tempchat.techservice.ng.git
cd tempchat.techservice.ng
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

The application should now be running locally.

---

## Project Structure

```text
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── routes/
├── server.js
├── package.json
└── README.md
```

---

## Roadmap

### Planned Features

- Group chats
- Room expiration timer
- QR code room sharing
- Encrypted file sharing
- Password-protected rooms
- Dark mode
- Forward secrecy
- Mobile improvements

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Added new feature"
```

4. Push your branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

## Development Goals

TempChat aims to provide:

- Privacy by default
- Zero account requirements
- Browser-only encryption
- Simple and lightweight communication

---

## Disclaimer

TempChat is an experimental privacy project.

Although strong encryption techniques are used, the software has not yet undergone independent security audits. Do not rely on it for highly sensitive communications until it has been thoroughly reviewed.

---

## Author

Ojingiri Samuel

- Website: https://tempchat.techservice.ng
- GitHub: https://github.com/ojiiis

---

## License

MIT License

Copyright (c) 2026 Ojingiri Samuel

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to deal in the Software without restriction.
