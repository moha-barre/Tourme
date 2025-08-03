import { useEffect } from 'react'
import { Link } from 'react-router'
import { useAuthStore, useTournamentStore } from '../lib/store'
import { Trophy, Users, Calendar, ArrowRight } from 'lucide-react'
import { formatDate, getStatusColor } from '../lib/utils'
import { testDatabaseConnection, checkTables } from '../lib/db-test'

// Meta tags for the home page
export const meta = () => [
  { title: "Tourme - Host and Join Tournaments | Create Competitive Tournaments" },
  { name: "description", content: "Create competitive tournaments, manage brackets, and crown champions. Whether it's 1v1 or team-based, Tourme has you covered. Free tournament management platform." },
  { name: "robots", content: "index, follow" },
  { name: "author", content: "Tourme" },
  { name: "keywords", content: "tournament creation, bracket generator, competitive gaming, esports tournaments, sports tournaments, tournament management, free tournament platform" },
  { name: "language", content: "en" },
  { name: "google-site-verification", content: "WdnT6pwogkSSvv8-uE3E8YpEUcuiwg1I3CH-I9dC3qQ" },
  
  // Open Graph tags
  { property: "og:title", content: "Tourme - Host and Join Tournaments | Create Competitive Tournaments" },
  { property: "og:description", content: "Create competitive tournaments, manage brackets, and crown champions. Whether it's 1v1 or team-based, Tourme has you covered. Free tournament management platform." },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Tourme" },
  { property: "og:locale", content: "en_US" },
  { property: "og:url", content: "https://yourdomain.com" },
  { property: "og:image", content: "https://yourdomain.com/images/tourme-og-image.jpg" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: "Tourme - Tournament Management Platform" },
  
  // Twitter Card tags
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Tourme - Host and Join Tournaments | Create Competitive Tournaments" },
  { name: "twitter:description", content: "Create competitive tournaments, manage brackets, and crown champions. Whether it's 1v1 or team-based, Tourme has you covered." },
  { name: "twitter:site", content: "@tourme" },
  { name: "twitter:creator", content: "@tourme" },
  { name: "twitter:image", content: "https://yourdomain.com/images/tourme-twitter-image.jpg" },
  { name: "twitter:image:alt", content: "Tourme - Tournament Management Platform" },
  
  // Additional SEO tags
  { name: "theme-color", content: "#2563eb" },
  { name: "msapplication-TileColor", content: "#2563eb" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  { name: "apple-mobile-web-app-title", content: "Tourme" },
  
  // Canonical URL
  { rel: "canonical", href: "https://yourdomain.com" },
  
  // Structured Data (JSON-LD)
  { 
    type: "application/ld+json",
    content: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Tourme",
      "description": "Create and manage tournaments with automatic bracket generation, participant management, and real-time updates.",
      "url": "https://yourdomain.com",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Tourme"
      }
    })
  }
];

export default function HomePage() {
  const { user } = useAuthStore()
  const { tournaments, loading, fetchTournaments } = useTournamentStore()

  useEffect(() => {
    // Test database connection first
    testDatabaseConnection().then((success) => {
      if (success) {
        checkTables()
        fetchTournaments()
      }
    })
  }, [])

  const featuredTournaments = tournaments.slice(0, 6)

  return (
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Host and Join
            <span className="text-blue-600"> Tournaments</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create competitive tournaments, manage brackets, and crown champions. 
            Whether it's 1v1 or team-based, Tourme has you covered.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {user ? (
              <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                <Link
                  to="/tournaments/create"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Create Tournament
                </Link>
                <Link
                  to="/tournaments"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                >
                  Browse Tournaments
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                <Link
                  to="/auth/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
                <Link
                  to="/auth/signin"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for tournament management
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Tournament Creation</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Create tournaments with custom settings, participant limits, and bracket types.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Participant Management</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Accept or reject participants, manage teams, and handle withdrawals.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Auto-Generated Brackets</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Automatic bracket generation with proper seeding and real-time updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Tournaments */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Featured Tournaments</h2>
              <Link
                to="/tournaments"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    to={`/tournaments/${tournament.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {tournament.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                        {tournament.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tournament.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{tournament.game_type}</span>
                      <span>{tournament.current_participants}/{tournament.max_participants} players</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Created {formatDate(tournament.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && featuredTournaments.length === 0 && (
              <div className="mt-6 text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tournaments yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to create a tournament!
                </p>
                {user && (
                  <div className="mt-6">
                    <Link
                      to="/tournaments/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Tournament
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  )
} 