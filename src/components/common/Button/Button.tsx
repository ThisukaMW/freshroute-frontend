import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

/* ---- allowed button variants ---- */
type ButtonVariant = "primary" | "secondary" | "ghost";

/* ---- props type ---- */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...rest
}) => {
  const classes = [
    styles.button,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};