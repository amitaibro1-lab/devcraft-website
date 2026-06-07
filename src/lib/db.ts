import fs from 'fs';
import path from 'path';

const SRC_DATA_DIR = path.join(process.cwd(), 'src', 'data');
// On Vercel the project root is read-only; use /tmp for writes (ephemeral but writable)
const WRITE_DIR = process.env.VERCEL ? '/tmp' : SRC_DATA_DIR;

function ensureWriteDir() {
  if (!fs.existsSync(WRITE_DIR)) {
    fs.mkdirSync(WRITE_DIR, { recursive: true });
  }
}

export function readJSON<T>(filename: string): T {
  // Prefer the writable copy (has latest mutations), fall back to source
  const tmpPath = path.join('/tmp', filename);
  const srcPath = path.join(SRC_DATA_DIR, filename);

  if (process.env.VERCEL && fs.existsSync(tmpPath)) {
    return JSON.parse(fs.readFileSync(tmpPath, 'utf-8')) as T;
  }
  return JSON.parse(fs.readFileSync(srcPath, 'utf-8')) as T;
}

export function writeJSON<T>(filename: string, data: T): void {
  ensureWriteDir();
  const filePath = path.join(WRITE_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function appendJSON<T>(filename: string, item: T): void {
  const arr = readJSON<T[]>(filename);
  arr.push(item);
  writeJSON(filename, arr);
}
