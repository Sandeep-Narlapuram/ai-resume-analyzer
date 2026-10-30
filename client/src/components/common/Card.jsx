export default function Card({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={`glass-panel ${padding} ${
        hover ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
      <div>
        <h3 className="text-lg font-display font-semibold text-ink_text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-ink_text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
