import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error('Admin blog GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { title, titleAr, category, excerpt, content, image, isPublished } = body;

        if (!title?.trim() || !content?.trim()) {
            return NextResponse.json({ error: 'العنوان والمحتوى مطلوبان' }, { status: 400 });
        }

        const baseSlug = slugify(title, { lower: true, strict: true }) || `post-${Date.now()}`;
        let slug = baseSlug;
        let counter = 1;

        while (await prisma.post.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        const newPost = await prisma.post.create({
            data: {
                title: title.trim(),
                titleAr: titleAr?.trim() || title.trim(),
                slug,
                category: category?.trim() || 'أخبار الشركة',
                excerpt: excerpt?.trim() || null,
                content: content.trim(),
                image: image?.trim() || null,
                isPublished: isPublished !== undefined ? isPublished : true,
            },
        });

        return NextResponse.json({ success: true, post: newPost });
    } catch (error: any) {
        console.error('Admin blog POST error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create post' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, category, excerpt, content, image, isPublished } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const updated = await prisma.post.update({
            where: { id },
            data: {
                title: title?.trim(),
                category: category?.trim(),
                excerpt: excerpt?.trim(),
                content: content?.trim(),
                image: image?.trim() || null,
                isPublished,
            },
        });

        return NextResponse.json({ success: true, post: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.post.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete post' }, { status: 500 });
    }
}
