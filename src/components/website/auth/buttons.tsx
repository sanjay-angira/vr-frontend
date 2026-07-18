import type { ReactNode } from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loadingText?: string;
  loading?: boolean;
  icon?: ReactNode;
};

const Button = ({
  type = "button",
  text,
  onClick,
  disabled,
  loading,
  loadingText,
  icon,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="auth-btn-primary"
    >
      {!loading && icon}
      <span>{loading ? loadingText : text}</span>
    </button>
  );
};

const SecondryButton = ({
  type = "button",
  text,
  onClick,
  disabled,
  loading,
  loadingText,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="auth-btn-secondary"
    >
      {loading ? loadingText : text}
    </button>
  );
};

type ButtonLinkProps = {
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loadingText?: string;
  loading?: boolean;
};

const ButtonLink = ({
  type = "button",
  text,
  onClick,
  disabled,
}: ButtonLinkProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="auth-btn-link"
    >
      {text}
    </button>
  );
};

type GoogleButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

const GoogleButton = ({ onClick, disabled }: GoogleButtonProps) => {
  return (
    <button
      type="button"
      className="auth-btn-google"
      onClick={onClick}
      disabled={disabled}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};

export { Button, SecondryButton, ButtonLink, GoogleButton };
