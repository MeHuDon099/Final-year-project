import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineBookOpen } from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
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
                toast.success('Account created successfully!');
            } else {
                await login(email, password);
                toast.success('Welcome back!');
            }
            navigate('/');
        } catch (err) {
            const msg =
                err.code === 'auth/user-not-found'
                    ? 'No account found with this email'
                    : err.code === 'auth/wrong-password'
                        ? 'Incorrect password'
                        : err.code === 'auth/email-already-in-use'
                            ? 'Email already in use'
                            : 'Something went wrong. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await loginWithGoogle();
            toast.success('Signed in with Google!');
            navigate('/');
        } catch (err) {
            toast.error('Google sign-in failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <HiOutlineBookOpen className="w-7 h-7" />
                        </div>
                        <span className="text-2xl font-bold">LibraryMS</span>
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-4">
                        Manage Your Library<br />
                        <span className="text-indigo-200">With Ease</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-md leading-relaxed">
                        A modern library management system to track books, members, and borrowings — all in one place.
                    </p>
                    <div className="mt-12 flex gap-8 text-indigo-200">
                        <div>
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-sm">Books Managed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">200+</div>
                            <div className="text-sm">Active Members</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">99%</div>
                            <div className="text-sm">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--color-bg)]">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white">
                            <HiOutlineBookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-[var(--color-text)]">LibraryMS</span>
                    </div>

                    <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8">
                        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                            {isSignup ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mb-6">
                            {isSignup
                                ? 'Sign up to get started with LibraryMS'
                                : 'Sign in to continue to your dashboard'}
                        </p>

                        {/* Google button */}
                        <button
                            onClick={handleGoogle}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-[var(--color-text)] font-medium hover:bg-gray-50 transition-colors cursor-pointer mb-6"
                        >
                            <FcGoogle className="w-5 h-5" />
                            Continue with Google
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-border)]" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-[var(--color-text-muted)]">
                                    or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                icon={HiOutlineEnvelope}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={errors.email}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={HiOutlineLockClosed}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                            />
                            <Button type="submit" loading={loading} className="w-full mt-2">
                                {isSignup ? 'Create Account' : 'Sign In'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
                            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setErrors({});
                                }}
                            >
                                {isSignup ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
