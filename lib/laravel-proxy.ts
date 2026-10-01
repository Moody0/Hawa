import 'server-only';

const backend = (process.env.LARAVEL_API_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');

/** Forward browser requests and session cookies without interpreting business data. */
export async function forwardLaravel(request: Request): Promise<Response> {
    const incoming = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');
    headers.set('Accept', 'application/json');
    headers.set('Origin', request.headers.get('origin') || incoming.origin);
    headers.set('Referer', request.headers.get('referer') || incoming.origin + '/');
    try {
        const upstream = await fetch(backend + incoming.pathname + incoming.search, {
            method: request.method,
            headers,
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
            redirect: 'manual', cache: 'no-store',
        });
        const resultHeaders = new Headers();
        for (const name of ['content-type', 'location', 'retry-after']) {
            const value = upstream.headers.get(name);
            if (value) resultHeaders.set(name, value);
        }
        for (const cookie of upstream.headers.getSetCookie()) resultHeaders.append('Set-Cookie', cookie);
        resultHeaders.set('Cache-Control', 'private, no-store');
        return new Response(upstream.body, {status: upstream.status, headers: resultHeaders});
    } catch {
        return Response.json({error: 'The backend is unavailable. Please try again shortly.'}, {status: 503});
    }
}
