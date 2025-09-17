import { writeFile, readFile } from 'node:fs/promises';
import { formattedDate } from '@/lib/utils';

import path from 'node:path';

const DB_PATH = path.join(process.cwd(), './db');

export async function readDBFile<T = unknown>(dbName: string): Promise<T> {
  const data = await readFile(`${DB_PATH}/${dbName}.json`, 'utf-8');
  return JSON.parse(data) as T;
}

export async function writeDBFile(dbName: string, data: unknown): Promise<void> {
  await writeFile(`${DB_PATH}/${dbName}.json`, JSON.stringify(data, null, 2), 'utf-8');
}