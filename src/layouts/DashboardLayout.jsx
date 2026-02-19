import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
} from 'react-icons/hi2';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { to: '/members', icon: HiOutlineUsers, label: 'Members', adminOnly: true },
    { to: '/books', icon: HiOutlineBookmarkSquare, label: 'Books', adminOnly: true },
];

export default function DashboardLayout() {
    const { currentUser, role, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to log out');
        }
    };

    const filteredNav = navItems.filter(
        (item) => !item.adminOnly || role === 'admin'
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)]">
                <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white">
                    <HiOutlineBookOpen className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-[var(--color-text)]">LibraryMS</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${isActive
                                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text)]'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div className="border-t border-[var(--color-border)] p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">
                            {currentUser?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {role === 'admin' ? 'Admin / Librarian' : 'Member'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-danger)] hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-[var(--color-bg)]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-[var(--color-border)] fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-200 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Main */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] px-4 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-gray-100 cursor-pointer"
                        >
                            {sidebarOpen ? (
                                <HiOutlineXMark className="w-5 h-5" />
                            ) : (
                                <HiOutlineBars3 className="w-5 h-5" />
                            )}
                        </button>
                        <div className="flex items-center gap-3 ml-auto">
                            <span className="hidden sm:inline text-sm text-[var(--color-text-secondary)]">
                                {currentUser?.email}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
