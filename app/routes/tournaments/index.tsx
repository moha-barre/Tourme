import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuthStore, useTournamentStore } from '../../lib/store'
import { formatDate, getStatusColor } from '../../lib/utils'

// Meta tags for the tournaments page
export const meta = () => [
  { title: "Browse Tournaments | Tourme - Find and Join Competitive Tournaments" },
  { name: "description", content: "Browse and join tournaments across all games and sports. Filter by status, game type, and search for tournaments that match your interests. Create your own tournament today." },
  { name: "robots", content: "index, follow" },
  { name: "author", content: "Tourme" },
  { name: "keywords", content: "browse tournaments, join tournaments, competitive gaming, esports tournaments, sports tournaments, tournament search, find tournaments" },
  { name: "language", content: "en" },
  { name: "google-site-verification", content: "WdnT6pwogkSSvv8-uE3E8YpEUcuiwg1I3CH-I9dC3qQ" },
  
  // Open Graph tags
  { property: "og:title", content: "Browse Tournaments | Tourme - Find and Join Competitive Tournaments" },
  { property: "og:description", content: "Browse and join tournaments across all games and sports. Filter by status, game type, and search for tournaments that match your interests." },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Tourme" },
  { property: "og:locale", content: "en_US" },
  { property: "og:url", content: "https://yourdomain.com/tournaments" },
  { property: "og:image", content: "https://yourdomain.com/images/tournaments-og-image.jpg" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: "Browse Tournaments on Tourme" },
  
  // Twitter Card tags
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Browse Tournaments | Tourme - Find and Join Competitive Tournaments" },
  { name: "twitter:description", content: "Browse and join tournaments across all games and sports. Filter by status, game type, and search for tournaments that match your interests." },
  { name: "twitter:site", content: "@tourme" },
  { name: "twitter:creator", content: "@tourme" },
  { name: "twitter:image", content: "https://yourdomain.com/images/tournaments-twitter-image.jpg" },
  { name: "twitter:image:alt", content: "Browse Tournaments on Tourme" },
  
  // Additional SEO tags
  { name: "theme-color", content: "#2563eb" },
  { name: "msapplication-TileColor", content: "#2563eb" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  { name: "apple-mobile-web-app-title", content: "Tourme Tournaments" },
  
  // Canonical URL
  { rel: "canonical", href: "https://yourdomain.com/tournaments" },
  
  // Structured Data (JSON-LD)
  { 
    type: "application/ld+json",
    content: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Tournaments",
      "description": "Browse and join tournaments across all games and sports",
      "url": "https://yourdomain.com/tournaments",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": []
      }
    })
  }
];

export default function TournamentsPage() {
  const { user } = useAuthStore()
  const { tournaments, loading, fetchTournaments } = useTournamentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gameTypeFilter, setGameTypeFilter] = useState('all')

  useEffect(() => {
    fetchTournaments()
  }, [])

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.game_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter
    const matchesGameType = gameTypeFilter === 'all' || tournament.game_type === gameTypeFilter
    
    return matchesSearch && matchesStatus && matchesGameType
  })

  const gameTypes = [...new Set(tournaments.map(t => t.game_type))]

  return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
              <p className="mt-2 text-gray-600">
                Browse and join tournaments or create your own
              </p>
            </div>
            {user && (
              <Link
                to="/tournaments/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Tournament
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search tournaments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="gameType" className="block text-sm font-medium text-gray-700 mb-1">
                Game Type
              </label>
              <select
                id="gameType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={gameTypeFilter}
                onChange={(e) => setGameTypeFilter(e.target.value)}
              >
                <option value="all">All Games</option>
                {gameTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament) => (
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">Game:</span>
                    <span>{tournament.game_type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">Players:</span>
                    <span>{tournament.current_participants}/{tournament.max_participants}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">Bracket:</span>
                    <span>{tournament.bracket_type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Created {formatDate(tournament.created_at)}</span>
                    {tournament.admin_id === user?.id && (
                      <span className="text-blue-600 font-medium">Admin</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || gameTypeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No tournaments have been created yet'}
            </p>
            {user && (
              <Link
                to="/tournaments/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create the first tournament
              </Link>
            )}
          </div>
        )}
      </div>
  )
} 