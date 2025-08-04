import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore, useTournamentStore } from '../../lib/store'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Trophy, Users, Calendar, Info } from 'lucide-react'

export default function CreateTournamentPage() {
  const { user } = useAuthStore()
  const { createTournament } = useTournamentStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_type: '',
    max_participants: 8,
    bracket_type: 'single_elimination' as const,
    start_date: '',
    end_date: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/signin')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const createdTournament = await createTournament({
        ...formData,
        admin_id: user.id,
        status: "draft",
        start_date: formData.start_date ? formData.start_date : undefined,
        end_date: formData.end_date ? formData.end_date : undefined,
      })
      navigate(`/tournaments/${createdTournament.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value) : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Tournament</h1>
                <p className="text-gray-600 text-lg">Set up a new tournament and start inviting participants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Tournament Details</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <div className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-red-500" />
                        <div className="text-sm font-medium text-red-700">{error}</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Tournament Name *"
                      name="name"
                      placeholder="Enter tournament name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      }
                    />
                    <Input
                      label="Game Type *"
                      name="game_type"
                      placeholder="e.g., Chess, Tennis, Football"
                      value={formData.game_type}
                      onChange={handleChange}
                      required
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Describe your tournament, rules, and any special requirements..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants *
                      </label>
                      <select
                        id="max_participants"
                        name="max_participants"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.max_participants}
                        onChange={handleChange}
                      >
                        <option value={4}>4 players</option>
                        <option value={8}>8 players</option>
                        <option value={16}>16 players</option>
                        <option value={32}>32 players</option>
                        <option value={64}>64 players</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="bracket_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Bracket Type *
                      </label>
                      <select
                        id="bracket_type"
                        name="bracket_type"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.bracket_type}
                        onChange={handleChange}
                      >
                        <option value="single_elimination">Single Elimination</option>
                        <option value="double_elimination">Double Elimination</option>
                        <option value="round_robin">Round Robin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Start Date"
                      name="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                    <Input
                      label="End Date"
                      name="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/tournaments')}
                      disabled={loading}
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      disabled={loading}
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      {loading ? 'Creating...' : 'Create Tournament'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tournament Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Tournament Tips</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Choose the right bracket type for your game and number of participants</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Set realistic dates to give participants time to prepare</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>You can add participants after creating the tournament</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Start with a draft status and change to open when ready</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bracket Types Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Bracket Types</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900">Single Elimination</h4>
                    <p className="text-gray-600">Players are eliminated after one loss. Fast and simple.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Double Elimination</h4>
                    <p className="text-gray-600">Players must lose twice to be eliminated. More competitive.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Round Robin</h4>
                    <p className="text-gray-600">Everyone plays everyone. Most comprehensive but longer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}