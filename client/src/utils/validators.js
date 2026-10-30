export const emailPattern = {
  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Enter a valid email address',
};

export const passwordRules = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Use at least 8 characters' },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    message: 'Include an uppercase letter, lowercase letter, and a number',
  },
};

export const nameRules = {
  required: 'Name is required',
  minLength: { value: 2, message: 'Name is too short' },
};

export function isAllowedResumeFile(file) {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSizeBytes = 5 * 1024 * 1024;
  if (!file) return { valid: false, reason: 'No file selected' };
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, reason: 'Only PDF or DOCX files are supported' };
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, reason: 'File must be smaller than 5 MB' };
  }
  return { valid: true };
}
