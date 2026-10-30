import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { isAllowedResumeFile } from '../../utils/validators.js';
import { formatFileSize } from '../../utils/formatters.js';

export default function ResumeDropzone({ file, onFileSelect, onFileRemove, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const selected = fileList?.[0];
      if (!selected) return;
      const check = isAllowedResumeFile(selected);
      if (!check.valid) {
        setError(check.reason);
        return;
      }
      setError(null);
      onFileSelect(selected);
    },
    [onFileSelect]
  );

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  if (file) {
    return (
      <div className="glass-panel p-5 flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink_text-primary truncate">{file.name}</p>
          <p className="text-xs text-ink_text-faint font-mono">{formatFileSize(file.size)}</p>
        </div>
        {!disabled && (
          <button
            onClick={onFileRemove}
            aria-label="Remove file"
            className="p-2 rounded-lg text-ink_text-muted hover:text-rose-400 hover:bg-rose-400/10 btn-focus-ring"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload resume file"
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
          px-6 py-14 text-center cursor-pointer transition-all duration-200
          ${
            isDragging
              ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
              : 'border-white/15 hover:border-violet-400/50 hover:bg-white/[0.02]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300">
          <UploadCloud className="h-7 w-7" />
        </span>
        <div>
          <p className="text-sm font-medium text-ink_text-primary">
            Drag &amp; drop your resume, or <span className="text-violet-400">browse</span>
          </p>
          <p className="text-xs text-ink_text-faint mt-1">PDF or DOCX, up to 5 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
