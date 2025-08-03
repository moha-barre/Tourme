import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore, useTournamentStore } from '../../lib/store'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardContent } from '../../components/Card'
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Tournament</h1>
            <p className="text-gray-600">Set up a new tournament and start inviting participants</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
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
                  />
                  <Input
                    label="Game Type *"
                    name="game_type"
                    placeholder="e.g., Chess, League of Legends, Tennis"
                    value={formData.game_type}
                    onChange={handleChange}
                    required
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/tournaments')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Tournament'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tournament Tips */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Choose the right bracket type for your game and number of participants</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Set realistic dates to give participants time to prepare</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>You can add participants after creating the tournament</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Start with a draft status and change to open when ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bracket Types Info */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bracket Types</h3>
              <div className="space-y-3 text-sm">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 