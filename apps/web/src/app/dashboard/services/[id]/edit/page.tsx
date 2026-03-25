'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateServiceSchema, type CreateServiceInput, JAMAICA_PARISHES } from '@jobsy/shared';
import { apiClient } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
}

interface ServiceDetail extends CreateServiceInput {
  id: string;
  images: Array<{ id: string; url: string }>;
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const [serverError, setServerError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(CreateServiceSchema),
  });

  useEffect(() => {
    async function fetchData() {
      const [serviceRes, catRes] = await Promise.all([
        apiClient<ServiceDetail>(`/api/services/${params.id}`),
        apiClient<Category[]>('/api/categories'),
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (serviceRes.success) {
        reset({
          title: serviceRes.data.title,
          description: serviceRes.data.description,
          categoryId: serviceRes.data.categoryId,
          priceMin: serviceRes.data.priceMin,
          priceMax: serviceRes.data.priceMax,
          priceCurrency: serviceRes.data.priceCurrency,
          priceUnit: serviceRes.data.priceUnit,
          parish: serviceRes.data.parish,
          address: serviceRes.data.address,
          tags: serviceRes.data.tags,
        });
      } else {
        setServerError('Failed to load service');
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id, reset]);

  const onSubmit = async (data: CreateServiceInput) => {
    setServerError('');
    const res = await apiClient(`/api/services/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res.success) {
      router.push('/dashboard/services');
    } else {
      setServerError(res.error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
        <p className="mt-1 text-gray-600">Update your service listing</p>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Service Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.priceMin && <p className="mt-1 text-sm text-red-600">{errors.priceMin.message}</p>}
          </div>
          <div>
            <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700">
              Maximum Price (JMD)
            </label>
            <input
              id="priceMax"
              type="number"
              step="0.01"
              {...register('priceMax', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.priceMax && <p className="mt-1 text-sm text-red-600">{errors.priceMax.message}</p>}
          </div>
        </div>

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

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="address"
            type="text"
            {...register('address')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Image upload placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Image management coming soon</p>
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
            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Update Service'}
          </button>
        </div>
      </form>
    </div>
  );
}
