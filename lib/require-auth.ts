import { NextRequest } from 'next/server'
import { verifyExhibitorToken } from '@/lib/jwt'

type RequireAuthResult =
  | {
      ok: true
      payload: {
        exhibitorId: string
      }
    }
  | {
      ok: false
      response: Response
    }

export async function requireAuth(
  request: NextRequest
): Promise<RequireAuthResult> {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ ok: false, error: 'Missing token' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      ),
    }
  }

  try {
    const payload = await verifyExhibitorToken(token)

    return {
      ok: true,
      payload,
    }
  } catch {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ ok: false, error: 'Invalid token' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      ),
    }
  }
}