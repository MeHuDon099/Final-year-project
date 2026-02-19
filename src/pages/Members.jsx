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
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import AddMemberModal from '../components/members/AddMemberModal';
import EditMemberModal from '../components/members/EditMemberModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlinePlus,
    HiOutlineMagnifyingGlass,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineUsers,
} from 'react-icons/hi2';

export default function Members() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editMember, setEditMember] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate();

    const fetchMembers = async () => {
        try {
            const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDoc(doc(db, 'members', deleteTarget.id));
            toast.success('Member deleted');
            setDeleteTarget(null);
            fetchMembers();
        } catch {
            toast.error('Failed to delete member');
        }
    };

    const filtered = members.filter(
        (m) =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.membershipId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Members</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Manage library members and their information
                    </p>
                </div>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>
                    Add Member
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md">
                <Input
                    placeholder="Search by name, email, or ID..."
                    icon={HiOutlineMagnifyingGlass}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    Member
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hidden sm:table-cell">
                                    Membership ID
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">
                                    Phone
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hidden lg:table-cell">
                                    Books Borrowed
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <HiOutlineUsers className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
                                        <p className="text-[var(--color-text-secondary)]">
                                            {searchTerm ? 'No members match your search' : 'No members yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {member.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-text)]">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-sm text-[var(--color-text-secondary)] font-mono">
                                                {member.membershipId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-[var(--color-text-secondary)]">
                                                {member.phone || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                {member.borrowedBooks || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/members/${member.id}`)}
                                                    className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
                                                    title="View profile"
                                                >
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditMember(member)}
                                                    className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencilSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(member)}
                                                    className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-50 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Modal */}
            <AddMemberModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchMembers}
            />

            {/* Edit Modal */}
            {editMember && (
                <EditMemberModal
                    isOpen={!!editMember}
                    onClose={() => setEditMember(null)}
                    member={editMember}
                    onSuccess={fetchMembers}
                />
            )}

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Member"
                size="sm"
            >
                <p className="text-[var(--color-text-secondary)] mb-6">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-[var(--color-text)]">
                        {deleteTarget?.name}
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
