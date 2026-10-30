export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  return `${formatDate(date)} · ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function scoreBand(score) {
  if (score >= 80) return { label: 'Strong', tone: 'success' };
  if (score >= 55) return { label: 'Needs work', tone: 'warning' };
  return { label: 'Weak', tone: 'danger' };
}

export function scoreColor(score) {
  if (score >= 80) return '#34D399';
  if (score >= 55) return '#FBBF24';
  return '#FB7185';
}

export function truncate(text, length = 80) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export function initialsFromName(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
