import { supabase } from './supabase'

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return false
    }
    
    console.log('Database connection successful!')
    return true
  } catch (error) {
    console.error('Database test failed:', error)
    return false
  }
}

export async function checkTables() {
  const tables = ['profiles', 'tournaments', 'participants', 'matches']
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`Table ${table} error:`, error)
      } else {
        console.log(`Table ${table} exists and accessible`)
      }
    } catch (error) {
      console.error(`Table ${table} test failed:`, error)
    }
  }
} 