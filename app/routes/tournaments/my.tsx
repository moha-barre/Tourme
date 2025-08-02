import { useEffect, useState } from 'react'
import { useAuthStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router'

export default function MyTournamentsPage() {
  const { user } = useAuthStore()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchTournaments() {
      setLoading(true)
      
      // Tournaments where user is admin
      const { data: adminTournaments } = await supabase
        .from('tournaments')
        .select('*')
        .eq('admin_id', user.id)

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

      setTournaments(uniqueTournaments)
      setLoading(false)
    }

    fetchTournaments()
  }, [user])

  if (!user) {
    return <div className="p-4">Please sign in to view your tournaments.</div>
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Tournaments</h1>
      {tournaments.length === 0 ? (
        <p>You are not participating in or managing any tournaments yet.</p>
      ) : (
        <ul className="space-y-2">
          {tournaments.map(t => (
            <li key={t.id}>
              <Link to={`/tournaments/${t.id}`} className="text-blue-600 hover:underline">
                {t.name}
              </Link>
              {t.admin_id === user.id && (
                <span className="ml-2 text-xs text-green-600">(Admin)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}