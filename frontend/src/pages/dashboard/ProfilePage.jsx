import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const { data } = await uploadAPI.profileImage(formData);
      await authAPI.updateProfile({ profileImage: data.url });
      updateUser({ profileImage: data.url });
      toast.success('Profile image updated');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const roleColors = {
    admin: 'bg-red-500',
    teacher: 'bg-blue-500',
    student: 'bg-green-500',
    parent: 'bg-purple-500',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl ${roleColors[user?.role] || 'bg-gray-500'} overflow-hidden`}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-indigo-700 transition-colors">
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              ) : (
                <FaCamera className="text-xs" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium text-white capitalize ${roleColors[user?.role] || 'bg-gray-500'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaUser className="inline mr-1 text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaEnvelope className="inline mr-1 text-gray-400" /> Email (read-only)
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaPhone className="inline mr-1 text-gray-400" /> Phone
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
          <FaLock className="text-gray-400" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirmPassword', label: 'Confirm Password' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input
                  type="password"
                  value={passwordForm[f.key]}
                  required
                  onChange={(e) => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['User ID', user?._id],
            ['Role', user?.role],
            ['Account Status', 'Active'],
            ['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
