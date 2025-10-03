import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

import { writeFlightsToGoogleSheet } from '../lib/exportData'

// Ejecutar la función
writeFlightsToGoogleSheet(process.env.GOOGLE_SPREADSHEET_ID!)
