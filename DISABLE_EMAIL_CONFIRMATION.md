# Disable Email Confirmation in Supabase

To allow users to log in immediately after signing up without email confirmation, you need to disable email confirmation in your Supabase project settings.

## Steps to Disable Email Confirmation

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers** tab
   - Find **Email** provider

3. **Disable Email Confirmation**
   - Under **Email** provider settings
   - Find **"Confirm email"** toggle
   - **Turn it OFF** (disable it)
   - Click **Save**

4. **Alternative: Disable in Auth Settings**
   - Go to **Authentication** → **Settings**
   - Scroll to **"Email Auth"** section
   - Find **"Enable email confirmations"**
   - **Uncheck** this option
   - Click **Save**

## What This Does

- Users can sign up and immediately sign in without checking their email
- No confirmation email will be sent
- Users are automatically authenticated after signup
- Better user experience for development and testing

## Important Notes

- **For Production**: Consider keeping email confirmation enabled for security
- **For Development**: Disabling is fine for faster testing
- Users can still reset passwords if needed
- OAuth providers (Google) are not affected by this setting

## Testing

After disabling email confirmation:
1. Sign up a new user
2. They should be automatically signed in
3. No email confirmation required
4. User can immediately access their account

