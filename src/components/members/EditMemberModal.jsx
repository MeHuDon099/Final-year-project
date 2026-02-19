import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500">⚠ {error}</p>}
    </div>
);

export default function EditMemberModal({ isOpen, onClose, member, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (member) setForm({ name: member.name || '', email: member.email || '', phone: member.phone || '' });
    }, [member]);

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
            await updateDoc(doc(db, 'members', member.id), {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim(),
                updatedAt: serverTimestamp(),
            });
            toast.success('Member updated!');
            onSuccess?.();
            onClose();
        } catch {
            toast.error('Failed to update member');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = (err) =>
        `w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${err ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-400'
        }`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Member">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full Name" error={errors.name}>
                    <input className={inputCls(errors.name)} placeholder="Full name" value={form.name} onChange={set('name')} />
                </Field>
                <Field label="Email" error={errors.email}>
                    <input type="email" className={inputCls(errors.email)} placeholder="email@example.com" value={form.email} onChange={set('email')} />
                </Field>
                <Field label="Phone (optional)">
                    <input type="tel" className={inputCls(false)} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
                </Field>
                <div className="flex justify-end gap-2.5 pt-1">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
