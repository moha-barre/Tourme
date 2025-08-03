# Database Migration Instructions

## Problem
The "Add Participants" feature is failing because the database schema hasn't been updated to support participants without user accounts.

## Solution
Apply the database migration to update the schema.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `simple_migration.sql`
4. Click "Run" to execute the migration

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push --file simple_migration.sql
```

### Option 3: Using psql (if you have direct database access)

```bash
psql -h your-db-host -U your-username -d your-database -f simple_migration.sql
```

## What the Migration Does

1. **Adds `display_name` column** to the participants table
2. **Makes `user_id` nullable** so participants don't need user accounts
3. **Updates existing participants** with display names
4. **Adds proper constraints** to prevent duplicate names
5. **Updates RLS policies** to allow tournament admins to manage participants

## Verification

After applying the migration, you should be able to:

1. Go to any tournament management page
2. Click "Add Participants"
3. Add participants by name without requiring user accounts
4. See the participants listed in the tournament

## Troubleshooting

If you still get errors after applying the migration:

1. **Check the browser console** for detailed error messages
2. **Verify the migration ran successfully** by checking if the `display_name` column exists
3. **Check RLS policies** to ensure tournament admins can insert participants
4. **Clear browser cache** and refresh the page

## Common Issues

### "Column display_name does not exist"
- The migration didn't run successfully
- Re-run the migration

### "Permission denied"
- RLS policies need to be updated
- Check if the user is the tournament admin

### "Unique constraint violation"
- Participant name already exists in the tournament
- Use a different name

## Support

If you continue to have issues, check the browser console for detailed error messages and ensure the migration has been applied correctly. 