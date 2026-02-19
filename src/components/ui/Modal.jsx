import { useEffect, useRef } from 'react';
import { HiXMark } from 'react-icons/hi2';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div
                className={`${sizeClasses[size]} w-full bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] transform transition-all duration-200 scale-100`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
