'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  createdAt: string;
}

export default function UsersManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
  });
  
  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      // Fallback dummy data for development/preview
      setUsers([
        {
          _id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          username: 'user2',
          email: 'user2@example.com',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);
  
  // Handle opening edit modal
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };
  
  // Handle opening delete modal
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value as any, // TypeScript limitation with indexed objects
    });
  };
  
  // Handle form submission for editing a user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      const response = await axios.put(`/api/admin/users/${selectedUser._id}`, formData);
      
      // Update the users list
      setUsers(users.map(u => u._id === selectedUser._id ? response.data.user : u));
      
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
      
      // For development/preview, update the users list directly
      if (process.env.NODE_ENV === 'development') {
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...formData } : u));
        setIsEditModalOpen(false);
        toast.success('User updated (preview mode)');
      }
    }
  };
  
  // Handle deleting a user
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.delete(`/api/admin/users/${selectedUser._id}`);
      
      // Remove the user from the list
      setUsers(users.filter(u => u._id !== selectedUser._id));
      
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
      
      // For development/preview, remove the user from the list directly
      if (process.env.NODE_ENV === 'development') {
        setUsers(users.filter(u => u._id !== selectedUser._id));
        setIsDeleteModalOpen(false);
        toast.success('User deleted (preview mode)');
      }
    }
  };
  
  // Check if the authenticated user is an admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-500/10 p-3 rounded-full mb-4">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Admin Access Required</h1>
        <p className="text-gray-400 text-center mb-6 max-w-md">
          You need to be logged in as an administrator to access this page.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
          >
            Login
          </Link>
          <Link 
            href="/" 
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-2">
            View and manage all user accounts
          </p>
        </div>
        <div>
          <button
            onClick={fetchUsers}
            className="flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt={user.username}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-400 hover:text-red-300 flex items-center"
                            disabled={user._id === '1'} // Prevent deleting the main admin account
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{selectedUser.username}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 