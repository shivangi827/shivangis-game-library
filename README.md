# Shivangi's Game Library

I'm a Software Engineer who enjoys gaming and is recently into making quick web games.

Check it out here: https://shivangis-game-library.onrender.com/

## Games

| Game | Type | Players |
|------|------|---------|
| **Imposter** | Word bluffing party game | 3-8 |
| **Vibe Check** | Rate prompts, match the group vibe | 2-10 |
| **Never Have I Ever** | Confess or stay innocent | 2-10 |
| **Zombie Survival** | Majority-vote survival horror | 4-10 |
| **Gramble** | Timed word unscramble | Single player |
| **Bounty of the Lost** | Daily dungeon grid explorer | Single player |

## Development

```bash
npm install

# Build everything
npm run build

# Build server only
npm run build:server

# Build a specific game client
npm run build:imposter
npm run build:vibe-check
npm run build:never-have-i-ever
npm run build:zombie-survival
npm run build:word-scramble
npm run build:bounty-of-the-lost

# Build all clients
npm run build:clients

# Start the server
npm start

# Dev mode (watch + auto-reload)
npm run dev
```

## Environment Variables (optional)

| Variable | Purpose |
|----------|---------|
| `TURSO_DATABASE_URL` | Turso SQLite database URL for persistent leaderboards & feedback |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `RESEND_API_KEY` | Resend API key for feedback email notifications |

---

Made with love by Shivangi
