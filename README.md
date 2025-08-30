# Financial Tracker

A full-stack financial tracking application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Secure email/password authentication
- **Transaction Management**: Add, view, and categorize income and expenses
- **Financial Analytics**: Interactive charts showing spending patterns
- **Receipt OCR**: Upload receipts and automatically extract transaction data
- **Time-based Filtering**: View transactions within specific date ranges
- **Real-time Updates**: Instant synchronization across devices

## Setup Instructions

### 1. Database Setup

Run the following SQL commands in your Supabase SQL editor to set up the database schema:

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create receipts table for OCR processing
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default categories
INSERT INTO categories (name, type, color) VALUES
  ('Salary', 'income', '#10b981'),
  ('Freelance', 'income', '#06b6d4'),
  ('Investment', 'income', '#8b5cf6'),
  ('Food & Dining', 'expense', '#ef4444'),
  ('Transportation', 'expense', '#f59e0b'),
  ('Shopping', 'expense', '#ec4899'),
  ('Entertainment', 'expense', '#6366f1'),
  ('Bills & Utilities', 'expense', '#84cc16'),
  ('Healthcare', 'expense', '#f97316'),
  ('Education', 'expense', '#14b8a6');

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
```

### 2. Storage Setup

Create a storage bucket for receipts:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `receipts`
3. Set it to public access for uploaded files

### 3. Environment Variables

Make sure your Supabase environment variables are properly configured in your project settings.

## API Functions

The following Supabase Edge Functions are included:

- `create-transaction`: Handles transaction creation
- `process-receipt`: Processes uploaded receipts with OCR (currently using mock data)

Deploy these functions to your Supabase project for full functionality.

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Add Transactions**: Use the "Add Transaction" tab to record income and expenses
3. **View Analytics**: Check the "Overview" tab for visual insights into your spending
4. **Upload Receipts**: Use the "Receipt Upload" tab to automatically extract transaction data from receipts
5. **Filter Transactions**: Use date filters in the "Transactions" tab to view specific time periods

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Charts**: Recharts
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query

## Future Enhancements

- Integration with real OCR services (Google Vision API, AWS Textract)
- Bank account synchronization
- Budget tracking and alerts
- Export functionality
- Mobile responsive design improvements

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/e7101063-1baf-4eea-abd4-80af7261a628

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e7101063-1baf-4eea-abd4-80af7261a628) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e7101063-1baf-4eea-abd4-80af7261a628) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)