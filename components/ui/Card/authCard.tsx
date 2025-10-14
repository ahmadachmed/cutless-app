
interface AuthCardProps {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
    title?: string;
}

const AuthCard = ({children, className = '', title, ...props}: AuthCardProps) => {
    return (
        <div className={`bg-[#F9F8F7] text-[#101010] bg-opacity-90 p-8 rounded-lg shadow-lg ${className}`} {...props}>
            <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
            {children}
        </div>
    );
}

export { AuthCard };