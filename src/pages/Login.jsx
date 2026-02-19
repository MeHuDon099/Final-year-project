import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineBookOpen,
} from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login, signup, loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    if (currentUser) return <Navigate to="/" replace />;

    const validate = () => {
        const errs = {};
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Min 6 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            if (isSignup) {
                await signup(email, password);
                toast.success('Account created!');
            } else {
                await login(email, password);
                toast.success('Welcome back!');
            }
            navigate('/');
        } catch (err) {
            const msg =
                err.code === 'auth/user-not-found' ? 'No account found with this email'
                    : err.code === 'auth/wrong-password' ? 'Incorrect password'
                        : err.code === 'auth/email-already-in-use' ? 'Email already in use'
                            : err.code === 'auth/invalid-credential' ? 'Invalid email or password'
                                : 'Something went wrong. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            toast.success('Signed in with Google!');
            navigate('/');
        } catch {
            toast.error('Google sign-in failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                {/* Decorative blobs */}
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-purple-900/30 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-2xl" />

                <div className="relative z-10 flex flex-col justify-between p-14 text-white w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                            <HiOutlineBookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">LibraryMS</span>
                    </div>

                    {/* Main copy */}
                    <div>
                        <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight mb-5">
                            Your Library,<br />
                            <span className="text-indigo-200">Reimagined.</span>
                        </h1>
                        <p className="text-indigo-200 text-lg leading-relaxed max-w-sm mb-12">
                            Track books, manage members, and oversee borrowings — all from one beautiful dashboard.
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-8">
                            {[['500+', 'Books'], ['200+', 'Members'], ['99%', 'Uptime']].map(([val, label]) => (
                                <div key={label}>
                                    <div className="text-3xl font-bold">{val}</div>
                                    <div className="text-sm text-indigo-300 mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                        <p className="text-sm text-indigo-100 leading-relaxed mb-3">
                            "LibraryMS transformed how we manage our institution's reading program. It's fast, intuitive, and beautiful."
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-xs font-bold text-white">R</div>
                            <div>
                                <div className="text-xs font-semibold text-white">Riya Mehta</div>
                                <div className="text-xs text-indigo-300">Head Librarian, DPS</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10">
                <div className="w-full max-w-[22rem]">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <HiOutlineBookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">LibraryMS</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {isSignup ? 'Create account' : 'Sign in'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {isSignup
                                ? 'Start managing your library today'
                                : 'Welcome back! Please enter your details.'}
                        </p>
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-50 mb-5"
                    >
                        {googleLoading ? (
                            <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <FcGoogle className="w-5 h-5" />
                        )}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-medium">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${errors.email ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-400'}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500">⚠ {errors.email}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${errors.password ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-400'}`}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500">⚠ {errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 mt-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150 shadow-sm hover:shadow-lg shadow-indigo-200 cursor-pointer disabled:opacity-50"
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            )}
                            {isSignup ? 'Create Account' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
                            onClick={() => { setIsSignup(!isSignup); setErrors({}); }}
                        >
                            {isSignup ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
