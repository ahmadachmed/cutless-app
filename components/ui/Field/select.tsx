import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children?: React.ReactNode;
}

const Select = ({className = "", children, ...props}: SelectProps) => {
  return (
    <select
      className={`w-full bg-[#EDEDEA] p-4 pr-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-transparent error:focus:ring-red-400" ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
export { Select };