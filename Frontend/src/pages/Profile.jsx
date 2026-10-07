import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave } from 'react-icons/fi';

const Profile = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const handleSave = async () => {
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      setEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-5">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=FF385C&color=fff&size=128`} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
                <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
                <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-medium">{user?.isHost ? 'Host' : 'Guest'} • {user?.role}</span>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-secondary !py-2 text-sm flex items-center gap-2">
              <FiEdit2 className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1"><FiUser className="w-4 h-4" /> Full Name</label>
                {editing ? <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /> : <p className="p-3 bg-gray-50 rounded-xl">{user?.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1"><FiMail className="w-4 h-4" /> Email</label>
                <p className="p-3 bg-gray-50 rounded-xl text-gray-600">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1"><FiPhone className="w-4 h-4" /> Phone</label>
                {editing ? <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91..." className="input-field" /> : <p className="p-3 bg-gray-50 rounded-xl">{user?.phone || 'Not added'}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Avatar URL</label>
                {editing ? <input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." className="input-field" /> : <p className="p-3 bg-gray-50 rounded-xl truncate">{user?.avatar || 'Default avatar'}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              {editing ? <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Tell us about yourself..." className="input-field resize-none" /> : <p className="p-3 bg-gray-50 rounded-xl min-h-[80px]">{user?.bio || 'No bio yet'}</p>}
            </div>

            {editing && (
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2"><FiSave /> Save changes</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
