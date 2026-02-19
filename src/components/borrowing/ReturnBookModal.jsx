import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { returnBook, computeFine, FINE_PER_DAY } from '../../lib/borrowing';
import {
    HiOutlineBookOpen,
    HiOutlineCalendarDays,
    HiOutlineUser,
    HiOutlineCurrencyRupee,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';

export default function ReturnBookModal({ isOpen, onClose, onSuccess, transaction }) {
    const [loading, setLoading] = useState(false);

    if (!transaction) return null;

    const dueDate = transaction.dueDate?.toDate?.() ?? new Date(transaction.dueDate);
    const issuedAt = transaction.issuedAt?.toDate?.() ?? new Date(transaction.issuedAt);
    const fine = computeFine(transaction);
    const isOverdue = fine > 0;

    const handleReturn = async () => {
        setLoading(true);
        try {
            const calculatedFine = await returnBook(transaction.id, {
                memberId: transaction.memberId,
                bookId: transaction.bookId,
                dueDate: transaction.dueDate,
            });
            if (calculatedFine > 0) {
                toast.success(`Book returned. Fine: ₹${calculatedFine} 🔔`, { duration: 5000 });
            } else {
                toast.success('Book returned on time! ✅');
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to return book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Return Book" size="sm">
            <div className="space-y-4">
                {/* Book info */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                            <HiOutlineBookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{transaction.bookTitle}</p>
                            <p className="text-xs text-slate-400">by {transaction.bookAuthor}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <HiOutlineUser className="w-3.5 h-3.5" />
                        <span>{transaction.memberName} · {transaction.membershipId}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-400 flex items-center gap-1"><HiOutlineCalendarDays className="w-3.5 h-3.5" /> Issued</span>
                            <span className="font-medium text-slate-700">
                                {issuedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 flex items-center gap-1"><HiOutlineCalendarDays className="w-3.5 h-3.5" /> Due</span>
                            <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                                {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Fine box */}
                {isOverdue ? (
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-red-600">
                            <HiOutlineCurrencyRupee className="w-5 h-5" />
                            <div>
                                <p className="text-sm font-semibold">Late Fine</p>
                                <p className="text-xs text-red-400">₹{FINE_PER_DAY}/day overdue</p>
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-red-600">₹{fine}</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                        <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium">Returned on time — no fine!</span>
                    </div>
                )}

                <div className="flex gap-2.5">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" loading={loading} onClick={handleReturn}>
                        {isOverdue ? `Confirm Return (₹${fine} fine)` : 'Confirm Return'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
