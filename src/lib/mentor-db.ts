import { readJSON, writeJSON } from './db';

const KV_KEY = 'mentor:subscribers';

interface Subscriber {
  token: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  transactionId?: string;
}

function isKvAvailable() {
  return !!process.env.KV_REST_API_URL;
}

async function getKv() {
  const { kv } = await import('@vercel/kv');
  return kv;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  if (isKvAvailable()) {
    const kv = await getKv();
    const data = await kv.get<Subscriber[]>(KV_KEY);
    return data ?? [];
  }
  return readJSON<Subscriber[]>('mentor-subscribers.json');
}

export async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  if (isKvAvailable()) {
    const kv = await getKv();
    await kv.set(KV_KEY, subscribers);
    return;
  }
  writeJSON('mentor-subscribers.json', subscribers);
}

export async function addSubscriber(subscriber: Subscriber): Promise<void> {
  const list = await getSubscribers();
  list.push(subscriber);
  await saveSubscribers(list);
}
