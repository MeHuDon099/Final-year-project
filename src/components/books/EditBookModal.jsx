import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const CATEGORIES = [
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

export default function EditBookModal({ isOpen, onClose, book, onSuccess }) {
    const [form, setForm] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        totalCopies: '',
        availableCopies: '',
        rackLocation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (book) {
            setForm({
                title: book.title || '',
                author: book.author || '',
                isbn: book.isbn || '',
                category: book.category || '',
                totalCopies: String(book.totalCopies || ''),
                availableCopies: String(book.availableCopies || ''),
                rackLocation: book.rackLocation || '',
            });
        }
    }, [book]);

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.author.trim()) errs.author = 'Author is required';
        if (!form.totalCopies || Number(form.totalCopies) < 1)
            errs.totalCopies = 'At least 1 copy required';
        if (
            form.availableCopies !== '' &&
            Number(form.availableCopies) > Number(form.totalCopies)
        )
            errs.availableCopies = 'Cannot exceed total copies';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, 'books', book.id), {
                title: form.title.trim(),
                author: form.author.trim(),
                isbn: form.isbn.trim(),
                category: form.category || 'Other',
                totalCopies: Number(form.totalCopies),
                availableCopies: Number(form.availableCopies),
                rackLocation: form.rackLocation.trim(),
                updatedAt: serverTimestamp(),
            });
            toast.success('Book updated successfully!');
            onSuccess?.();
            onClose();
        } catch {
            toast.error('Failed to update book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Book" size="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Book Title"
                    placeholder="e.g. The Great Gatsby"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    error={errors.title}
                />
                <Input
                    label="Author"
                    placeholder="e.g. F. Scott Fitzgerald"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    error={errors.author}
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="ISBN (optional)"
                        placeholder="e.g. 978-0743273565"
                        value={form.isbn}
                        onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[var(--color-text)]">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Total Copies"
                        type="number"
                        min="1"
                        placeholder="e.g. 5"
                        value={form.totalCopies}
                        onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
                        error={errors.totalCopies}
                    />
                    <Input
                        label="Available"
                        type="number"
                        min="0"
                        placeholder="e.g. 3"
                        value={form.availableCopies}
                        onChange={(e) => setForm({ ...form, availableCopies: e.target.value })}
                        error={errors.availableCopies}
                    />
                    <Input
                        label="Rack Location"
                        placeholder="e.g. A-12"
                        value={form.rackLocation}
                        onChange={(e) => setForm({ ...form, rackLocation: e.target.value })}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
