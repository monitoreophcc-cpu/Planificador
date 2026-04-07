import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type UpdateSessionResult = {
  response: NextResponse
  hasSession: boolean
}

export async function updateSession(
  request: NextRequest
): Promise<UpdateSessionResult> {
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(toSet: Array<{ name: string; value: string; options?: any }>) {
          toSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { response, hasSession: Boolean(session) }
  await supabase.auth.getUser()

  return response
}
