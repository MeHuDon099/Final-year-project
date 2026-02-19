import { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
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

const CATEGORIES = [
    'All',
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'History',
    'Biography',
    'Self-Help',
    'Education',
    'Other',
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
        } catch (err) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

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
        const matchesSearch =
            b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === 'All' || b.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Books</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Manage your library book catalogue
                    </p>
                </div>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>
                    Add Book
                </Button>
            </div>

            {/* Search + Category filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="max-w-md flex-1">
                    <Input
                        placeholder="Search by title, author, or ISBN..."
                        icon={HiOutlineMagnifyingGlass}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${categoryFilter === cat
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-100 text-[var(--color-text-secondary)] hover:bg-gray-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Books grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <div className="text-center py-16">
                        <HiOutlineBookOpen className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                        <p className="text-lg font-medium text-[var(--color-text)]">
                            {searchTerm || categoryFilter !== 'All' ? 'No books match your search' : 'No books yet'}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {searchTerm || categoryFilter !== 'All'
                                ? 'Try adjusting your filters'
                                : 'Add your first book to get started'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((book) => (
                        <Card key={book.id} hover className="flex flex-col">
                            {/* Book cover placeholder */}
                            <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-[var(--radius-lg)] flex items-center justify-center">
                                <HiOutlineBookOpen className="w-12 h-12 text-indigo-300" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 mb-1">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                                    by {book.author}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {book.category && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                            <HiOutlineTag className="w-3 h-3" />
                                            {book.category}
                                        </span>
                                    )}
                                    {book.rackLocation && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-[var(--color-text-secondary)]">
                                            <HiOutlineMapPin className="w-3 h-3" />
                                            {book.rackLocation}
                                        </span>
                                    )}
                                </div>

                                {/* Copies info */}
                                <div className="mt-auto flex items-center justify-between text-xs mb-3">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Total: <span className="font-semibold text-[var(--color-text)]">{book.totalCopies}</span>
                                    </span>
                                    <span
                                        className={`font-semibold ${(book.availableCopies || 0) > 0 ? 'text-emerald-600' : 'text-[var(--color-danger)]'
                                            }`}
                                    >
                                        {book.availableCopies || 0} available
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditBook(book)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(book)}
                                        className="flex items-center justify-center p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <AddBookModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchBooks}
            />

            {/* Edit Modal */}
            {editBook && (
                <EditBookModal
                    isOpen={!!editBook}
                    onClose={() => setEditBook(null)}
                    book={editBook}
                    onSuccess={fetchBooks}
                />
            )}

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Book"
                size="sm"
            >
                <p className="text-[var(--color-text-secondary)] mb-6">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-[var(--color-text)]">
                        {deleteTarget?.title}
                    </span>
                    ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
