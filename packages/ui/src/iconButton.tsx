"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName?: string;
  handleClick?: () => void
}

export const IconButton = ({ children, className, appName, handleClick }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
