import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ReturnBookModal from '../components/borrowing/ReturnBookModal';
import toast from 'react-hot-toast';
import { computeStatus, computeFine } from '../lib/borrowing';
import {
    HiOutlineBookOpen,
    HiOutlineCalendarDays,
    HiOutlineCurrencyRupee,
    HiOutlineArrowUturnLeft,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineClock,
} from 'react-icons/hi2';

const STATUS_STYLES = {
    issued: { card: 'border-sky-100', badge: 'bg-sky-50 text-sky-700', icon: HiOutlineClock },
    returned: { card: 'border-emerald-100', badge: 'bg-emerald-50 text-emerald-700', icon: HiOutlineCheckCircle },
    overdue: { card: 'border-red-100', badge: 'bg-red-50 text-red-600', icon: HiOutlineExclamationCircle },
};
const STATUS_LABELS = { issued: 'Issued', returned: 'Returned', overdue: 'Overdue' };

export default function MyBorrows() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [returnTx, setReturnTx] = useState(null);

    const fetchTx = async () => {
        if (!currentUser) return;
        try {
            const q = query(
                collection(db, 'transactions'),
                where('memberId', '==', currentUser.uid)
            );
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => {
                const at = a.issuedAt?.toDate?.()?.getTime() ?? 0;
                const bt = b.issuedAt?.toDate?.()?.getTime() ?? 0;
                return bt - at;
            });
            setTransactions(list);
        } catch {
            toast.error('Failed to load borrowing history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTx(); }, [currentUser]);

    const enriched = transactions.map(tx => ({
        ...tx,
        status: computeStatus(tx),
        fine: computeFine(tx),
    }));

    const filtered = filter === 'All' ? enriched : enriched.filter(tx => tx.status === filter.toLowerCase());

    const totalFine = enriched.reduce((sum, tx) => sum + tx.fine, 0);
    const activeBorrows = enriched.filter(tx => tx.status !== 'returned').length;
    const overdueCount = enriched.filter(tx => tx.status === 'overdue').length;

    const fmtDate = (ts) => {
        if (!ts) return '—';
        const d = ts?.toDate?.() ?? new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const FILTERS = ['All', 'Issued', 'Returned', 'Overdue'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900">My Borrows</h1>
                <p className="text-sm text-slate-400 mt-0.5">Your borrowing history and outstanding fines</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-slate-900">{activeBorrows}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Currently Borrowed</p>
                </div>
                <div className={`rounded-2xl border shadow-sm p-4 text-center ${overdueCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                    <p className={`text-2xl font-extrabold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{overdueCount}</p>
                    <p className={`text-xs mt-0.5 font-medium ${overdueCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>Overdue</p>
                </div>
                <div className={`rounded-2xl border shadow-sm p-4 text-center ${totalFine > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
                    <p className={`text-2xl font-extrabold ${totalFine > 0 ? 'text-amber-600' : 'text-slate-900'}`}>₹{totalFine}</p>
                    <p className={`text-xs mt-0.5 font-medium ${totalFine > 0 ? 'text-amber-500' : 'text-slate-400'}`}>Total Fine</p>
                </div>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${filter === f
                                ? f === 'Overdue' ? 'bg-red-500 text-white' : f === 'Returned' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                            }`}
                    >
                        {f}
                        <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                            {f === 'All' ? enriched.length : enriched.filter(t => t.status === f.toLowerCase()).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <HiOutlineBookOpen className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-700">
                        {filter !== 'All' ? `No ${filter.toLowerCase()} books` : 'No borrows yet'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {filter !== 'All' ? 'Try a different filter' : 'Visit the library to borrow books'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(tx => {
                        const s = STATUS_STYLES[tx.status];
                        const StatusIcon = s.icon;
                        return (
                            <div key={tx.id} className={`bg-white rounded-2xl border ${s.card} shadow-sm p-4`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0">
                                        <HiOutlineBookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{tx.bookTitle}</p>
                                                <p className="text-xs text-slate-400">by {tx.bookAuthor}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {STATUS_LABELS[tx.status]}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                                Issued: {fmtDate(tx.issuedAt)}
                                            </span>
                                            <span className={`flex items-center gap-1 ${tx.status === 'overdue' ? 'text-red-500 font-semibold' : ''}`}>
                                                <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                                Due: {fmtDate(tx.dueDate)}
                                            </span>
                                            {tx.returnedAt && (
                                                <span className="flex items-center gap-1 text-emerald-500">
                                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                                    Returned: {fmtDate(tx.returnedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {tx.fine > 0 && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold">
                                                <HiOutlineCurrencyRupee className="w-3.5 h-3.5" />
                                                Fine: ₹{tx.fine}
                                                {tx.finePaid && <span className="text-emerald-500 ml-1">(Paid)</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ReturnBookModal
                isOpen={!!returnTx}
                onClose={() => setReturnTx(null)}
                transaction={returnTx}
                onSuccess={fetchTx}
            />
        </div>
    );
}
