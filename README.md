# warp-box

A modern URL shortener built with [SvelteKit](https://kit.svelte.dev/) and [Cloudflare Workers](https://workers.cloudflare.com/).

## Features

- **URL Shortening**: Shorten long URLs with ease.
- **Custom Aliases**: Choose your own custom alias (e.g., `your.domain/my-link`) or let it generate a random one.
- **Expiration**: Set an expiration date/time for your links.
- **Burn After Reading**: Configure links to expire after a certain number of views.
- **Statistics**: Track views and referrers for your shortened links.
- **Secure**: Links are protected with a secret key for management/deletion.
- **Bot Protection**: Integrated with Cloudflare Turnstile.
- **Local History**: Your created links are saved locally in your browser for easy access.

## Deploy this to your site

1. Deploy to cloudflare workers: 

   [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hexadecimal233/warp-box)

2. Configure Cloudflare KV

   Create a KV namespace for storing links and update your bindings in the Cloudflare dashboard.


3. Configure Environment Variables

   Configure the following variables:

   - `PUBLIC_TITLE`: The title of your application.
   - `PASSWORD`: Optional password to protect link creation.
   - `PUBLIC_TURNSTILE_SITE_KEY`: Your Cloudflare Turnstile Site Key (optional).
   - `TURNSTILE_SECRET_KEY`: Your Cloudflare Turnstile Secret Key (optional).

   If you are using Cloudflare Turnstile, make sure to configure your site keys in your environment or code as needed.

