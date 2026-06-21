import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-[#D4A853] text-[#111009] hover:bg-[#A07D35] active:scale-95',
    secondary: 'bg-transparent border border-[rgba(242,239,227,0.24)] text-[#F2EFE3] hover:bg-[#252219] hover:border-[rgba(212,168,83,0.4)]',
    ghost: 'bg-transparent text-[#D4A853] hover:bg-[rgba(212,168,83,0.1)]',
  };
  const sizes = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-6 text-base', lg: 'h-14 px-8 text-lg' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
