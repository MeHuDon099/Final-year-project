import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { issueBook, getDueDate, LOAN_DAYS, MAX_BORROW } from '../../lib/borrowing';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineUser,
    HiOutlineBookOpen,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

export default function IssueBookModal({ isOpen, onClose, onSuccess, preselectedMember = null }) {
    const [step, setStep] = useState(1); // 1=member, 2=book, 3=confirm
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(preselectedMember);
    const [selectedBook, setSelectedBook] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingMembers, setFetchingMembers] = useState(false);
    const [fetchingBooks, setFetchingBooks] = useState(false);

    // Reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(preselectedMember ? 2 : 1);
            setSelectedMember(preselectedMember);
            setSelectedBook(null);
            setMemberSearch('');
            setBookSearch('');
        }
    }, [isOpen, preselectedMember]);

    // Fetch members
    useEffect(() => {
        if (!isOpen) return;
        setFetchingMembers(true);
        getDocs(query(collection(db, 'members'), orderBy('name')))
            .then(snap => setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(() => toast.error('Failed to load members'))
            .finally(() => setFetchingMembers(false));
    }, [isOpen]);

    // Fetch available books
    useEffect(() => {
        if (!isOpen) return;
        setFetchingBooks(true);
        getDocs(query(collection(db, 'books'), orderBy('title')))
            .then(snap => setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(() => toast.error('Failed to load books'))
            .finally(() => setFetchingBooks(false));
    }, [isOpen]);

    const filteredMembers = members.filter(m => {
        const q = memberSearch.toLowerCase();
        return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.membershipId?.toLowerCase().includes(q);
    });

    const filteredBooks = books.filter(b => {
        const q = bookSearch.toLowerCase();
        return (!q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q));
    });

    const dueDate = getDueDate();

    const handleIssue = async () => {
        if (!selectedMember || !selectedBook) return;
        setLoading(true);
        try {
            await issueBook({
                memberId: selectedMember.id,
                memberName: selectedMember.name,
                membershipId: selectedMember.membershipId,
                bookId: selectedBook.id,
                bookTitle: selectedBook.title,
                bookAuthor: selectedBook.author,
            });
            toast.success(`"${selectedBook.title}" issued to ${selectedMember.name}!`);
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to issue book');
        } finally {
            setLoading(false);
        }
    };

    const memberBorrowFull = (selectedMember?.borrowedBooks ?? 0) >= MAX_BORROW;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Issue Book" size="md">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
                {['Member', 'Book', 'Confirm'].map((label, i) => {
                    const s = i + 1;
                    const active = step === s;
                    const done = step > s;
                    return (
                        <div key={label} className="flex items-center gap-2 flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {done ? '✓' : s}
                            </div>
                            <span className={`text-xs font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                            {i < 2 && <div className="flex-1 h-px bg-slate-100" />}
                        </div>
                    );
                })}
            </div>

            {/* ── Step 1: Select Member ── */}
            {step === 1 && (
                <div className="space-y-3">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={memberSearch}
                            onChange={e => setMemberSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {fetchingMembers ? (
                            <div className="text-center py-8"><div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                        ) : filteredMembers.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">No members found</p>
                        ) : filteredMembers.map(m => {
                            const full = (m.borrowedBooks ?? 0) >= MAX_BORROW;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => { setSelectedMember(m); setStep(2); }}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {m.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{m.membershipId} · {m.email}</p>
                                    </div>
                                    {full ? (
                                        <span className="text-[10px] font-semibold px-2 py-1 bg-red-50 text-red-500 rounded-full shrink-0">Limit reached</span>
                                    ) : (
                                        <span className="text-[10px] font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-full shrink-0">{m.borrowedBooks ?? 0}/{MAX_BORROW}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step 2: Select Book ── */}
            {step === 2 && (
                <div className="space-y-3">
                    {/* Selected member recap */}
                    <div className="flex items-center gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <HiOutlineUser className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{selectedMember?.name}</p>
                            <p className="text-xs text-slate-500">{selectedMember?.membershipId}</p>
                        </div>
                        {!preselectedMember && (
                            <button onClick={() => setStep(1)} className="text-xs text-indigo-500 hover:underline cursor-pointer">Change</button>
                        )}
                    </div>

                    {memberBorrowFull && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                            <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
                            Borrow limit reached for this member ({MAX_BORROW} books max).
                        </div>
                    )}

                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            value={bookSearch}
                            onChange={e => setBookSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                        />
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                        {fetchingBooks ? (
                            <div className="text-center py-8"><div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                        ) : filteredBooks.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">No books found</p>
                        ) : filteredBooks.map(b => {
                            const avail = (b.availableCopies ?? 0) > 0;
                            return (
                                <button
                                    key={b.id}
                                    disabled={!avail || memberBorrowFull}
                                    onClick={() => { setSelectedBook(b); setStep(3); }}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-left"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0">
                                        <HiOutlineBookOpen className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{b.title}</p>
                                        <p className="text-xs text-slate-400 truncate">by {b.author}</p>
                                    </div>
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${avail ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                                        {avail ? `${b.availableCopies} avail.` : 'Out'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === 3 && selectedMember && selectedBook && (
                <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                                {selectedMember.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{selectedMember.name}</p>
                                <p className="text-xs text-slate-400">{selectedMember.membershipId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                                <HiOutlineBookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{selectedBook.title}</p>
                                <p className="text-xs text-slate-400">by {selectedBook.author}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-3 flex items-center gap-2 text-sm">
                            <HiOutlineCalendarDays className="w-4 h-4 text-indigo-500" />
                            <span className="text-slate-500">Due date:</span>
                            <span className="font-semibold text-slate-800">
                                {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-slate-400">({LOAN_DAYS} days)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                        <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                        Copies after issue: {(selectedBook.availableCopies ?? 1) - 1} of {selectedBook.totalCopies}
                    </div>

                    <div className="flex gap-2.5">
                        <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                        <Button className="flex-1" loading={loading} onClick={handleIssue}>
                            Confirm Issue
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
