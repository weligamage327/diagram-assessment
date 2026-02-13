import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import './ProfileActionButton.css';

interface ProfileActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'secondary' | 'danger';
    icon?: ReactNode;
    isLoading?: boolean;
    children: ReactNode;
}

export const ProfileActionButton = ({
    variant = 'secondary',
    icon,
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ProfileActionButtonProps) => {
    return (
        <button
            className={`profile-action-btn profile-action-btn-${variant} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : icon ? (
                <span className="profile-action-btn-icon">{icon}</span>
            ) : null}
            <span>{children}</span>
        </button>
    );
};
