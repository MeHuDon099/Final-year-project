export default function Card({ children, className = '', hover = false, ...props }) {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
