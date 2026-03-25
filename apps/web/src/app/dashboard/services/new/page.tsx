'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateServiceSchema, type CreateServiceInput, JAMAICA_PARISHES } from '@jobsy/shared';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
}

export default function NewServicePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(CreateServiceSchema),
    defaultValues: {
      priceCurrency: 'JMD',
      priceUnit: 'per_service',
      tags: [],
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      const res = await apiClient<Category[]>('/api/categories');
      if (res.success) setCategories(res.data);
    }
    fetchCategories();
  }, []);

  const onSubmit = async (data: CreateServiceInput) => {
    setServerError('');
    const res = await apiClient('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success) {
      router.push('/dashboard/services');
    } else {
      setServerError(res.error.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Service</h1>
        <p className="mt-1 text-gray-600">List a new service for customers to book</p>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Service Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Professional Home Cleaning"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe your service in detail..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700">
              Minimum Price (JMD)
            </label>
            <input
              id="priceMin"
              type="number"
              step="0.01"
              {...register('priceMin', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.priceMin && <p className="mt-1 text-sm text-red-600">{errors.priceMin.message}</p>}
          </div>
          <div>
            <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700">
              Maximum Price (JMD) <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="priceMax"
              type="number"
              step="0.01"
              {...register('priceMax', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.priceMax && <p className="mt-1 text-sm text-red-600">{errors.priceMax.message}</p>}
          </div>
        </div>

        {/* Parish */}
        <div>
          <label htmlFor="parish" className="block text-sm font-medium text-gray-700">
            Parish
          </label>
          <select
            id="parish"
            {...register('parish')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a parish</option>
            {JAMAICA_PARISHES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.parish && <p className="mt-1 text-sm text-red-600">{errors.parish.message}</p>}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="address"
            type="text"
            {...register('address')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Service area address"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags <span className="text-gray-400">(comma-separated)</span>
          </label>
          <input
            id="tags"
            type="text"
            onChange={(e) => {
              // Handled by manual transform since tags is an array
            }}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="cleaning, deep clean, residential"
          />
          <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
        </div>

        {/* Image upload placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Images
          </label>
          <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Drag and drop images here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 5MB each</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/services')}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
}
