import { useState, useEffect } from 'react';
import {
    collection, getDocs, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import IssueBookModal from '../components/borrowing/IssueBookModal';
import ReturnBookModal from '../components/borrowing/ReturnBookModal';
import toast from 'react-hot-toast';
import { computeStatus, computeFine } from '../lib/borrowing';
import {
    HiOutlinePlus,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowUturnLeft,
    HiOutlineArrowsRightLeft,
} from 'react-icons/hi2';

const STATUS_STYLES = {
    issued: 'bg-sky-50 text-sky-700 border border-sky-100',
    returned: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    overdue: 'bg-red-50 text-red-600 border border-red-100',
};

const STATUS_LABELS = { issued: 'Issued', returned: 'Returned', overdue: 'Overdue' };

const FILTERS = ['All', 'Issued', 'Returned', 'Overdue'];

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showIssue, setShowIssue] = useState(false);
    const [returnTx, setReturnTx] = useState(null);

    const fetchTransactions = async () => {
        try {
            const q = query(collection(db, 'transactions'), orderBy('issuedAt', 'desc'));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const enriched = transactions.map(tx => ({
        ...tx,
        status: computeStatus(tx),
        fine: computeFine(tx),
    }));

    const filtered = enriched.filter(tx => {
        const matchFilter = filter === 'All' || tx.status === filter.toLowerCase();
        const q = search.toLowerCase();
        const matchSearch = !q ||
            tx.memberName?.toLowerCase().includes(q) ||
            tx.bookTitle?.toLowerCase().includes(q) ||
            tx.membershipId?.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    const counts = {
        All: enriched.length,
        Issued: enriched.filter(t => t.status === 'issued').length,
        Returned: enriched.filter(t => t.status === 'returned').length,
        Overdue: enriched.filter(t => t.status === 'overdue').length,
    };

    const fmtDate = (ts) => {
        if (!ts) return '—';
        const d = ts?.toDate?.() ?? new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Transactions</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Track all book borrowings and returns</p>
                </div>
                <button
                    onClick={() => setShowIssue(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    Issue Book
                </button>
            </div>

            {/* Search + filter chips */}
            <div className="space-y-3">
                <div className="relative max-w-sm">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search member or book..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${filter === f
                                    ? f === 'Overdue' ? 'bg-red-500 text-white' : f === 'Returned' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                                }`}
                        >
                            {f}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                {counts[f]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <HiOutlineArrowsRightLeft className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-700">
                            {search || filter !== 'All' ? 'No transactions match your filters' : 'No transactions yet'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            {!search && filter === 'All' ? 'Issue a book to create the first transaction' : 'Try clearing the filters'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Member</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Book</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Issued</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Due</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Returned</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Fine</th>
                                    <th className="px-5 py-3.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-800">{tx.memberName}</p>
                                            <p className="text-xs text-slate-400 font-mono">{tx.membershipId}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{tx.bookTitle}</p>
                                            <p className="text-xs text-slate-400 line-clamp-1">by {tx.bookAuthor}</p>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell text-sm text-slate-500">{fmtDate(tx.issuedAt)}</td>
                                        <td className={`px-5 py-4 hidden md:table-cell text-sm font-medium ${tx.status === 'overdue' ? 'text-red-500' : 'text-slate-500'}`}>
                                            {fmtDate(tx.dueDate)}
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-500">{fmtDate(tx.returnedAt)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[tx.status]}`}>
                                                {STATUS_LABELS[tx.status]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            {tx.fine > 0 ? (
                                                <span className="text-sm font-bold text-red-500">₹{tx.fine}</span>
                                            ) : (
                                                <span className="text-sm text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {tx.status !== 'returned' && (
                                                <button
                                                    onClick={() => setReturnTx(tx)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" /> Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
                        <p className="text-xs text-slate-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                )}
            </div>

            <IssueBookModal isOpen={showIssue} onClose={() => setShowIssue(false)} onSuccess={fetchTransactions} />
            <ReturnBookModal isOpen={!!returnTx} onClose={() => setReturnTx(null)} transaction={returnTx} onSuccess={fetchTransactions} />
        </div>
    );
}
