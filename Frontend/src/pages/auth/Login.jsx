import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-600 mt-2">Log in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary !py-3.5 !rounded-xl flex items-center justify-center gap-2">
              {loading ? 'Logging in...' : <>Continue <FiArrowRight /></>}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account? <Link to="/register" className="font-semibold text-gray-900 underline">Sign up</Link>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-500 uppercase tracking-wide">Demo credentials</span></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span><strong className="text-gray-900">Guest:</strong> guest@demo.com / password123</span>
                <button type="button" onClick={() => fillDemo('guest@demo.com', 'password123')} className="text-brand font-semibold hover:underline">Use</button>
              </div>
              <div className="flex items-center justify-between">
                <span><strong className="text-gray-900">Host:</strong> host@demo.com / password123</span>
                <button type="button" onClick={() => fillDemo('host@demo.com', 'password123')} className="text-brand font-semibold hover:underline">Use</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gray-900 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="font-display text-4xl font-bold leading-tight">Find homes that feel like yours</h2>
          <p className="mt-4 text-gray-300 max-w-md">Join thousands of travelers discovering unique stays with AI-powered recommendations.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
