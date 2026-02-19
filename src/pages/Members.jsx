import { useState, useEffect } from 'react';
import {
    collection, getDocs, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import Button from '../components/ui/Button';
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
        } catch {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMembers(); }, []);

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

    const filtered = members.filter((m) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.membershipId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const initials = (name) => (name?.[0] || '?').toUpperCase();

    const avatarGradients = [
        'from-indigo-500 to-violet-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-500',
        'from-sky-500 to-cyan-500',
        'from-rose-500 to-pink-600',
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Members</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Manage library members</p>
                </div>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>
                    Add Member
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search name, email or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <HiOutlineUsers className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-700">
                            {searchTerm ? 'No members match your search' : 'No members yet'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            {searchTerm ? 'Try a different keyword' : 'Click "Add Member" to get started'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Member</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">ID</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Phone</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Borrowed</th>
                                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((member, i) => (
                                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                                {initials(member.name)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                                                <p className="text-xs text-slate-400">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                            {member.membershipId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="text-sm text-slate-500">{member.phone || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${(member.borrowedBooks || 0) > 0
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {member.borrowedBooks || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/members/${member.id}`)}
                                                title="View profile"
                                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                            >
                                                <HiOutlineEye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditMember(member)}
                                                title="Edit"
                                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                            >
                                                <HiOutlinePencilSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(member)}
                                                title="Delete"
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Footer row */}
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
                        <p className="text-xs text-slate-400">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                )}
            </div>

            <AddMemberModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchMembers} />
            {editMember && (
                <EditMemberModal isOpen={!!editMember} onClose={() => setEditMember(null)} member={editMember} onSuccess={fetchMembers} />
            )}

            {/* Delete confirm */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Member" size="sm">
                <p className="text-sm text-slate-500 mb-6">
                    Delete <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2.5">
                    <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}
