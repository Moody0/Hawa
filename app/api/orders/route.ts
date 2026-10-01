import { forwardLaravel } from '@/lib/laravel-proxy';
export async function POST(request:Request){return forwardLaravel(request);}
