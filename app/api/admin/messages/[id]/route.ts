import { forwardLaravel } from '@/lib/laravel-proxy';
export async function PATCH(request:Request){return forwardLaravel(request);}
export async function DELETE(request:Request){return forwardLaravel(request);}
