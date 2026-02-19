import { useState, useEffect } from 'react';
import {
    collection, getDocs, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AddBookModal from '../components/books/AddBookModal';
import EditBookModal from '../components/books/EditBookModal';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus,
    HiOutlineMagnifyingGlass,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineBookOpen,
    HiOutlineMapPin,
    HiOutlineTag,
} from 'react-icons/hi2';

const CATEGORIES = ['All', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-Help', 'Education', 'Other'];

const CATEGORY_COLORS = {
    Fiction: 'bg-violet-50 text-violet-700 border-violet-100',
    'Non-Fiction': 'bg-sky-50 text-sky-700 border-sky-100',
    Science: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Technology: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    History: 'bg-amber-50 text-amber-700 border-amber-100',
    Biography: 'bg-orange-50 text-orange-700 border-orange-100',
    'Self-Help': 'bg-pink-50 text-pink-700 border-pink-100',
    Education: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    Other: 'bg-slate-50 text-slate-600 border-slate-100',
};

const BOOK_GRADIENTS = [
    'from-indigo-400 to-violet-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-sky-400 to-cyan-500',
    'from-purple-400 to-fuchsia-500',
];

export default function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchBooks = async () => {
        try {
            const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDoc(doc(db, 'books', deleteTarget.id));
            toast.success('Book deleted');
            setDeleteTarget(null);
            fetchBooks();
        } catch {
            toast.error('Failed to delete book');
        }
    };

    const filtered = books.filter((b) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
            b.title?.toLowerCase().includes(term) ||
            b.author?.toLowerCase().includes(term) ||
            b.isbn?.toLowerCase().includes(term);
        return matchesSearch && (categoryFilter === 'All' || b.category === categoryFilter);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Books</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Manage your library catalogue</p>
                </div>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>
                    Add Book
                </Button>
            </div>

            {/* Search + Category chips */}
            <div className="space-y-3">
                <div className="relative max-w-sm">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search title, author or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${categoryFilter === cat
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HiOutlineBookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-700">
                        {searchTerm || categoryFilter !== 'All' ? 'No books match your filters' : 'No books yet'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm || categoryFilter !== 'All' ? 'Try different search terms' : 'Click "Add Book" to get started'}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-xs text-slate-400">{filtered.length} book{filtered.length !== 1 ? 's' : ''}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((book, i) => {
                            const gradient = BOOK_GRADIENTS[i % BOOK_GRADIENTS.length];
                            const catColor = CATEGORY_COLORS[book.category] || CATEGORY_COLORS.Other;
                            const availPct = book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0;
                            return (
                                <div
                                    key={book.id}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                                >
                                    {/* Book spine / cover art */}
                                    <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
                                        <HiOutlineBookOpen className="w-12 h-12 text-white/70" />
                                        {/* Available badge */}
                                        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${book.availableCopies > 0 ? 'bg-white/90 text-emerald-700' : 'bg-white/90 text-red-500'
                                            }`}>
                                            {book.availableCopies > 0 ? `${book.availableCopies} avail.` : 'Out'}
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-0.5">{book.title}</h3>
                                        <p className="text-xs text-slate-400 mb-3">by {book.author}</p>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {book.category && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catColor}`}>
                                                    <HiOutlineTag className="w-2.5 h-2.5" />{book.category}
                                                </span>
                                            )}
                                            {book.rackLocation && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-50 text-slate-500 border-slate-100">
                                                    <HiOutlineMapPin className="w-2.5 h-2.5" />{book.rackLocation}
                                                </span>
                                            )}
                                        </div>

                                        {/* Copies bar */}
                                        <div className="mt-auto mb-3">
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>{book.availableCopies || 0}/{book.totalCopies || 0} available</span>
                                                <span>{Math.round(availPct)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${availPct > 50 ? 'bg-emerald-400' : availPct > 20 ? 'bg-amber-400' : 'bg-red-400'
                                                        }`}
                                                    style={{ width: `${availPct}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditBook(book)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                            >
                                                <HiOutlinePencilSquare className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(book)}
                                                className="p-2 rounded-xl text-slate-400 bg-slate-100 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <HiOutlineTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <AddBookModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchBooks} />
            {editBook && (
                <EditBookModal isOpen={!!editBook} onClose={() => setEditBook(null)} book={editBook} onSuccess={fetchBooks} />
            )}

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Book" size="sm">
                <p className="text-sm text-slate-500 mb-6">
                    Delete <span className="font-semibold text-slate-800">"{deleteTarget?.title}"</span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2.5">
                    <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}
