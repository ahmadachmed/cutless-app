
const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`w-full bg-[#EDEDEA] p-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-transparent error:focus:ring-red-400 ${className}`}
            {...props}
        />
    );
}

export { Input };