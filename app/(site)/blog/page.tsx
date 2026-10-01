import React from 'react';
import { Metadata } from 'next';
import {laravelJson} from '@/lib/laravel-server';
import BlogClient, { BlogPostItem } from './BlogClient';


export const revalidate = 60; // 1 minute revalidation

export const metadata: Metadata = {
    title: 'المدونة والتقارير التجارية | شركة حوا للتوزيع والتجارة',
    description: 'مركز معلومات وأخبار تجارة الجملة وتوزيع المواد الغذائية في سوريا: إطلاقات الوكالات، لوائح أسعار الطرود، نصائح إدارة المحلات والسوبرماركت، ومؤشرات السوق.',
    openGraph: {
        title: 'المدونة وأخبار الوكالات | Hawa Distribution & Trading',
        description: 'آخر تقارير السلع والوكالات الغذائية وإرشادات أصحاب المتاجر من شركة حوا للتوزيع.',
    },
};



export default async function BlogPage() {
    const posts=await laravelJson<any[]>('/api/blog',[]);
    const displayPosts:BlogPostItem[]=posts.map(p=>({...p,image:p.image||'/images/hawa_hero.jpg'}));


    return (
        <div className="w-full bg-[#FCFBF8] dark:bg-[#070D18] min-h-screen text-[#0B192C] dark:text-slate-100 transition-colors">
            <BlogClient 
                initialPosts={displayPosts} 
            />
        </div>
    );
}
