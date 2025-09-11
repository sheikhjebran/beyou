# Database Migration Guide: Local to Server

This guide will help you migrate your local BeYou database to your production server.

## Overview
Your local database contains:
- 1 admin user
- 1 regular user  
- 1 product with 2 images
- 2 banners
- 6 category images
- 2 sales records

## Migration Files Created
1. `005_add_admin_users_table.sql` - Creates the admin_users table
2. `006_seed_initial_data.sql` - Migrates all your local data

## Step-by-Step Migration Process

### Step 1: Transfer Image Files
You need to copy the entire `public/uploads` directory to your server. The following files are referenced in your database and MUST be transferred:

**Product Images:**
- `/uploads/products/5244c145-8dd7-4cfa-adab-f3217c063d81.jpg`
- `/uploads/products/3b3151e4-0a9f-4410-9173-a9d0926f24e0.jpg`

**Banner Images:**
- `/uploads/banners/329ecd60-02cd-47e8-a145-a2aac9991d94/655ba29b-3e0c-4e98-826d-3f2479fb2dd1.jpg`
- `/uploads/banners/88fead77-c7e0-4b87-93f5-4dd0bfdd622c/d35ca5a2-71a1-4250-b443-1ac14b364154.jpg`

**Category Images:**
- `/uploads/categories/other/25603c1b-ad5d-4a75-9cde-837825b69223.jpeg`
- `/uploads/categories/nails/a117ac4d-34ca-4b08-a288-58ce74b75eaa.jpg`
- `/uploads/categories/brands/a570b00f-0d43-404f-965c-5398ae52871a.jpg`
- `/uploads/categories/exciting-combos/15c74661-ae92-4e4e-abd9-5eab8555588f.jpg`
- `/uploads/categories/custom-prints/722dce15-d253-4310-b353-1196b118d895.jpg`
- `/uploads/categories/k-beauty/26c66a9c-40ca-4b9b-a232-8a9349154f20.jpg`

### Step 2: Deploy Code to Server
1. Push your code changes to your repository
2. Pull the latest changes on your server
3. Make sure the new migration files are present on the server

### Step 3: Run Database Migrations
On your server, run:
```bash
npm run migrate:server
```

This will execute the new migrations (005 and 006) which will:
- Create the admin_users table
- Insert all your local data into the production database

### Step 4: Verify Migration Success
After running migrations, verify that:
1. All tables have the expected data
2. Images are accessible through the web interface
3. You can log in with your admin credentials
4. Products, categories, and banners display correctly

## Login Credentials After Migration
- **Admin User**: admin@beyou.com
- **Regular User**: jebran@beyou.com  
- **Password**: (Your existing password - stored as bcrypt hash)

## File Transfer Commands
If you're using SCP or similar:
```bash
# Copy entire uploads directory
scp -r public/uploads/ user@your-server:/path/to/your/app/public/

# Or using rsync
rsync -av public/uploads/ user@your-server:/path/to/your/app/public/uploads/
```

## Environment Variables
Make sure your server has the correct database configuration in `.env.production`:
- MYSQL_HOST
- MYSQL_USER  
- MYSQL_PASSWORD
- MYSQL_DATABASE

## Troubleshooting
- If migration fails, check the error logs
- Verify database credentials are correct
- Ensure image file permissions are set correctly (readable by web server)
- Check that all image paths in database match actual file locations on server

## What's Been Migrated
✅ Database Schema (all tables)
✅ Admin Users (1 record)
✅ Users (1 record)
✅ Products (1 record)
✅ Product Images (2 records)
✅ Banners (2 records)
✅ Category Images (6 records)
✅ Sales Records (2 records)

Your local database is now ready to be replicated on your production server!