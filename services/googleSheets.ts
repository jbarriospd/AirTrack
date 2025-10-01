import { google } from 'googleapis';

/**
 * Crea y autoriza un cliente JWT para la API de Google Sheets.
 * @returns Un cliente de la API de Google Sheets autorizado.
 */
async function getSheetsClient() {
  const jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  await jwtClient.authorize();
  return google.sheets({ version: 'v4', auth: jwtClient });
}

/**
 * Obtiene valores de un rango específico en una hoja de cálculo de Google.
 * @param spreadsheetId El ID de la hoja de cálculo.
 * @param range El rango en formato A1 (ej. 'Sheet1!A1:B5').
 * @returns Una promesa que se resuelve en un array de arrays con los valores de las celdas.
 */
export async function getSheetValues(spreadsheetId: string, range: string) {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error al obtener datos de Google Sheets:', error);
    // Relanzamos el error para que sea manejado por quien llama a la función.
    throw new Error('No se pudieron obtener los datos de la hoja de cálculo.');
  }
}

/**
 * Escribe datos de vuelos a una hoja de Google Sheets
 * @param spreadsheetId El ID de la hoja de cálculo
 * @param flights Array de datos de vuelos
 * @param sheetName Nombre de la hoja (opcional, por defecto 'Sheet1')
 */
export async function writeFlightDataToSheet(
  spreadsheetId: string, 
  flights: any[], 
  sheetName: string = 'processData'
) {
  try {
    const sheets = await getSheetsClient();
    
    // Convertir los datos de vuelos a formato de filas
    const rows = flights.map(flight => [
      flight.date,
      flight.flightNumber,
      flight.from,
      flight.to,
      flight.status,
      flight.etd || '',
      flight.atd || '',
      flight.delayCategory || '',
    ]);

    // Usar append para agregar datos sin sobreescribir
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    });

    console.log(`Successfully appended ${flights.length} flights to Google Sheet`);
    return response;
  } catch (error) {
    console.error('Error al escribir datos de vuelos en Google Sheets:', error);
    throw new Error('No se pudieron escribir los datos de vuelos en la hoja de cálculo.');
  }
}