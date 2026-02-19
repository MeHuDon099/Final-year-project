import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

function generateMembershipId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'LIB-';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        setErrors(errs);
        return Object.keys(errs).length === 0;
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
            toast.success('Member added successfully!');
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Member">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={errors.name}
                />
                <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                />
                <Input
                    label="Phone (optional)"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        Add Member
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
