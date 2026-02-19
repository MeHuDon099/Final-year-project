const variants = {
    primary:
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm',
    secondary:
        'bg-white text-[var(--color-text)] border border-[var(--color-border)] hover:bg-gray-50 shadow-sm',
    danger:
        'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] shadow-sm',
    ghost:
        'bg-transparent text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text)]',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    ...props
}) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </button>
    );
}
