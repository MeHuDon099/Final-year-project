export default function Input({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-[var(--color-text)]">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    className={`w-full px-3 py-2.5 text-sm bg-white border rounded-[var(--radius-md)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 ${Icon ? 'pl-10' : ''
                        } ${error
                            ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
                            : 'border-[var(--color-border)]'
                        }`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-[var(--color-danger)]">{error}</p>
            )}
        </div>
    );
}
