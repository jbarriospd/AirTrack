import { FlightStatus } from '@/lib/types'
import { google } from 'googleapis'

async function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!email || !privateKey) {
    throw new Error('Missing Google Service Account credentials in environment variables')
  }

  const formattedKey = privateKey.replace(/\\n/g, '\n')

  const jwtClient = new google.auth.JWT({
    email,
    key: formattedKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  try {
    await jwtClient.authorize()
  } catch (error) {
    console.error('Failed to authorize Google Service Account:', error)
    throw new Error('Google authentication failed. Check your credentials.')
  }

  return google.sheets({ version: 'v4', auth: jwtClient })
}

export async function getSheetValues(spreadsheetId: string, range: string) {
  try {
    const sheets = await getSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })
    return response.data.values || []
  } catch (error) {
    console.error('Error al obtener datos de Google Sheets:', error)
    throw new Error('No se pudieron obtener los datos de la hoja de cálculo.')
  }
}

export async function writeFlightDataToSheet(
  spreadsheetId: string,
  flights: FlightStatus[],
  sheetName: string = 'processData'
) {
  try {
    const sheets = await getSheetsClient()

    const rows = flights.map((flight) => [
      flight.date,
      flight.flightNumber,
      flight.from,
      flight.to,
      flight.status,
      flight.etd || '',
      flight.atd || '',
      flight.delayMinutes || '',
    ])

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    })

    console.log(`Successfully appended ${flights.length} flights to Google Sheet`)
    return response
  } catch (error) {
    console.error('Error al escribir datos de vuelos en Google Sheets:', error)
    throw new Error('No se pudieron escribir los datos de vuelos en la hoja de cálculo.')
  }
}
