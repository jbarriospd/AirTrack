export async function fetchFlights() {
    const data = await fetch('https://api.eldorado.aero/api/v2/flights/departures')
      .then(response => response.json())
      .then(data => {
        return data.flights
      })
      .catch(error => {
        console.error('Error:', error);
      });
    return data;
}

export async function fetchFlightStatus(FlightNumber: string, Date: string, retryCount: number = 0) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
    
  try {
    const response = await fetch('https://informacionvuelo.avianca.com/api/FlightStatus/number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Origin": "https://informacionvuelo.avianca.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      body: JSON.stringify({
        Date: Date,
        Language: "en",
        FlightNumber: FlightNumber
      })
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is JSON by examining content-type header
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.warn(`Non-JSON response for flight ${FlightNumber}:`, textResponse.substring(0, 200));
      throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Error fetching flight ${FlightNumber} (attempt ${retryCount + 1}):`, error);
    
    // Retry logic with exponential backoff
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Retrying flight ${FlightNumber} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchFlightStatus(FlightNumber, Date, retryCount + 1);
    }
    
    // After max retries, return null instead of throwing
    console.error(`Failed to fetch flight ${FlightNumber} after ${maxRetries + 1} attempts`);
    return null;
  }
}
