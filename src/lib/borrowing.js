import {
    runTransaction,
    doc,
    collection,
    addDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Constants ─────────────────────────────────────────────────────────────────
export const LOAN_DAYS = 14;   // days before book is due
export const MAX_BORROW = 3;    // max books a member can hold
export const FINE_PER_DAY = 2;   // ₹ per overdue day

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Returns a Date LOAN_DAYS after fromDate */
export function getDueDate(fromDate = new Date()) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + LOAN_DAYS);
    return d;
}

/**
 * Derives the display status of a transaction.
 * @returns {'issued'|'returned'|'overdue'}
 */
export function computeStatus(tx) {
    if (tx.returnedAt) return 'returned';
    const due = tx.dueDate?.toDate?.() ?? new Date(tx.dueDate);
    return new Date() > due ? 'overdue' : 'issued';
}

/**
 * Calculates fine in ₹ — FINE_PER_DAY × overdue days.
 * If not yet returned, uses today as the return date.
 */
export function computeFine(tx) {
    const due = tx.dueDate?.toDate?.() ?? new Date(tx.dueDate);
    const end = tx.returnedAt
        ? (tx.returnedAt?.toDate?.() ?? new Date(tx.returnedAt))
        : new Date();
    const daysLate = Math.max(0, Math.ceil((end - due) / (1000 * 60 * 60 * 24)));
    return daysLate * FINE_PER_DAY;
}

// ── Firestore mutations ───────────────────────────────────────────────────────

/**
 * Issue a book to a member (atomic).
 * Throws descriptive errors suitable for toast.error().
 */
export async function issueBook({
    memberId, memberName, membershipId,
    bookId, bookTitle, bookAuthor,
}) {
    const memberRef = doc(db, 'members', memberId);
    const bookRef = doc(db, 'books', bookId);

    // We collect data from the Firestore transaction then addDoc outside
    let txData = null;

    await runTransaction(db, async (t) => {
        const [memberSnap, bookSnap] = await Promise.all([
            t.get(memberRef),
            t.get(bookRef),
        ]);

        if (!memberSnap.exists()) throw new Error('Member not found.');
        if (!bookSnap.exists()) throw new Error('Book not found.');

        const member = memberSnap.data();
        const book = bookSnap.data();

        if ((book.availableCopies ?? 0) < 1)
            throw new Error('No copies available for this book right now.');
        if ((member.borrowedBooks ?? 0) >= MAX_BORROW)
            throw new Error(`Borrow limit reached — this member already has ${MAX_BORROW} books.`);

        const now = new Date();
        const dueDate = getDueDate(now);

        t.update(memberRef, { borrowedBooks: (member.borrowedBooks ?? 0) + 1 });
        t.update(bookRef, { availableCopies: book.availableCopies - 1 });

        txData = { memberId, memberName, membershipId, bookId, bookTitle, bookAuthor, now, dueDate };
    });

    // addDoc must be called outside runTransaction
    const ref = await addDoc(collection(db, 'transactions'), {
        memberId: txData.memberId,
        memberName: txData.memberName,
        membershipId: txData.membershipId,
        bookId: txData.bookId,
        bookTitle: txData.bookTitle,
        bookAuthor: txData.bookAuthor,
        issuedAt: Timestamp.fromDate(txData.now),
        dueDate: Timestamp.fromDate(txData.dueDate),
        returnedAt: null,
        fine: 0,
        finePaid: false,
    });

    return ref.id;
}

/**
 * Process a book return (atomic).
 * Calculates fine, marks transaction as returned.
 * Returns the fine amount (₹).
 */
export async function returnBook(transactionId, { memberId, bookId, dueDate }) {
    const txRef = doc(db, 'transactions', transactionId);
    const memberRef = doc(db, 'members', memberId);
    const bookRef = doc(db, 'books', bookId);

    const now = new Date();
    const due = dueDate?.toDate?.() ?? new Date(dueDate);
    const daysLate = Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
    const fine = daysLate * FINE_PER_DAY;

    await runTransaction(db, async (t) => {
        const [memberSnap, bookSnap] = await Promise.all([
            t.get(memberRef),
            t.get(bookRef),
        ]);

        if (!memberSnap.exists()) throw new Error('Member not found.');
        if (!bookSnap.exists()) throw new Error('Book not found.');

        const member = memberSnap.data();
        const book = bookSnap.data();

        t.update(txRef, {
            returnedAt: Timestamp.fromDate(now),
            fine,
        });
        t.update(memberRef, {
            borrowedBooks: Math.max(0, (member.borrowedBooks ?? 1) - 1),
        });
        t.update(bookRef, {
            availableCopies: (book.availableCopies ?? 0) + 1,
        });
    });

    return fine;
}
