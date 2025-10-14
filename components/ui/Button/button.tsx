import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseClasses = "py-2 px-4 rounded font-semibold";
  const variantClasses = variant === 'primary' ? 'w-full bg-[#101010] py-3 rounded-md font-semibold text-[#F9F8F7] hover:bg-[#A2A2A2] transition-colors' :
                        variant === 'secondary' ? 'bg-gray-300 text-black hover:bg-gray-400' : '';
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export { Button };
