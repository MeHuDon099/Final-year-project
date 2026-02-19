import { useAuth } from '../contexts/AuthContext';
import Card, { CardBody } from '../components/ui/Card';
import {
    HiOutlineBookOpen,
    HiOutlineUsers,
    HiOutlineClipboardDocumentList,
    HiOutlineChartBar,
} from 'react-icons/hi2';

const stats = [
    {
        label: 'Total Books',
        value: '—',
        icon: HiOutlineBookOpen,
        color: 'from-indigo-500 to-indigo-600',
        bg: 'bg-indigo-50',
        textColor: 'text-indigo-600',
    },
    {
        label: 'Total Members',
        value: '—',
        icon: HiOutlineUsers,
        color: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        textColor: 'text-emerald-600',
    },
    {
        label: 'Books Borrowed',
        value: '—',
        icon: HiOutlineClipboardDocumentList,
        color: 'from-amber-500 to-amber-600',
        bg: 'bg-amber-50',
        textColor: 'text-amber-600',
    },
    {
        label: 'Available Books',
        value: '—',
        icon: HiOutlineChartBar,
        color: 'from-cyan-500 to-cyan-600',
        bg: 'bg-cyan-50',
        textColor: 'text-cyan-600',
    },
];

export default function Dashboard() {
    const { currentUser, role } = useAuth();

    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                    Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    {role === 'admin'
                        ? "Here's an overview of your library"
                        : 'Welcome to the library portal'}
                </p>
            </div>

            {/* Stats grid */}
            {role === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <Card key={stat.label} hover>
                            <CardBody>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {stat.label}
                                        </p>
                                        <p className="text-3xl font-bold text-[var(--color-text)] mt-1">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                        <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quick actions for admin */}
            {role === 'admin' && (
                <Card>
                    <CardBody>
                        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <a
                                href="/members"
                                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors group"
                            >
                                <HiOutlineUsers className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                                    Manage Members
                                </span>
                            </a>
                            <a
                                href="/books"
                                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors group"
                            >
                                <HiOutlineBookOpen className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                                    Manage Books
                                </span>
                            </a>
                            <a
                                href="/books"
                                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors group"
                            >
                                <HiOutlineClipboardDocumentList className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                                    View Borrowings
                                </span>
                            </a>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Member view */}
            {role === 'member' && (
                <Card>
                    <CardBody>
                        <div className="text-center py-8">
                            <HiOutlineBookOpen className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                                Welcome to the Library
                            </h2>
                            <p className="text-[var(--color-text-secondary)]">
                                Contact the librarian for borrowing books or managing your membership.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
