import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "moosehill-bookings";

export async function GET() {
  try {
    const data = await redis.get(KEY);
    return Response.json(data || []);
  } catch (e) {
    return Response.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const bookings = await request.json();
    await redis.set(KEY, bookings);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false }, { status: 500 });
  }
}
