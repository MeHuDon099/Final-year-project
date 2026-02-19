import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext(null);

// Hardcoded admin/librarian emails — update these as needed
const ADMIN_EMAILS = [
    "yashraut361@gmail.com"
];

/** Generates a random Membership ID like LIB-A3K7F2 */
function generateMembershipId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'LIB-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Ensures a Firestore member document exists for the given Firebase user.
 * Uses setDoc with merge:true — safe to call on every login (idempotent).
 * Admins are skipped since they are librarians, not library members.
 */
async function ensureMemberDoc(user, isAdmin) {
    if (isAdmin) return; // admins are librarians, not members
    const ref = doc(db, 'members', user.uid);
    await setDoc(ref, {
        name: user.displayName || user.email.split('@')[0],
        email: user.email.toLowerCase(),
        phone: '',
        membershipId: generateMembershipId(), // only written on first create (merge)
        borrowedBooks: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true }); // merge:true → only creates doc if it doesn't exist; won't overwrite existing fields
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
                setRole(isAdmin ? 'admin' : 'member');
                // Auto-create member document on every sign-in (idempotent)
                try {
                    await ensureMemberDoc(user, isAdmin);
                } catch (err) {
                    console.warn('Could not create member doc:', err);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = (email, password) =>
        createUserWithEmailAndPassword(auth, email, password);

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

    const logout = () => signOut(auth);

    const value = {
        currentUser,
        role,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
