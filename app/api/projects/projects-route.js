import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
const KEY = "moosehill-projects";

export async function GET() {
  try {
    const data = await redis.get(KEY);
    return Response.json(data ? JSON.parse(data) : []);
  } catch (e) {
    console.error("Redis GET error:", e);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const projects = await request.json();
    await redis.set(KEY, JSON.stringify(projects));
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Redis POST error:", e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
