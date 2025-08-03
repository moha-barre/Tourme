# 🏆 Tourme - Tournament Hosting Platform

A modern, real-time tournament hosting platform built with React, TypeScript, and Supabase. Create, manage, and participate in tournaments with automatic bracket generation and live updates.

## ✨ Features

- **Tournament Creation**: Create tournaments with custom settings, participant limits, and bracket types
- **Participant Management**: Accept/reject participants, manage teams, handle withdrawals
- **Auto-Generated Brackets**: Single elimination brackets with proper seeding
- **Real-time Updates**: Live tournament updates via Supabase subscriptions
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Authentication**: Secure user registration and login
- **Admin Controls**: Tournament management for administrators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Tourme
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  game_type TEXT NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'full', 'in_progress', 'completed')),
  bracket_type TEXT NOT NULL CHECK (bracket_type IN ('single_elimination', 'double_elimination', 'round_robin')),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
);

-- Create participants table
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  team_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id),
  UNIQUE(tournament_id, display_name)
);

-- Create matches table
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  score1 INTEGER,
  score2 INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_admin_id ON tournaments(admin_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_participants_tournament_id ON participants(tournament_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Tournament admins can update their tournaments" ON tournaments
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Anyone can view participants" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join tournaments" ON participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave tournaments" ON participants
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Tournament admins can manage matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = matches.tournament_id 
      AND tournaments.admin_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
Tourme/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx      # Main layout with navigation
│   │   └── BracketView.tsx # Tournament bracket visualization
│   ├── lib/                # Utility functions and configurations
│   │   ├── supabase.ts     # Supabase client and types
│   │   ├── store.ts        # Zustand state management
│   │   ├── utils.ts        # Utility functions
│   │   └── bracket-generator.ts # Bracket generation algorithm
│   ├── routes/             # Page components
│   │   ├── home.tsx        # Home page
│   │   ├── auth/           # Authentication pages
│   │   └── tournaments/    # Tournament-related pages
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🎯 Core Features

### Tournament Management
- Create tournaments with custom settings
- Set participant limits and bracket types
- Manage tournament status (draft, open, full, in progress, completed)

### Participant System
- Join tournaments individually or as teams
- Admin approval/rejection system
- Participant withdrawal functionality

### Bracket Generation
- Automatic single elimination bracket generation
- Proper seeding to ensure fair matchups
- Support for different bracket sizes (4, 8, 16, 32, 64 players)

### Real-time Updates
- Live tournament updates via Supabase subscriptions
- Real-time participant and match status changes

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: React Router v7
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports static sites:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/tourme/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🎉 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [React Router](https://reactrouter.com) for routing
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Zustand](https://zustand-demo.pmnd.rs) for state management
