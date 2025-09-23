# BeYou - E-commerce Platform

A Next.js-based e-commerce platform with MySQL database.

## Getting Started

First, set up the project:

### Database Setup

The project uses MySQL for data storage. Database migrations are managed through SQL files in the `src/db/migrations` folder.

```bash
npm install
```

## Database Migration

### Local Development
```bash
npm run migrate
```

### Production Server
```bash
npm run migrate:server
```

### Manual Migration
If automated migration fails, you can run the SQL files manually:
1. Connect to your MySQL server
2. Run the files in `src/db/migrations/` in numerical order

## Run the Project
```bash
npm run dev
```

## Admin Credentials
Email: admin@beyou.com
Password: Admin@123

## Server Deployment

### After Git Pull - Complete Server Rebuild Process

When you pull the latest changes to your production server, follow these steps:

1. **Pull the latest changes**:

```bash
git pull origin main
```

2. **Install/Update dependencies**:

```bash
npm install
```

3. **Run database migrations** (if any new migrations):

```bash
npm run migrate:server
```

4. **Build the production application**:

```bash
npm run build
```

5. **Restart the application**:

```bash
# If using PM2
pm2 restart beyou
# OR if using systemctl
sudo systemctl restart beyou
# OR if running directly
npm start
```

### Quick Server Update (One-liner)

For convenience, you can run all steps at once:

```bash
git pull origin feature/new_latest_migration_mysql && npm install && npm run migrate:server && npm run build && pm2 restart beyou
```

### Git Authentication Setup (First time only)

If using a GitHub token instead of SSH keys:

```bash
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/sheikhjebran/beyou.git
git config --global --add safe.directory /var/www/beyou
```

### Environment Variables

Make sure your server has the correct environment variables in `.env.production`:

```bash
MYSQL_HOST=127.0.0.1
MYSQL_USER=ayesha
MYSQL_PASSWORD=ayesha@beyou
MYSQL_DATABASE=beyou_db
JWT_SECRET=your_production_jwt_secret_here
NODE_ENV=production
```

### Admin Management on Server

To reset admin credentials on the server:

```bash
npm run admin:reset-server
```

### Troubleshooting

- If build fails, check for TypeScript errors: `npx tsc --noEmit`
- If database connection fails, verify environment variables and database access
- Check server logs: `pm2 logs beyou` (if using PM2)
