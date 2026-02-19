export default function Card({ children, className = '', hover = false, ...props }) {
    return (
        <div
            className={`bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] ${hover ? 'hover:shadow-[var(--shadow-md)] transition-shadow duration-200' : ''
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 border-b border-[var(--color-border)] ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
