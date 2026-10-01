import { forwardLaravel } from '@/lib/laravel-proxy';
export async function GET(request:Request){return forwardLaravel(request);}
export async function PUT(request:Request){return forwardLaravel(request);}
