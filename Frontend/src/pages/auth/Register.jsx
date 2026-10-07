import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { toast } from '../../utils/toast';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);
  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim()
    }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully! Welcome to Homexa.');
      navigate('/');
    } else if (result.payload) {
      toast.error(result.payload);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Create account</h1>
            <p className="text-gray-600 mt-2">Start your journey with Homexa</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone (optional)</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" className="input-field pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500"><FiEyeOff className={showPass ? '' : 'hidden'} /><FiEye className={showPass ? 'hidden' : ''} /></button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary !py-3.5 !rounded-xl flex items-center justify-center gap-2">
              {loading ? 'Creating...' : <>Create account <FiArrowRight /></>}
            </button>
            <p className="text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-semibold text-gray-900 underline">Log in</Link></p>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="font-display text-4xl font-bold leading-tight">Host or travel, your way</h2>
          <p className="mt-4 text-white/80 max-w-md">Earn as a host or discover unique stays. AI tools make listing and planning effortless.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20"><p className="text-2xl font-bold">4.9★</p><p className="text-sm text-white/70">Trust rating</p></div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20"><p className="text-2xl font-bold">24/7</p><p className="text-sm text-white/70">Support</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
