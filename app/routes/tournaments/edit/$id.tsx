import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useAuthStore } from '../../../lib/store'
import { supabase } from '../../../lib/supabase'
import type { Database } from '../../../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']

export default function EditTournamentPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_type: '',
    max_participants: 8,
    bracket_type: 'single_elimination' as const,
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    if (id) {
      fetchTournament()
    }
  }, [id])

  const fetchTournament = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      setTournament(data)
      setFormData({
        name: data.name,
        description: data.description,
        game_type: data.game_type,
        max_participants: data.max_participants,
        bracket_type: data.bracket_type,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournament) return

    try {
      setSaving(true)
      setError('')
      
      const { error } = await supabase
        .from('tournaments')
        .update({
          name: formData.name,
          description: formData.description,
          game_type: formData.game_type,
          max_participants: formData.max_participants,
          bracket_type: formData.bracket_type,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .eq('id', id)
      
      if (error) throw error
      
      navigate(`/tournaments/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tournament')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value) : value
    }))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tournament not found</h1>
        <p className="text-gray-600 mb-6">{error || 'The tournament you are looking for does not exist.'}</p>
        <Link
          to="/tournaments"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Tournaments
        </Link>
      </div>
    )
  }

  // Check if user is admin
  if (tournament.admin_id !== user?.id) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to edit this tournament.</p>
        <Link
          to={`/tournaments/${id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          View Tournament
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Tournament</h1>
            <p className="mt-2 text-gray-600">
              Update tournament details and settings
            </p>
          </div>
          <Link
            to={`/tournaments/${id}`}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tournament Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tournament name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your tournament..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="game_type" className="block text-sm font-medium text-gray-700">
              Game Type *
            </label>
            <input
              type="text"
              id="game_type"
              name="game_type"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Chess, League of Legends, Tennis"
              value={formData.game_type}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                Max Participants *
              </label>
              <select
                id="max_participants"
                name="max_participants"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <label htmlFor="bracket_type" className="block text-sm font-medium text-gray-700">
                Bracket Type *
              </label>
              <select
                id="bracket_type"
                name="bracket_type"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end space-x-4">
          <Link
            to={`/tournaments/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 