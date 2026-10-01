import { forwardLaravel } from '@/lib/laravel-proxy';
export async function GET(request:Request){return forwardLaravel(request);}
