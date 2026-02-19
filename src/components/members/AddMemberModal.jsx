import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

function generateMembershipId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'LIB-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500">⚠ {error}</p>}
    </div>
);

export default function AddMemberModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'members'), {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim(),
                membershipId: generateMembershipId(),
                borrowedBooks: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            toast.success('Member added!');
            setForm({ name: '', email: '', phone: '' });
            setErrors({});
            onSuccess?.();
            onClose();
        } catch {
            toast.error('Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = (err) =>
        `w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${err ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-400'
        }`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Member">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full Name" error={errors.name}>
                    <input className={inputCls(errors.name)} placeholder="e.g. Priya Sharma" value={form.name} onChange={set('name')} />
                </Field>
                <Field label="Email" error={errors.email}>
                    <input type="email" className={inputCls(errors.email)} placeholder="priya@example.com" value={form.email} onChange={set('email')} />
                </Field>
                <Field label="Phone (optional)">
                    <input type="tel" className={inputCls(false)} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
                </Field>
                <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                    🔑 A unique Membership ID (LIB-XXXXXX) will be auto-generated.
                </p>
                <div className="flex justify-end gap-2.5 pt-1">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Add Member</Button>
                </div>
            </form>
        </Modal>
    );
}
