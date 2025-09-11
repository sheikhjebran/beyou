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