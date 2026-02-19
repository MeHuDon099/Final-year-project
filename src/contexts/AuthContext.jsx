import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

// Hardcoded admin/librarian emails — update these as needed
const ADMIN_EMAILS = [
    "yashraut361@gmail.com"
];

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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
                setRole(isAdmin ? 'admin' : 'member');
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
