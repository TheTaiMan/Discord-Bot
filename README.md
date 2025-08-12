# Discord Bot with Email Webhooks Setup Guide

This Discord bot integrates with Brevo (formerly Sendinblue) to send emails and handle email bounce notifications through webhooks.

## What This Bot Does

- **Email Integration**: Sends emails through Brevo's SMTP API
- **Bounce Handling**: Receives webhook notifications when emails bounce, fail, or are delivered
- **Discord Integration**: Notifies users in Discord when their emails fail to deliver

## Components Overview

### 1. Discord Bot
- Runs on Google Cloud VM
- Handles Discord interactions and commands
- Sends emails via Brevo API
- Processes webhook notifications

### 2. Brevo Email Service
- SMTP API for sending emails
- Webhook system for delivery status notifications
- IP address whitelist for security

### 3. Nginx Reverse Proxy
- Routes external webhook requests to your bot
- Provides SSL/HTTPS termination
- Forwards `https://webhook.thetaiman.xyz` to `localhost:3000`

### 4. Domain & DNS
- Subdomain: `webhook.thetaiman.xyz`
- Points to Google Cloud VM IP address
- Provides permanent webhook endpoint (no more ngrok!)

## Initial Setup

### 1. Brevo Account Setup
1. Create account at [Brevo](https://www.brevo.com)
2. Go to **SMTP & API** section
3. Generate an **API Key** (save this for your `.env` file)
4. Go to **Security → Authorized IPs**
5. Add your Google Cloud VM IP address: `35.202.106.180`

### 2. Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to **Bot** section
4. Copy the **Bot Token** (save this for your `.env` file)
5. Enable necessary intents (Guild Members, Message Content, etc.)

### 3. Google Cloud VM Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/discord-bot.git
cd discord-bot

# Install dependencies
npm install

# Create environment file
nano .env
```

### 4. Environment Variables (.env)
```env
DISCORD_TOKEN=your_discord_bot_token_here
BREVO_API_KEY=your_brevo_api_key_here
PORT=3000
```

### 5. Domain & Nginx Setup
```bash
# Install nginx and SSL tools
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Create nginx configuration
sudo nano /etc/nginx/sites-available/webhook

# Add the nginx config (see below)
# Enable the site
sudo ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d webhook.thetaiman.xyz
```

**Nginx Configuration** (`/etc/nginx/sites-available/webhook`):
```nginx
server {
    listen 80;
    server_name webhook.thetaiman.xyz;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Running the Bot

### Start the Bot
```bash
# Install PM2 for background process management
sudo npm install -g pm2

# Start the bot
pm2 start src/index.js --name discord-bot

# Enable auto-start on reboot
pm2 startup
pm2 save
```

### Useful PM2 Commands
```bash
pm2 status              # Check bot status
pm2 logs discord-bot     # View live logs
pm2 restart discord-bot  # Restart the bot
pm2 stop discord-bot     # Stop the bot
```

## Bot Commands

### Setup Command (Admin Only)
```
/setup-onboarding
```
- Sets up the onboarding system in the current channel
- Creates buttons for new member registration
- Only server administrators can use this command

### How Members Use the Bot
1. New members click the "Start Onboarding" button
2. Bot sends them a DM with email verification form
3. Members fill out their email address
4. Bot sends verification email through Brevo
5. Members verify their email to complete onboarding

## Email Bounce Handling

### Why We Need Webhooks
When emails bounce or fail to deliver:
- **Without webhooks**: You never know if emails failed
- **With webhooks**: Bot automatically detects failures and can retry or notify users

### How It Works
1. Bot sends email via Brevo API
2. If email bounces/fails, Brevo sends webhook to: `https://webhook.thetaiman.xyz/brevo-webhook`
3. Nginx forwards webhook to bot on `localhost:3000`
4. Bot processes the bounce notification
5. Bot can notify the Discord user about the failed email

### Webhook Events Handled
- `hard_bounce`: Permanent delivery failure
- `invalid_email`: Email address doesn't exist
- `blocked`: Email was blocked by recipient
- `error`: General delivery error
- `delivered`: Successful delivery (for logging)

## Maintenance & Updates

### Updating the Bot
```bash
cd ~/discord-bot
git pull origin main
npm install
pm2 restart discord-bot
```

### Changing Discord Token
1. Update token in Discord Developer Portal
2. Update `.env` file on the server
3. Restart the bot: `pm2 restart discord-bot`

### Changing Brevo API Key
1. Generate new key in Brevo dashboard
2. Update `.env` file on the server
3. Restart the bot: `pm2 restart discord-bot`

### SSL Certificate Renewal
```bash
# Certbot auto-renews, but you can manually renew:
sudo certbot renew
```

### Checking Logs
```bash
# Bot logs
pm2 logs discord-bot

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### IP Address Changes
If your VM IP changes:
1. Update DNS A record: `webhook.thetaiman.xyz → new_ip`
2. Update authorized IP in Brevo dashboard
3. Wait for DNS propagation (up to 24 hours)

## Troubleshooting

### Bot Not Responding
```bash
pm2 status           # Check if running
pm2 logs discord-bot # Check for errors
pm2 restart discord-bot # Restart if needed
```

### Webhooks Not Working
```bash
# Test webhook endpoint
curl -X POST https://webhook.thetaiman.xyz/brevo-webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "email": "test@example.com"}'

# Should return "OK"
```

### Email Sending Issues
1. Check Brevo API key is correct
2. Verify IP address is authorized in Brevo
3. Check bot logs for error details

### Domain/DNS Issues
```bash
# Test DNS resolution
nslookup webhook.thetaiman.xyz

# Should return your VM's IP address
```

## Security Notes

- Never commit `.env` file to git (already in `.gitignore`)
- Keep Discord bot token secure
- Keep Brevo API key secure
- Regularly update packages: `npm audit fix`
- Monitor authorized IPs in Brevo dashboard

## File Structure
```
discord-bot/
├── src/
│   ├── index.js          # Main bot file
│   ├── events/           # Discord event handlers
│   ├── commands/         # Discord slash commands
│   └── UserManager.js    # User data management
├── .env                  # Environment variables (not in git)
├── package.json          # Node.js dependencies
└── SETUP.md             # This documentation
```