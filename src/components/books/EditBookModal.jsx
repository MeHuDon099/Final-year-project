import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-Help', 'Education', 'Other'];

const inputCls = (err) =>
    `w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${err ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-400'
    }`;

const Field = ({ label, error, children, className = '' }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500">⚠ {error}</p>}
    </div>
);

export default function EditBookModal({ isOpen, onClose, book, onSuccess }) {
    const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: '', availableCopies: '', rackLocation: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (book) {
            setForm({
                title: book.title || '',
                author: book.author || '',
                isbn: book.isbn || '',
                category: book.category || '',
                totalCopies: String(book.totalCopies ?? ''),
                availableCopies: String(book.availableCopies ?? ''),
                rackLocation: book.rackLocation || '',
            });
        }
    }, [book]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.author.trim()) errs.author = 'Author is required';
        if (!form.totalCopies || Number(form.totalCopies) < 1) errs.totalCopies = 'At least 1 copy';
        if (form.availableCopies !== '' && Number(form.availableCopies) > Number(form.totalCopies))
            errs.availableCopies = 'Cannot exceed total';
        setErrors(errs);
        return !Object.keys(errs).length;
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
            toast.success('Book updated!');
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Book Title" error={errors.title}>
                    <input className={inputCls(errors.title)} placeholder="Book title" value={form.title} onChange={set('title')} />
                </Field>
                <Field label="Author" error={errors.author}>
                    <input className={inputCls(errors.author)} placeholder="Author name" value={form.author} onChange={set('author')} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="ISBN (optional)">
                        <input className={inputCls(false)} placeholder="978-..." value={form.isbn} onChange={set('isbn')} />
                    </Field>
                    <Field label="Category">
                        <select
                            value={form.category}
                            onChange={set('category')}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                        >
                            <option value="">Select...</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Total Copies" error={errors.totalCopies}>
                        <input type="number" min="1" className={inputCls(errors.totalCopies)} value={form.totalCopies} onChange={set('totalCopies')} />
                    </Field>
                    <Field label="Available" error={errors.availableCopies}>
                        <input type="number" min="0" className={inputCls(errors.availableCopies)} value={form.availableCopies} onChange={set('availableCopies')} />
                    </Field>
                    <Field label="Rack">
                        <input className={inputCls(false)} placeholder="A-12" value={form.rackLocation} onChange={set('rackLocation')} />
                    </Field>
                </div>
                <div className="flex justify-end gap-2.5 pt-1">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
