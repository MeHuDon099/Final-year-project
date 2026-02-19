import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Button from '../components/ui/Button';
import ReturnBookModal from '../components/borrowing/ReturnBookModal';
import IssueBookModal from '../components/borrowing/IssueBookModal';
import toast from 'react-hot-toast';
import { computeStatus, computeFine } from '../lib/borrowing';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineBookOpen,
    HiOutlineCalendarDays,
    HiOutlineArrowUturnLeft,
    HiOutlineArrowsRightLeft,
} from 'react-icons/hi2';

const STATUS_STYLES = {
    issued: 'bg-sky-50 text-sky-700',
    returned: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-600',
};
const STATUS_LABELS = { issued: 'Issued', returned: 'Returned', overdue: 'Overdue' };

export default function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnTx, setReturnTx] = useState(null);
    const [showIssue, setShowIssue] = useState(false);

    const fetchData = async () => {
        // Fetch member doc
        try {
            const docSnap = await getDoc(doc(db, 'members', id));
            if (!docSnap.exists()) {
                toast.error('Member not found');
                navigate('/members');
                return;
            }
            setMember({ id: docSnap.id, ...docSnap.data() });
        } catch {
            toast.error('Failed to load member profile');
            setLoading(false);
            return;
        }

        // Fetch transactions (no orderBy — avoids composite index requirement, sort client-side)
        try {
            const q = query(
                collection(db, 'transactions'),
                where('memberId', '==', id)
            );
            const snap = await getDocs(q);
            const txList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Sort newest-first on the client
            txList.sort((a, b) => {
                const aTime = a.issuedAt?.toDate?.()?.getTime() ?? 0;
                const bTime = b.issuedAt?.toDate?.()?.getTime() ?? 0;
                return bTime - aTime;
            });
            setTransactions(txList);
        } catch {
            toast.error('Could not load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!member) return null;

    const enrichedTx = transactions.map(tx => ({
        ...tx,
        status: computeStatus(tx),
        fine: computeFine(tx),
    }));

    const infoItems = [
        { icon: HiOutlineEnvelope, label: 'Email', value: member.email },
        { icon: HiOutlinePhone, label: 'Phone', value: member.phone || 'Not provided' },
        { icon: HiOutlineIdentification, label: 'Membership ID', value: member.membershipId, mono: true },
        { icon: HiOutlineBookOpen, label: 'Books Currently Borrowed', value: member.borrowedBooks || 0 },
        {
            icon: HiOutlineCalendarDays,
            label: 'Member Since',
            value: member.createdAt?.toDate?.()
                ? member.createdAt.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'N/A',
        },
    ];

    const fmtDate = (ts) => {
        if (!ts) return '—';
        const d = ts?.toDate?.() ?? new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" icon={HiOutlineArrowLeft} onClick={() => navigate('/members')} size="sm">
                    Back to Members
                </Button>
                <Button icon={HiOutlineArrowsRightLeft} size="sm" onClick={() => setShowIssue(true)}>
                    Issue Book
                </Button>
            </div>

            {/* Profile hero */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Member info */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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

                {/* Borrowing history from transactions */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-slate-800">Borrowing History</h2>
                        <span className="text-xs text-slate-400">{enrichedTx.length} record{enrichedTx.length !== 1 ? 's' : ''}</span>
                    </div>
                    {enrichedTx.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <HiOutlineBookOpen className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-400">No borrowing history yet</p>
                            <button
                                onClick={() => setShowIssue(true)}
                                className="mt-3 text-xs text-indigo-600 hover:underline cursor-pointer"
                            >
                                Issue first book →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {enrichedTx.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{tx.bookTitle}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Issued: {fmtDate(tx.issuedAt)} · Due: {' '}
                                            <span className={tx.status === 'overdue' ? 'text-red-500 font-medium' : ''}>
                                                {fmtDate(tx.dueDate)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {tx.fine > 0 && (
                                            <span className="text-xs font-bold text-red-500">₹{tx.fine}</span>
                                        )}
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[tx.status]}`}>
                                            {STATUS_LABELS[tx.status]}
                                        </span>
                                        {tx.status !== 'returned' && (
                                            <button
                                                onClick={() => setReturnTx(tx)}
                                                title="Return book"
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                            >
                                                <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <IssueBookModal
                isOpen={showIssue}
                onClose={() => setShowIssue(false)}
                onSuccess={fetchData}
                preselectedMember={member}
            />
            <ReturnBookModal
                isOpen={!!returnTx}
                onClose={() => setReturnTx(null)}
                transaction={returnTx}
                onSuccess={fetchData}
            />
        </div>
    );
}
