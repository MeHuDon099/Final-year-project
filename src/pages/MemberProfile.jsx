import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineBookOpen,
    HiOutlineCalendar,
} from 'react-icons/hi2';

export default function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [borrowingHistory, setBorrowingHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'members', id));
                if (docSnap.exists()) {
                    setMember({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error('Member not found');
                    navigate('/members');
                }

                // Fetch borrowing history
                const borrowingsRef = collection(db, 'members', id, 'borrowings');
                const q = query(borrowingsRef, orderBy('borrowedAt', 'desc'));
                const snap = await getDocs(q);
                setBorrowingHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch {
                toast.error('Failed to load member profile');
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!member) return null;

    const infoItems = [
        { icon: HiOutlineEnvelope, label: 'Email', value: member.email },
        { icon: HiOutlinePhone, label: 'Phone', value: member.phone || 'Not provided' },
        { icon: HiOutlineIdentification, label: 'Membership ID', value: member.membershipId },
        { icon: HiOutlineBookOpen, label: 'Books Borrowed', value: member.borrowedBooks || 0 },
        {
            icon: HiOutlineCalendar,
            label: 'Member Since',
            value: member.createdAt?.toDate?.()
                ? member.createdAt.toDate().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
                : 'N/A',
        },
    ];

    return (
        <div>
            {/* Back button */}
            <Button
                variant="ghost"
                icon={HiOutlineArrowLeft}
                onClick={() => navigate('/members')}
                className="mb-4"
            >
                Back to Members
            </Button>

            {/* Profile header */}
            <Card className="mb-6">
                <CardBody>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                            {member.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-text)]">{member.name}</h1>
                            <p className="text-[var(--color-text-secondary)]">{member.email}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Info */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-[var(--color-text)]">
                            Member Information
                        </h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {infoItems.map((item) => (
                                <div key={item.label} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                        <item.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--color-text-muted)]">{item.label}</p>
                                        <p className="text-sm font-medium text-[var(--color-text)]">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Borrowing history */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-[var(--color-text)]">
                            Borrowing History
                        </h2>
                    </CardHeader>
                    <CardBody>
                        {borrowingHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <HiOutlineBookOpen className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    No borrowing history yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {borrowingHistory.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-gray-50"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-text)]">
                                                {entry.bookTitle}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                Borrowed: {entry.borrowedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full font-medium ${entry.returned
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                                }`}
                                        >
                                            {entry.returned ? 'Returned' : 'Borrowed'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
