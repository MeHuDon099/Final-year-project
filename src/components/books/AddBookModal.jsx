import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

export default function AddBookModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: '', rackLocation: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.author.trim()) errs.author = 'Author is required';
        if (!form.totalCopies || Number(form.totalCopies) < 1) errs.totalCopies = 'At least 1 copy';
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const copies = Number(form.totalCopies);
            await addDoc(collection(db, 'books'), {
                title: form.title.trim(),
                author: form.author.trim(),
                isbn: form.isbn.trim(),
                category: form.category || 'Other',
                totalCopies: copies,
                availableCopies: copies,
                rackLocation: form.rackLocation.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            toast.success('Book added!');
            setForm({ title: '', author: '', isbn: '', category: '', totalCopies: '', rackLocation: '' });
            setErrors({});
            onSuccess?.();
            onClose();
        } catch {
            toast.error('Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Book" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Book Title" error={errors.title}>
                    <input className={inputCls(errors.title)} placeholder="e.g. The Great Gatsby" value={form.title} onChange={set('title')} />
                </Field>
                <Field label="Author" error={errors.author}>
                    <input className={inputCls(errors.author)} placeholder="e.g. F. Scott Fitzgerald" value={form.author} onChange={set('author')} />
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
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Total Copies" error={errors.totalCopies}>
                        <input type="number" min="1" className={inputCls(errors.totalCopies)} placeholder="e.g. 5" value={form.totalCopies} onChange={set('totalCopies')} />
                    </Field>
                    <Field label="Rack Location (optional)">
                        <input className={inputCls(false)} placeholder="e.g. A-12" value={form.rackLocation} onChange={set('rackLocation')} />
                    </Field>
                </div>
                <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                    📋 Available copies will be set equal to total copies by default.
                </p>
                <div className="flex justify-end gap-2.5 pt-1">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Add Book</Button>
                </div>
            </form>
        </Modal>
    );
}
