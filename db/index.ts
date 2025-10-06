import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), './db')

export async function readDBFile<T = unknown>(dbName: string): Promise<T> {
  // In production, fetch from public URL instead of file system
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/data/${dbName}.json`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    return await response.json() as T
  }
  
  // In development, read from file system
  const data = await readFile(`${DB_PATH}/${dbName}.json`, 'utf-8')
  return JSON.parse(data) as T
}

export async function writeDBFile(dbName: string, data: unknown): Promise<void> {
  await writeFile(`${DB_PATH}/${dbName}.json`, JSON.stringify(data, null, 2), 'utf-8')
}
