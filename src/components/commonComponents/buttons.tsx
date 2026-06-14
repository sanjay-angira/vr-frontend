

type ButtonProps = {
    type?: 'button' | 'submit' | 'reset';
    text: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    loadingText?: string;
    loading?: boolean;
}

const Button = ({
    type = 'button',
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
            className="w-full font-bold text-[15px] tracking-wide transition rounded-none !px-4 !py-3 border-0 leading-none"
            style={{
                background: disabled ? '#ccc' : 'oklch(33.34% 0.0022 311.797)',
                color: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            {loading ? loadingText : text}
        </button>
    );
};

const SecondryButton = ({
    type = 'button',
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
            className="w-full font-bold text-[15px] tracking-wide transition rounded-none !px-4 !py-3 border-0 leading-none"
            style={{
                background: disabled ? '#ccc' : 'white',
                color: 'black',
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            {loading ? loadingText : text}
        </button>
    );
};

type ButtonLinkProps = {
    type?: 'button' | 'submit' | 'reset';
    text: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    loadingText?: string;
    loading?: boolean;
}

const ButtonLink = ({
    type = 'button',
    text,
    onClick,
    disabled,
    loading,
    loadingText,
}: ButtonLinkProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="w-full font-bold text-[15px] tracking-wide transition rounded-none !px-4 !py-3 border-0 leading-none"
            style={{
                background: disabled ? '#ccc' : 'white',
                color: 'black',
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            {text}
        </button>
    );
};


export { Button, SecondryButton, ButtonLink }