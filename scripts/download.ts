import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { updateFlightStatusesFromSheet } from "../lib/downloadTodayStatus";

updateFlightStatusesFromSheet();
