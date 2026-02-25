import type { ButtonHTMLAttributes, ReactNode, JSX } from "react";
import styles from "../Button/Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

export const Button = ({
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps): JSX.Element => {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};