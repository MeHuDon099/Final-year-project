export default function Input({
    label,
    error,
    icon: Icon,
    helpText,
    className = '',
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700">{label}</label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    className={[
                        'w-full py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900',
                        'placeholder:text-slate-400',
                        'focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent',
                        'transition-all duration-150',
                        Icon ? 'pl-10 pr-3.5' : 'px-3.5',
                        error
                            ? 'border-red-300 focus:ring-red-400'
                            : 'border-slate-200 focus:ring-indigo-400',
                    ].join(' ')}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
            {helpText && !error && <p className="text-xs text-slate-400">{helpText}</p>}
        </div>
    );
}
