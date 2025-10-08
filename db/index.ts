import { writeFile, readFile, access } from 'node:fs/promises'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), 'data')

export async function readDBFile<T = unknown>(dbName: string): Promise<T> {
  const filePath = path.join(DB_PATH, `${dbName}.json`)

  try {
    await access(filePath)
    const data = await readFile(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (error) {
    console.warn(`File ${dbName}.json not found, returning empty array`)
    return [] as T
  }
}

export async function writeDBFile(dbName: string, data: unknown): Promise<void> {
  await writeFile(path.join(DB_PATH, `${dbName}.json`), JSON.stringify(data, null, 2), 'utf-8')
}
