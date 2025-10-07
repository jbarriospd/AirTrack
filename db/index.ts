import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get the project root directory reliably
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, '../public/data')

export async function readDBFile<T = unknown>(dbName: string): Promise<T> {
  const data = await readFile(`${DB_PATH}/${dbName}.json`, 'utf-8')
  return JSON.parse(data) as T
}

export async function writeDBFile(dbName: string, data: unknown): Promise<void> {
  await writeFile(`${DB_PATH}/${dbName}.json`, JSON.stringify(data, null, 2), 'utf-8')
}
