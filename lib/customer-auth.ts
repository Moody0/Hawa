import { cache } from 'react';
import { laravelJson } from './laravel-server';
export { convertArabicToEnglishDigits, normalizeSyrianPhone, isValidSyrianPhone } from './order-validation';
export const getAuthenticatedCustomer=cache(async():Promise<any|null>=>{const result=await laravelJson<{customer:any}>('/api/customer/auth/me',{customer:null});return result.customer;});
