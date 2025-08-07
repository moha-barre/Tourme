import { useEffect } from 'react'
import { Link } from 'react-router'
import { useAuthStore, useTournamentStore } from '../lib/store'
import { Trophy, Users, Calendar, ArrowRight } from 'lucide-react'
import { formatDate, getStatusColor } from '../lib/utils'
import { testDatabaseConnection, checkTables } from '../lib/db-test'
import FeatureCard from '../components/FeatureCard'
import Step from '../components/Step'
import { FilePlus, Users2, LayoutGrid } from 'lucide-react'

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
    {/* Hero Section - More sophisticated gradient */}
    <div className="text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
          Tournament Management <span className="font-semibold text-blue-400">Perfected</span>
        </h1>
        <p className="mt-6 text-lg text-gray-300 md:text-xl">
          Professional-grade tools for competitive organizers. Streamline your events with precision scheduling, automated bracketing, and real-time analytics.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {user ? (
            <>
              <Link to="/tournaments/create" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                Create Tournament
              </Link>
              <Link to="/tournaments" className="px-8 py-3 bg-transparent border border-gray-400 hover:bg-gray-800 rounded-md font-medium transition-colors">
                Browse Events
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/signup" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                Start Free Trial
              </Link>
              <Link to="/auth/signin" className="px-8 py-3 bg-transparent border border-gray-400 hover:bg-gray-800 rounded-md font-medium transition-colors">
                Organizer Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Trust Indicators */}
    <div className="py-12 bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <p className="text-3xl font-light text-blue-600">10,000+</p>
          <p className="text-gray-600 mt-1">Tournaments Hosted</p>
        </div>
        <div>
          <p className="text-3xl font-light text-blue-600">500K+</p>
          <p className="text-gray-600 mt-1">Participants</p>
        </div>
        <div>
          <p className="text-3xl font-light text-blue-600">98%</p>
          <p className="text-gray-600 mt-1">Satisfaction Rate</p>
        </div>
        <div>
          <p className="text-3xl font-light text-blue-600">24/7</p>
          <p className="text-gray-600 mt-1">Support</p>
        </div>
      </div>
    </div>

    {/* Benefits Section - More structured */}
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900">Enterprise-Grade Tools for Competitive Organizers</h2>
          <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 leading-relaxed">
            Tourme provides the infrastructure serious organizers need to run flawless events at any scale, from local qualifiers to national championships.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-12">
          <div className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white">
                <Settings className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Advanced Configuration</h3>
              <p className="mt-2 text-gray-600">
                Customize every aspect of your tournament with granular control over rules, formats, and scoring systems.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white">
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Real-Time Analytics</h3>
              <p className="mt-2 text-gray-600">
                Monitor event metrics, participant performance, and engagement statistics from your dashboard.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Integrity Controls</h3>
              <p className="mt-2 text-gray-600">
                Anti-cheat measures, dispute resolution tools, and verification systems for competitive integrity.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Automation Engine</h3>
              <p className="mt-2 text-gray-600">
                Smart scheduling, auto-progression, and notification systems that eliminate manual work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section - Card-based */}
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900">Comprehensive Tournament Solutions</h2>
          <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto"></div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-blue-600">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Bracket Systems</h3>
            <p className="mt-2 text-gray-600">
              Single/double elimination, round robin, Swiss system, and hybrid formats with configurable rules.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Team Management</h3>
            <p className="mt-2 text-gray-600">
              Roster controls, substitution systems, and role-based access for coaches and staff.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-blue-600">
              <Monitor className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Broadcast Tools</h3>
            <p className="mt-2 text-gray-600">
              Stream integration, commentator access, and public/private viewing modes.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Stats/Achievements Section */}
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-12 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-light">Trusted by Premier Organizations</h2>
            <p className="mt-4 opacity-90">
              Tourme powers competitions for esports leagues, collegiate associations, and national governing bodies worldwide.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-90">
            <div>
              <p className="text-2xl font-light">50+</p>
              <p className="mt-1 text-sm">Collegiate Programs</p>
            </div>
            <div>
              <p className="text-2xl font-light">12</p>
              <p className="mt-1 text-sm">Esports Leagues</p>
            </div>
            <div>
              <p className="text-2xl font-light">5</p>
              <p className="mt-1 text-sm">National Federations</p>
            </div>
            <div>
              <p className="text-2xl font-light">100%</p>
              <p className="mt-1 text-sm">Uptime SLA</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* FAQ Section */}
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="mt-12 space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900">What types of tournaments can I host?</h3>
            <p className="mt-2 text-gray-600">
              Tourme supports all major competition formats including single/double elimination, round robin, Swiss system, and hybrid formats. We also support multi-stage tournaments with qualifiers and finals.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">How does pricing work?</h3>
            <p className="mt-2 text-gray-600">
              We offer tiered pricing based on features and participant volume. Basic tournaments are free, while premium features like advanced analytics and custom branding start at $29/month.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Can I integrate with other platforms?</h3>
            <p className="mt-2 text-gray-600">
              Yes, Tourme offers API access and pre-built integrations with streaming platforms, payment processors, and identity verification services.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Final CTA */}
    <div className="bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-light">Ready to elevate your tournaments?</h2>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
          Join thousands of organizers using Tourme to deliver professional competitive experiences.
        </p>
        <Link 
          to={user ? "/tournaments/create" : "/auth/signup"} 
          className="mt-8 inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
        >
          {user ? "Launch Tournament" : "Start Free Trial"}
        </Link>
        <p className="mt-4 text-sm text-gray-400">
          No credit card required • 14-day free trial
        </p>
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
  
);
}