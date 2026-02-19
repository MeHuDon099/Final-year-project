import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
    HiOutlineBookOpen,
    HiOutlineUsers,
    HiOutlineClipboardDocumentList,
    HiOutlineCheckCircle,
    HiArrowUpRight,
} from 'react-icons/hi2';

export default function Dashboard() {
    const { currentUser, role } = useAuth();
    const [stats, setStats] = useState({ books: 0, members: 0, available: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (role !== 'admin') { setLoadingStats(false); return; }
        const fetchStats = async () => {
            try {
                const [booksSnap, membersSnap] = await Promise.all([
                    getDocs(collection(db, 'books')),
                    getDocs(collection(db, 'members')),
                ]);
                const books = booksSnap.docs.map(d => d.data());
                const totalAvailable = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
                const totalBorrowed = books.reduce((sum, b) => sum + ((b.totalCopies || 0) - (b.availableCopies || 0)), 0);
                setStats({
                    books: books.length,
                    members: membersSnap.size,
                    available: totalAvailable,
                    borrowed: totalBorrowed,
                });
            } catch { /* silent fail */ }
            finally { setLoadingStats(false); }
        };
        fetchStats();
    }, [role]);

    const statCards = [
        {
            label: 'Total Books',
            value: stats.books,
            icon: HiOutlineBookOpen,
            gradient: 'from-indigo-500 to-violet-600',
            linkTo: '/books',
        },
        {
            label: 'Total Members',
            value: stats.members,
            icon: HiOutlineUsers,
            gradient: 'from-emerald-500 to-teal-600',
            linkTo: '/members',
        },
        {
            label: 'Books Borrowed',
            value: stats.borrowed ?? '—',
            icon: HiOutlineClipboardDocumentList,
            gradient: 'from-amber-500 to-orange-500',
            linkTo: '/books',
        },
        {
            label: 'Available Now',
            value: stats.available,
            icon: HiOutlineCheckCircle,
            gradient: 'from-sky-500 to-cyan-500',
            linkTo: '/books',
        },
    ];

    const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'there';

    return (
        <div className="space-y-8">
            {/* Welcome banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/2 w-60 h-60 rounded-full bg-purple-900/30 blur-2xl" />
                <div className="relative z-10">
                    <p className="text-indigo-200 text-sm font-medium mb-1">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                        Hey, {name}! 👋
                    </h1>
                    <p className="text-indigo-200 max-w-lg">
                        {role === 'admin'
                            ? "Here's what's happening with your library today."
                            : 'Welcome to the library portal. Contact the librarian for assistance.'}
                    </p>
                </div>
            </div>

            {/* Stats — admin only */}
            {role === 'admin' && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((stat) => (
                            <Link
                                key={stat.label}
                                to={stat.linkTo}
                                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <HiArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {loadingStats ? (
                                            <span className="inline-block w-12 h-7 bg-slate-100 rounded-lg animate-pulse" />
                                        ) : stat.value}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { to: '/members', label: 'Manage Members', sub: 'Add, edit or view members', icon: HiOutlineUsers, color: 'text-emerald-600 bg-emerald-50' },
                                { to: '/books', label: 'Manage Books', sub: 'Add or update catalogue', icon: HiOutlineBookOpen, color: 'text-indigo-600 bg-indigo-50' },
                                { to: '/books', label: 'Track Borrowings', sub: 'View copies status', icon: HiOutlineClipboardDocumentList, color: 'text-amber-600 bg-amber-50' },
                            ].map((action) => (
                                <Link
                                    key={action.label}
                                    to={action.to}
                                    className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                                        <p className="text-xs text-slate-400 truncate">{action.sub}</p>
                                    </div>
                                    <HiArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors ml-auto shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Member view */}
            {role === 'member' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HiOutlineBookOpen className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">Welcome to the Library</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Contact the librarian to borrow books or manage your membership.
                    </p>
                </div>
            )}
        </div>
    );
}
