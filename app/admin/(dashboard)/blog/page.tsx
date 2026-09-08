'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, CheckCircle2, X, Image, RotateCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt?: string | null;
    content: string;
    image?: string | null;
    isPublished: boolean;
    createdAt: string;
}

const BLOG_CATEGORIES = [
    'أخبار الشركة',
    'إطلاق منتجات جديدة',
    'عروض الوكالات',
    'أخبار العلامات التجارية',
    'نصائح لأصحاب المتاجر',
    'أخبار السوق',
];

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const [form, setForm] = useState({
        title: '',
        category: 'أخبار الشركة',
        excerpt: '',
        content: '',
        image: '',
        isPublished: true,
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blog');
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error('Error loading posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const openCreateModal = () => {
        setEditingPost(null);
        setForm({
            title: '',
            category: 'أخبار الشركة',
            excerpt: '',
            content: '',
            image: '',
            isPublished: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (post: BlogPost) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            category: post.category,
            excerpt: post.excerpt || '',
            content: post.content,
            image: post.image || '',
            isPublished: post.isPublished,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            toast.error('العنوان والمحتوى مطلوبان');
            return;
        }

        setSubmitting(true);
        try {
            if (editingPost) {
                const res = await fetch('/api/admin/blog', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingPost.id, ...form }),
                });
                if (res.ok) {
                    toast.success('تم تحديث المقال بنجاح');
                    setIsModalOpen(false);
                    fetchPosts();
                } else {
                    toast.error('فشل التحديث');
                }
            } else {
                const res = await fetch('/api/admin/blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                if (res.ok) {
                    toast.success('تم نشر المقال بنجاح');
                    setIsModalOpen(false);
                    fetchPosts();
                } else {
                    toast.error('فشل الإنشاء');
                }
            }
        } catch {
            toast.error('حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        try {
            const res = await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.id !== id));
                toast.success('تم حذف المقال');
            }
        } catch {
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0B192C] dark:text-white flex items-center gap-2">
                        <FileText className="text-[#8A6305]" />
                        <span>إدارة المدونة والمقالات</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                        إضافة وتعديل وحذف المقالات وأخبار الوكالات والنصائح الموجهة لأصحاب المتاجر.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white dark:text-black font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="text-lg" />
                        <span>إضافة مقال جديد</span>
                    </button>
                    <button
                        onClick={fetchPosts}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="تحديث"
                    >
                        <RotateCw className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#132035] rounded-2xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-xs">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <div className="w-8 h-8 mx-auto border-3 border-[#8A6305] border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-xs font-bold">جاري تحميل المقالات...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-bold">
                        لا توجد مقالات مضافة بعد. اضغط "إضافة مقال جديد" للبدء.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs sm:text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200/80 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold">
                                <tr>
                                    <th className="p-3.5 text-start">عنوان المقال</th>
                                    <th className="p-3.5 text-start">التصنيف</th>
                                    <th className="p-3.5 text-center">الحالة</th>
                                    <th className="p-3.5 text-center">تاريخ النشر</th>
                                    <th className="p-3.5 text-center">معاينة</th>
                                    <th className="p-3.5 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium text-slate-800 dark:text-gray-200">
                                {posts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-3.5 font-bold text-[#0B192C] dark:text-white max-w-xs truncate">
                                            {p.title}
                                        </td>
                                        <td className="p-3.5">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF6EC] dark:bg-white/10 text-[#8A6305] dark:text-[#8A6305] border border-[#8A6305]/20">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                p.isPublished
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {p.isPublished ? 'منشور' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center text-xs text-slate-500">
                                            {new Date(p.createdAt).toLocaleDateString('ar-SY')}
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <Link
                                                href={`/blog/${p.slug}`}
                                                target="_blank"
                                                className="p-1.5 rounded-lg text-slate-600 hover:text-[#8A6305] transition-colors inline-block"
                                                title="عرض في الموقع"
                                            >
                                                <Eye className="text-lg" />
                                            </Link>
                                        </td>
                                        <td className="p-3.5 text-center space-x-1 rtl:space-x-reverse">
                                            <button
                                                onClick={() => openEditModal(p)}
                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                                title="تعديل"
                                            >
                                                <Pencil className="text-lg" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#132035] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/10 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-5">
                            <h2 className="text-lg font-black text-[#0B192C] dark:text-white">
                                {editingPost ? 'تعديل المقال' : 'إضافة مقال جديد للمدونة'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                            >
                                <X className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-gray-200 mb-1">
                                    عنوان المقال *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="اكتب عنواناً جذاباً للمقال..."
                                    className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-200 mb-1">
                                        التصنيف *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                    >
                                        {BLOG_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-200 mb-1">
                                        رابط صورة الغلاف (URL)
                                    </label>
                                    <input
                                        type="url"
                                        value={form.image}
                                        onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                                        placeholder="https://..."
                                        className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-gray-200 mb-1">
                                    مقدمة مختصرة (Excerpt)
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.excerpt}
                                    onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                                    placeholder="نبذة سريعة تظهر في كرت المقال..."
                                    className="block w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-gray-200 mb-1">
                                    المحتوى الكامل للمقال *
                                </label>
                                <textarea
                                    rows={7}
                                    required
                                    value={form.content}
                                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                                    placeholder="اكتب تفاصيل المقال (يدعم العناوين الفرعية والنقاط)..."
                                    className="block w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={form.isPublished}
                                    onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                                    className="w-4 h-4 rounded text-[#8A6305] focus:ring-[#8A6305]"
                                />
                                <label htmlFor="isPublished" className="text-xs font-bold text-slate-800 dark:text-gray-200">
                                    نشر المقال فوراً في الموقع
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold hover:bg-gray-50 text-slate-700 dark:text-gray-300"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white dark:text-black font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                                >
                                    {submitting ? 'جاري الحفظ...' : (editingPost ? 'تحديث المقال' : 'نشر المقال')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
