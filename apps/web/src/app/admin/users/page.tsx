'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  async function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient<AdminUser[]>(`/api/admin/users${query}`);
    if (res.success) {
      setUsers(res.data);
    } else {
      setError(res.error.message);
    }
    setLoading(false);
  }

  const handleBan = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    const res = await apiClient<AdminUser>(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
      );
    }
    setActionLoading(null);
  };

  const handleVerify = async (userId: string) => {
    setActionLoading(userId);
    const res = await apiClient<AdminUser>(`/api/admin/users/${userId}/verify`, {
      method: 'POST',
    });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isEmailVerified: true } : u))
      );
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-600">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="CLIENT">Customer</option>
          <option value="PROVIDER">Provider</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={fetchUsers}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : users.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                      {!user.isEmailVerified && (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isEmailVerified && (
                        <button
                          onClick={() => handleVerify(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleBan(user.id, user.isActive)}
                        disabled={actionLoading === user.id}
                        className={`text-sm font-medium disabled:opacity-50 ${
                          user.isActive
                            ? 'text-red-600 hover:text-red-500'
                            : 'text-green-600 hover:text-green-500'
                        }`}
                      >
                        {user.isActive ? 'Ban' : 'Unban'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
