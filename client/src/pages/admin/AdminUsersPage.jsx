import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Trash2, Shield, AlertCircle, Check, UserCheck } from 'lucide-react';
import AdminAPI from '../../services/adminApi';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [notification, setNotification] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'All') params.append('role', roleFilter);

      const res = await AdminAPI.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change user role to "${nextRole}"?`)) return;

    try {
      const res = await AdminAPI.patch(`/users/${userId}`, { role: nextRole });
      if (res.data.success) {
        setNotification(`Role updated to ${nextRole}`);
        fetchUsers();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Role change failed');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete user account "${userName}"?`)) return;

    try {
      const res = await AdminAPI.delete(`/users/${userId}`);
      if (res.data.success) {
        setNotification(`User "${userName}" deleted.`);
        fetchUsers();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer & User Directory</h1>
          <p className="text-slate-400 text-xs">Manage customer profiles, administrative roles, and user accounts.</p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
            <span>Loading user accounts...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-xs space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Name & Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-bold text-xs text-amber-400 flex items-center justify-center flex-shrink-0">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{user.name}</span>
                          <span className="text-[10px] text-slate-500">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          user.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3 px-4 font-bold text-white">
                      {user.orderCount || 0} orders
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-slate-400">
                      {user.phone || 'N/A'}
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleRoleToggle(user._id, user.role)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                          title="Toggle Role"
                        >
                          {user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

    </div>
  );
};
