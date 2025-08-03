import { useState } from 'react'
import { X, UserPlus, Users, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

interface AddParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (participants: { display_name: string; team_name?: string }[]) => Promise<void>
  loading?: boolean
  maxParticipants?: number
  currentParticipants?: number
}

export function AddParticipantModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  maxParticipants = 16,
  currentParticipants = 0
}: AddParticipantModalProps) {
  const [participants, setParticipants] = useState<{ display_name: string; team_name?: string }[]>([
    { display_name: '', team_name: '' }
  ])
  const [error, setError] = useState('')

  const availableSlots = maxParticipants - currentParticipants

  const addParticipant = () => {
    if (participants.length < availableSlots) {
      setParticipants([...participants, { display_name: '', team_name: '' }])
    }
  }

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index))
    }
  }

  const updateParticipant = (index: number, field: 'display_name' | 'team_name', value: string) => {
    const updated = [...participants]
    updated[index] = { ...updated[index], [field]: value }
    setParticipants(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate participants
    const validParticipants = participants.filter(p => p.display_name.trim())
    
    if (validParticipants.length === 0) {
      setError('Please add at least one participant')
      return
    }

    if (validParticipants.length > availableSlots) {
      setError(`Cannot add more than ${availableSlots} participants`)
      return
    }

    // Check for duplicate names
    const names = validParticipants.map(p => p.display_name.trim().toLowerCase())
    const uniqueNames = new Set(names)
    if (names.length !== uniqueNames.size) {
      setError('Participant names must be unique')
      return
    }

    // Check for empty names
    const hasEmptyNames = validParticipants.some(p => !p.display_name.trim())
    if (hasEmptyNames) {
      setError('All participant names are required')
      return
    }

    try {
      await onSubmit(validParticipants)
      // Reset form
      setParticipants([{ display_name: '', team_name: '' }])
      onClose()
    } catch (err) {
      console.error('Error adding participants:', err)
      setError(err instanceof Error ? err.message : 'Failed to add participants')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Participants</h2>
              <p className="text-sm text-gray-600">
                {availableSlots} of {maxParticipants} slots available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div className="text-sm font-medium text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Add participants to your tournament. You can add multiple participants at once.
                Team names are optional and can be used for team-based tournaments.
              </p>
            </div>

            {/* Participants List */}
            <div className="space-y-6">
              {participants.map((participant, index) => (
                <div key={index} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <Input
                        label={`Participant ${index + 1} Name *`}
                        placeholder="Enter participant name (e.g., John Doe)"
                        value={participant.display_name}
                        onChange={(e) => updateParticipant(index, 'display_name', e.target.value)}
                        required
                        error={participant.display_name.trim() === '' && participants.length > 1 ? 'Name is required' : undefined}
                      />
                      <Input
                        label="Team Name (Optional)"
                        placeholder="Enter team name (e.g., Team Alpha)"
                        value={participant.team_name || ''}
                        onChange={(e) => updateParticipant(index, 'team_name', e.target.value)}
                      />
                    </div>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                        title="Remove participant"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Button */}
            {participants.length < availableSlots && (
              <button
                type="button"
                onClick={addParticipant}
                className="mt-6 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Add Another Participant</span>
                </div>
              </button>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Participants to add:</span>
                <span className="font-medium text-gray-900">
                  {participants.filter(p => p.display_name.trim()).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Available slots:</span>
                <span className="font-medium text-gray-900">{availableSlots}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || participants.filter(p => p.display_name.trim()).length === 0}
            >
              {loading ? 'Adding...' : `Add ${participants.filter(p => p.display_name.trim()).length} Participant${participants.filter(p => p.display_name.trim()).length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 