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
  return !!process.env.UPSTASH_REDIS_REST_URL;
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return Redis.fromEnv();
}

export async function getSubscribers(): Promise<Subscriber[]> {
  if (isKvAvailable()) {
    const redis = await getRedis();
    const data = await redis.get<Subscriber[]>(KV_KEY);
    return data ?? [];
  }
  return readJSON<Subscriber[]>('mentor-subscribers.json');
}

export async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  if (isKvAvailable()) {
    const redis = await getRedis();
    await redis.set(KV_KEY, subscribers);
    return;
  }
  writeJSON('mentor-subscribers.json', subscribers);
}

export async function addSubscriber(subscriber: Subscriber): Promise<void> {
  const list = await getSubscribers();
  list.push(subscriber);
  await saveSubscribers(list);
}
