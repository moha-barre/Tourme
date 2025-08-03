import { useEffect, useState } from 'react'
import { useAuthStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router'
import { formatDate, getStatusColor } from '../../lib/utils'

type Tournament = {
  id: string
  name: string
  description: string
  game_type: string
  status: string
  admin_id: string
  created_at: string
  max_participants: number
  current_participants: number
  bracket_type: string
}

type Participant = {
  id: string
  tournament_id: string
  user_id: string
  status: string
  team_name?: string
  tournaments: Tournament
}

export default function MyTournamentsPage() {
  const { user } = useAuthStore()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'managing' | 'participating'>('all')

  useEffect(() => {
    if (!user) return

    async function fetchTournaments() {
      setLoading(true)
      
      try {
        // Tournaments where user is admin
        const { data: adminTournaments } = await supabase
          .from('tournaments')
          .select('*')
          .eq('admin_id', user?.id)
          .order('created_at', { ascending: false })

        // Tournaments where user is a participant
        const { data: participantRows } = await supabase
          .from('participants')
          .select('tournament_id, tournaments(*)')
          .eq('user_id', user?.id)

        const participantTournaments = participantRows?.map(r => r.tournaments).filter(Boolean) || []

        // Combine and deduplicate by id
        const allTournaments = [...(adminTournaments || []), ...participantTournaments]
        const uniqueTournaments = Object.values(
          allTournaments.reduce((acc: any, t: any) => {
            acc[t.id] = t
            return acc
          }, {})
        )

        setTournaments(uniqueTournaments as Tournament[])
      } catch (error) {
        console.error('Error fetching tournaments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [user])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
        <p className="text-gray-600 mb-6">You need to sign in to view your tournaments.</p>
        <Link
          to="/signin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    )
  }

  const managingTournaments = tournaments.filter(t => t.admin_id === user.id)
  const participatingTournaments = tournaments.filter(t => t.admin_id !== user.id)

  const filteredTournaments = filter === 'managing' 
    ? managingTournaments 
    : filter === 'participating' 
    ? participatingTournaments 
    : tournaments

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tournaments</h1>
        <p className="mt-2 text-gray-600">
          Manage your tournaments and view your participations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tournaments</p>
              <p className="text-2xl font-semibold text-gray-900">{tournaments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Managing</p>
              <p className="text-2xl font-semibold text-gray-900">{managingTournaments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Participating</p>
              <p className="text-2xl font-semibold text-gray-900">{participatingTournaments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({tournaments.length})
            </button>
            <button
              onClick={() => setFilter('managing')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'managing'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Managing ({managingTournaments.length})
            </button>
            <button
              onClick={() => setFilter('participating')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                filter === 'participating'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Participating ({participatingTournaments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'managing' 
              ? 'No tournaments managed yet'
              : filter === 'participating'
              ? 'No tournament participations yet'
              : 'No tournaments found'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'managing' 
              ? 'Create your first tournament to get started'
              : filter === 'participating'
              ? 'Join tournaments to see them here'
              : 'You haven\'t created or joined any tournaments yet'
            }
          </p>
          <Link
            to="/tournaments/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
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
                
                <div className="space-y-2 mb-4">
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
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>Created {formatDate(tournament.created_at)}</span>
                  {tournament.admin_id === user.id && (
                    <span className="text-blue-600 font-medium">Admin</span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-center rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    View
                  </Link>
                  {tournament.admin_id === user.id && (
                    <Link
                      to={`/tournaments/manage/${tournament.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-center rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Manage
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}