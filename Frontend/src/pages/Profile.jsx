import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, becomeHost } from '../store/slices/authSlice';
import { toast } from '../utils/toast';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiAward, FiCheck } from 'react-icons/fi';

const Profile = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showBecomeHostConfirm, setShowBecomeHostConfirm] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [prevUser, setPrevUser] = useState(user);

  // Keep form in sync when user data loads asynchronously
  if (user !== prevUser) {
    setPrevUser(user);
    if (!editing) {
      setForm({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        avatar: user?.avatar || ''
      });
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warning('Name cannot be empty');
      return;
    }
    setSaving(true);
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
      setEditing(false);
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleBecomeHost = async () => {
    if (!showBecomeHostConfirm) {
      setShowBecomeHostConfirm(true);
      return;
    }
    setShowBecomeHostConfirm(false);
    setUpgrading(true);
    const result = await dispatch(becomeHost());
    if (becomeHost.fulfilled.match(result)) {
      toast.success('Congratulations! You are now a host 🎉');
    } else {
      toast.error(result.payload || 'Failed to become host');
    }
    setUpgrading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex gap-5 items-center">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=FF385C&color=fff&size=128`}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm"
              />
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user?.isHost
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {user?.isHost ? <><FiCheck className="w-3 h-3" /> Host</> : 'Guest'}
                  </span>
                  {!user?.isHost && (
                    showBecomeHostConfirm ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-600 dark:text-gray-300">Become a host?</span>
                        <button
                          onClick={handleBecomeHost}
                          disabled={upgrading}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {upgrading ? 'Upgrading...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setShowBecomeHostConfirm(false)}
                          className="text-gray-500 hover:underline ml-1"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={handleBecomeHost}
                        disabled={upgrading}
                        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FiAward className="w-3.5 h-3.5" /> {upgrading ? 'Upgrading...' : 'Become a Host'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-secondary !py-2 text-sm flex items-center gap-2 cursor-pointer"
            >
              <FiEdit2 className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                  <FiUser className="w-4 h-4" /> Full Name
                </label>
                {editing ? (
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-gray-900 dark:text-white">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                  <FiMail className="w-4 h-4" /> Email Address
                </label>
                <p className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed">
                  {user?.email}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                  <FiPhone className="w-4 h-4" /> Phone Number
                </label>
                {editing ? (
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91..."
                    className="input-field"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-gray-900 dark:text-white">
                    {user?.phone || 'Not added'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Avatar Image URL
                </label>
                {editing ? (
                  <input
                    value={form.avatar}
                    onChange={e => setForm({ ...form, avatar: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="input-field"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-gray-900 dark:text-white truncate">
                    {user?.avatar || 'Default avatar'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
                Bio / About You
              </label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us a little bit about yourself, travel interests, hobbies..."
                  className="input-field resize-none"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl min-h-[80px] text-gray-900 dark:text-white">
                  {user?.bio || 'No bio yet'}
                </p>
              )}
            </div>

            {editing && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary !py-2.5 !px-5 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
