# warp : [box]

A Cloudflare Worker-powered URL shortener with Elysia.js and a retro 8-bit aesthetic.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hexadecimal233/warp-box)

## Features

- 🎮 Retro 8-bit aesthetic design using NES.css
- 🔗 Simple URL shortening with custom keys
- 📊 Comprehensive analytics (hits, referrers, creation date)
- 🔐 Optional password protection
- ⚡ Built on Cloudflare Workers for global performance
- 💾 Cloudflare KV for persistent storage

## Getting Started

### Installation

1. Clone this repository:
```bash
git clone https://github.com/hexadecimal233/warp-box.git
cd warp-box
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your preferences:
```
TITLE=Your App Title
PASSWORD=your_password # Leave empty for no password
```

4. Create a KV namespace in Cloudflare:
```bash
wrangler kv:namespace create "LINKS"
```

Update the `wrangler.toml` file with your KV namespace ID.

### Development

Run the development server:
```bash
bun run dev
```

### Deployment

Deploy to Cloudflare Workers:
```bash
bun run deploy
```
