"use server";
import {laravelJson} from '@/lib/laravel-server';
export async function getRelatedProducts(type:'brandId'|'mainCategoryId'|'categoryId',id:string,query:string){try{return {success:true,data:await laravelJson<any[]>('/api/admin/products?'+new URLSearchParams({[type]:id,search:query,limit:'50'}))};}catch{return {success:false,error:'Failed to fetch products'};}}
export async function getRelatedCategories(type:'brandId'|'mainCategoryId',id:string,query:string){try{return {success:true,data:await laravelJson<any[]>('/api/admin/categories?'+new URLSearchParams({[type]:id,search:query,limit:'1000'}))};}catch{return {success:false,error:'Failed to fetch categories'};}}
export async function getRelatedBrands(id:string,query:string){try{return {success:true,data:await laravelJson<any[]>('/api/admin/brands?'+new URLSearchParams({mainCategoryId:id,search:query,limit:'1000'}))};}catch{return {success:false,error:'Failed to fetch brands'};}}
