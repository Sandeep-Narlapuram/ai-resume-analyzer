import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary:
    'bg-gradient-to-r from-violet-500 to-aqua-500 text-white shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'glass text-ink_text-primary hover:bg-white/[0.08]',
  ghost: 'bg-transparent text-ink_text-primary hover:bg-white/[0.06]',
  outline: 'bg-transparent border border-white/15 text-ink_text-primary hover:border-violet-400/60',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
};

const SIZE_CLASSES = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed btn-focus-ring
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}
        ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
});

export default Button;
