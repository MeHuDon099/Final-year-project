import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineBookOpen,
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineBookmarkSquare,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark,
    HiMiniBookOpen,
} from 'react-icons/hi2';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { to: '/members', icon: HiOutlineUsers, label: 'Members', adminOnly: true },
    { to: '/books', icon: HiOutlineBookmarkSquare, label: 'Books', adminOnly: true },
];

function Avatar({ name, email, size = 'md' }) {
    const initials = (name?.[0] || email?.[0] || '?').toUpperCase();
    const s = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    return (
        <div className={`${s} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0`}>
            {initials}
        </div>
    );
}

export default function DashboardLayout() {
    const { currentUser, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/login');
        } catch {
            toast.error('Failed to log out');
        }
    };

    const filteredNav = navItems.filter((item) => !item.adminOnly || role === 'admin');

    // Current page title
    const currentNav = filteredNav.find((n) =>
        n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
                    <HiMiniBookOpen className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight">LibraryMS</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 pt-1 pb-4 space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-3 pb-2">
                    Navigation
                </p>
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-indigo-50 text-indigo-700 [&>svg]:text-indigo-600'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 transition-colors" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="border-t border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-3 px-1">
                    <Avatar name={currentUser?.displayName} email={currentUser?.email} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {role === 'admin' ? '👑 Admin / Librarian' : '🎓 Member'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30 shadow-sm">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-200 ease-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Main content */}
            <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 h-14 flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                        {sidebarOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
                    </button>

                    <div className="flex-1">
                        <h1 className="text-sm font-semibold text-slate-800">
                            {currentNav?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-xs text-slate-400 truncate max-w-[180px]">
                            {currentUser?.email}
                        </span>
                        <Avatar name={currentUser?.displayName} email={currentUser?.email} size="sm" />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
