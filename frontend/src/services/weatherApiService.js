// Weather API Service for fetching real aviation weather data
const WEATHER_API_BASE = 'http://localhost:3001/api/weather'

// Parse METAR string to extract weather data
export const parseMETAR = (metarString) => {
  if (!metarString) return null

  const data = {
    temperature: null,
    windSpeed: null,
    windDirection: null,
    visibility: null,
    ceiling: null,
    condition: 'VFR' // Default
  }

  try {
    // Extract temperature (e.g., "15/12" or "M05/M10")
    const tempMatch = metarString.match(/(\d{2}|M\d{2})\/(\d{2}|M\d{2})/)
    if (tempMatch) {
      const temp = tempMatch[1].startsWith('M') ? -parseInt(tempMatch[1].substring(1)) : parseInt(tempMatch[1])
      data.temperature = temp
    }

    // Extract wind (e.g., "27015KT" or "VRB05KT")
    const windMatch = metarString.match(/(\d{3}|VRB)(\d{2,3})KT/)
    if (windMatch) {
      data.windDirection = windMatch[1] === 'VRB' ? null : parseInt(windMatch[1])
      data.windSpeed = parseInt(windMatch[2])
    }

    // Extract visibility (e.g., "10SM" or "1/2SM")
    const visMatch = metarString.match(/(\d+(?:\/\d+)?)SM/)
    if (visMatch) {
      const visStr = visMatch[1]
      if (visStr.includes('/')) {
        const [num, den] = visStr.split('/').map(Number)
        data.visibility = num / den
      } else {
        data.visibility = parseInt(visStr)
      }
    }

    // Extract ceiling (e.g., "BKN030" or "OVC015")
    const ceilingMatch = metarString.match(/(BKN|OVC|VV)(\d{3})/)
    if (ceilingMatch) {
      data.ceiling = parseInt(ceilingMatch[2]) * 100 // Convert to feet
    }

    // Determine flight condition based on visibility and ceiling
    if (data.visibility !== null && data.ceiling !== null) {
      if (data.visibility < 1 || data.ceiling < 500) {
        data.condition = 'LIFR'
      } else if (data.visibility < 3 || data.ceiling < 1000) {
        data.condition = 'IFR'
      } else if (data.visibility < 5 || data.ceiling < 3000) {
        data.condition = 'MVFR'
      } else {
        data.condition = 'VFR'
      }
    }

  } catch (error) {
    console.error('Error parsing METAR:', error)
  }

  return data
}

// Fetch historical METAR data for an airport
export const fetchHistoricalWeather = async (icao, period = '7d') => {
  try {
    const response = await fetch(`${WEATHER_API_BASE}/metar/${icao}?period=${period}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status}`)
    }

    const data = await response.json()
    
    // If we get raw METAR strings, parse them
    if (Array.isArray(data) && typeof data[0] === 'string') {
      return data.map(metarString => ({
        raw: metarString,
        parsed: parseMETAR(metarString),
        timestamp: new Date().toISOString() // Placeholder - would need actual timestamp
      }))
    }

    // If we get structured data, use it directly
    return data

  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}

// Generate mock historical data for testing (fallback when API is not available)
export const generateMockHistoricalData = (icao, period = '7d') => {
  const seed = icao.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const days = period === '30d' ? 30 : period === '14d' ? 14 : 7
  const hoursPerDay = 8 // Every 3 hours
  const data = []

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour += 3) {
      const timestamp = new Date()
      timestamp.setDate(timestamp.getDate() - (days - day))
      timestamp.setHours(hour, 0, 0, 0)

      // Generate realistic weather data based on airport and time
      const baseTemp = 15 + (seed % 20) + Math.sin((hour - 6) * Math.PI / 12) * 8
      const windSpeed = 5 + (seed % 15) + Math.random() * 5
      const windDir = (seed + day + hour) % 360
      const visibility = 5 + (seed % 10) + Math.random() * 5
      const ceiling = 2000 + (seed % 8000) + Math.random() * 2000

      // Determine condition
      let condition = 'VFR'
      if (visibility < 1 || ceiling < 500) condition = 'LIFR'
      else if (visibility < 3 || ceiling < 1000) condition = 'IFR'
      else if (visibility < 5 || ceiling < 3000) condition = 'MVFR'

      data.push({
        raw: `${icao} ${timestamp.toISOString().replace('T', ' ').substring(0, 19)}Z AUTO ${Math.round(windDir/10)*10}${Math.round(windSpeed).toString().padStart(2, '0')}KT ${Math.round(visibility)}SM BKN${Math.round(ceiling/100).toString().padStart(3, '0')} ${Math.round(baseTemp).toString().padStart(2, '0')}/${Math.round(baseTemp-5).toString().padStart(2, '0')}`,
        parsed: {
          temperature: Math.round(baseTemp * 10) / 10,
          windSpeed: Math.round(windSpeed * 10) / 10,
          windDirection: Math.round(windDir / 10) * 10,
          visibility: Math.round(visibility * 10) / 10,
          ceiling: Math.round(ceiling),
          condition
        },
        timestamp: timestamp.toISOString()
      })
    }
  }

  return data
}

// Get wind direction category (N, NE, E, etc.)
export const getWindDirectionCategory = (degrees) => {
  if (degrees === null || degrees === undefined) return 'VRB'
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

// Calculate trend direction from data points
export const calculateTrend = (values) => {
  if (!values || values.length < 2) return 'Stable'
  
  const first = values[0]
  const last = values[values.length - 1]
  
  if (last > first) return 'Rising'
  if (last < first) return 'Falling'
  return 'Stable'
}
