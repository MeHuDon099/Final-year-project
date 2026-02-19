import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineBookOpen,
    HiOutlineCalendarDays,
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
                    return;
                }
                const q = query(collection(db, 'members', id, 'borrowings'), orderBy('borrowedAt', 'desc'));
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
            <div className="flex items-center justify-center py-24">
                <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!member) return null;

    const infoItems = [
        { icon: HiOutlineEnvelope, label: 'Email', value: member.email },
        { icon: HiOutlinePhone, label: 'Phone', value: member.phone || 'Not provided' },
        { icon: HiOutlineIdentification, label: 'Membership ID', value: member.membershipId, mono: true },
        { icon: HiOutlineBookOpen, label: 'Books Borrowed', value: member.borrowedBooks || 0 },
        {
            icon: HiOutlineCalendarDays,
            label: 'Member Since',
            value: member.createdAt?.toDate?.()
                ? member.createdAt.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'N/A',
        },
    ];

    return (
        <div className="space-y-6">
            <Button variant="ghost" icon={HiOutlineArrowLeft} onClick={() => navigate('/members')} size="sm">
                Back to Members
            </Button>

            {/* Profile hero */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                        {member.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-900">{member.name}</h1>
                        <p className="text-slate-400 text-sm mt-0.5">{member.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${(member.borrowedBooks || 0) > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                        {(member.borrowedBooks || 0) > 0 ? '📚' : '✅'}
                        {member.borrowedBooks || 0} book{(member.borrowedBooks || 0) !== 1 ? 's' : ''} borrowed
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Member info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-5">Member Information</h2>
                    <div className="space-y-4">
                        {infoItems.map((item) => (
                            <div key={item.label} className="flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <item.icon className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                                    <p className={`text-sm font-medium text-slate-800 ${item.mono ? 'font-mono' : ''}`}>
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Borrowing history */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-5">Borrowing History</h2>
                    {borrowingHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <HiOutlineBookOpen className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-400">No borrowing history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {borrowingHistory.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{entry.bookTitle}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {entry.borrowedAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${entry.returned
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                        }`}>
                                        {entry.returned ? 'Returned' : 'Active'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
