import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'icon' | 'transparent';
  className?: string;
}

const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseClasses = "py-4 px-4 rounded";
  const variantClasses = variant === 'primary' ? 'bg-[#101010] rounded-3xl text-[#F9F8F7] hover:bg-[#A2A2A2] transition-colors' :
    variant === 'secondary' ? 'bg-[#A2A2A2] text-black hover:bg-[#101010] hover:text-white transition-colors' :
      variant === 'icon' ? 'bg-transparent rounded-2xl border border-gray-400 text-black hover:bg-[#A2A2A2] hover:text-white transition-colors hover:border-transparent' :
        variant === 'transparent' ? 'bg-transparent rounded-2xl flex items-center justify-center text-white hover:bg-[#A2A2A2]/30 hover:text-white transition-colors hover:border-transparent' : '';
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export { Button };
