import { createClient } from '@supabase/supabase-js'

// Setlist.fm configuration
const SETLIST_API_KEY = 'JbLMSFy1YOqf-Z3xrGtYE76PFAbsPVGmcVy5'
const ARTIST_MBID = '640db492-34c4-47df-be14-96e2cd4b9fe4'  // Billy Strings MBID
const ARTIST_NAME = 'Billy Strings' // For validation

// Supabase configuration - using service role key for script
const supabaseUrl = 'https://vvloppwlgyshixnumlzy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bG9wcHdsZ3lzaGl4bnVtbHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTEzNzYwMCwiZXhwIjoyMDI0NzEzNjAwfQ.vR9FoQN4C1bFuFr6hxgVYQAH7XzZzRV7z9KS0TF5s0Q'

// Create Supabase client with specific configuration for script
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test connection before proceeding
async function testConnection() {
  try {
    const { data, error } = await supabase.from('concerts').select('count').limit(1)
    if (error) throw error
    console.log('Successfully connected to Supabase')
    return true
  } catch (error) {
    console.error('Failed to connect to Supabase:', error.message)
    return false
  }
}

// Add delay function to respect rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function fetchSetlistPage(page) {
  console.log(`Fetching setlist page ${page} for ${ARTIST_NAME}...`)
  try {
    const response = await fetch(
      `https://api.setlist.fm/rest/1.0/artist/${ARTIST_MBID}/setlists?p=${page}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-key': SETLIST_API_KEY
        }
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${error}`)
    }
    
    const data = await response.json()
    console.log(`Successfully fetched page ${page} with ${data.setlist?.length || 0} setlists`)
    return data
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error.message)
    throw error
  }
}

async function insertIntoSupabase(setlist) {
  try {
    // Validate that this is a Billy Strings setlist
    if (setlist.artist.mbid !== ARTIST_MBID || setlist.artist.name !== ARTIST_NAME) {
      console.error('Invalid setlist - not a Billy Strings concert')
      return false
    }

    console.log(`Processing concert at ${setlist.venue.name} on ${setlist.eventDate}`)
    
    // Transform setlist data into our schema format
    const concert = {
      venue: setlist.venue.name,
      city: setlist.venue.city.name,
      state: setlist.venue.city.state,
      country: setlist.venue.city.country.code,
      date: setlist.eventDate,
      notes: setlist.tour?.name || null,
      source_id: setlist.id,
      setlist_data: setlist.sets,
      tour_name: setlist.tour?.name,
      last_updated: new Date().toISOString()
    }

    // Check if concert already exists
    const { data: existingConcert } = await supabase
      .from('concerts')
      .select('id')
      .eq('source_id', setlist.id)
      .single()

    if (existingConcert) {
      console.log(`Concert ${setlist.id} already exists, skipping...`)
      return true
    }

    // Insert concert data
    const { data: insertedConcert, error: concertError } = await supabase
      .from('concerts')
      .upsert([concert], {
        onConflict: 'source_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (concertError) {
      console.error('Error inserting concert:', concertError.message)
      return false
    }

    console.log('Successfully inserted concert:', insertedConcert.id)

    // Process setlist data if available
    if (setlist.sets && setlist.sets.set) {
      for (const set of setlist.sets.set) {
        const setNumber = set.encore ? set.encore + 100 : set.name === 'Encore' ? 100 : parseInt(set.name) || 1
        
        for (let i = 0; i < set.song.length; i++) {
          const song = set.song[i]
          
          // First ensure the song exists
          const { data: insertedSong, error: songError } = await supabase
            .from('songs')
            .upsert([{
              title: song.name,
              is_cover: !!song.cover
            }], {
              onConflict: 'title',
              ignoreDuplicates: true
            })
            .select()
            .single()

          if (songError) {
            console.error('Error inserting song:', songError.message)
            continue
          }

          // Then create the setlist entry
          const { error: setlistError } = await supabase
            .from('setlists')
            .upsert([{
              concert_id: insertedConcert.id,
              song_id: insertedSong.id,
              set_number: setNumber,
              position: i + 1,
              notes: song.info || null,
              source_data: song
            }])

          if (setlistError) {
            console.error('Error inserting setlist entry:', setlistError.message)
          } else {
            console.log(`Added song: ${song.name}`)
          }
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('Error processing concert data:', error.message)
    return false
  }
}

async function collectAllSetlists() {
  let totalConcerts = 0
  let page = 1
  let hasMorePages = true
  
  console.log('Starting collection of Billy Strings setlist data...')

  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Failed to connect to Supabase')
    }

    while (hasMorePages) {
      console.log(`Fetching page ${page}...`)
      const pageData = await fetchSetlistPage(page)
      
      if (!pageData.setlist || pageData.setlist.length === 0) {
        console.log('No more setlists found')
        hasMorePages = false
        break
      }

      // Process all setlists on the page
      for (const setlist of pageData.setlist) {
        const success = await insertIntoSupabase(setlist)
        if (success) {
          totalConcerts++
          console.log(`[${totalConcerts}] Processed concert at ${setlist.venue.name} on ${setlist.eventDate}`)
        }
        // Add a small delay between processing each setlist to avoid overwhelming the database
        await delay(500)
      }

      // Check if we've reached the total number of pages
      if (pageData.total <= page * pageData.itemsPerPage) {
        hasMorePages = false
      } else {
        page++
        // Add a delay between pages to respect rate limits
        await delay(1000)
      }
    }
  } catch (error) {
    console.error('Error during collection:', error.message)
  }

  console.log(`Collection complete! Processed ${totalConcerts} concerts.`)
  return totalConcerts
}

// Run the collector
console.log('Starting script...')
collectAllSetlists().then(total => {
  console.log(`Script finished. Total concerts collected: ${total}`)
  process.exit(0)
}).catch(error => {
  console.error('Script failed:', error.message)
  process.exit(1)
})