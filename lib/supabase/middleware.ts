import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rutas accesibles SIN sesión activa.
 * Cualquier ruta que no esté aquí se considera protegida por defecto,
 * así no hay riesgo de olvidar proteger una pantalla nueva.
 */
const RUTAS_PUBLICAS = ['/login', '/registro', '/']

const RUTAS_ANTIGUAS: Record<string, string> = {
  '/home.2': '/home',
  '/evaluacion.2': '/evaluacion',
  '/meditacion.2': '/meditacion',
  '/monitoreo.2': '/monitoreo',
  '/cronograma.2': '/cronograma',
  '/contrasena.2': '/contrasena',
  '/modoCrisis.2': '/modoCrisis',
  '/registroEmocional.2': '/registroEmocional',
  '/preferenciasApoyo.2': '/preferenciasApoyo',
  '/factoresImpacto.2': '/factoresImpacto',
  '/estadoActual.2': '/estadoActual',
  '/motivos.2': '/motivos',
  '/bienvenida.2': '/bienvenida',
  '/frecuencia.2': '/frecuencia',
}

function esRutaPublica(pathname: string): boolean {
  return RUTAS_PUBLICAS.includes(pathname)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Revisa tu archivo .env.local antes de levantar el servidor.'
    )
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Propaga las cookies actualizadas a la request (para que los
        // Server Components de esta misma petición las vean) y a la
        // response (para que el navegador las reciba).
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // OJO: getUser(), nunca getSession(), en código de servidor.
  // getSession() solo lee la cookie sin validar el token; getUser() lo
  // revalida contra el servidor de Supabase en cada request.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Sin sesión entrando a una pantalla protegida -> /login
  if (!user && !esRutaPublica(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Con sesión activa entrando a login/registro -> /home
  if (user && (pathname === '/login' || pathname === '/registro')) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  const rutaAntigua = RUTAS_ANTIGUAS[pathname]
  if (rutaAntigua) {
    const url = request.nextUrl.clone()
    url.pathname = rutaAntigua
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: devolver siempre supabaseResponse. Si se crea una
  // NextResponse nueva sin copiar sus cookies, la sesión se "pierde"
  // en el navegador en el próximo refresh de token.
  return supabaseResponse
}