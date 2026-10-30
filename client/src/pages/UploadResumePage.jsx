import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import ResumeDropzone from '../components/upload/ResumeDropzone.jsx';
import { useToast } from '../hooks/useToast.js';
import { resumeApi } from '../services/resumeApi.js';
import { analysisApi } from '../services/analysisApi.js';

export default function UploadResumePage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleAnalyze() {
    if (!file) {
      toast.warning('Please select a resume file first');
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const { data: uploadRes } = await resumeApi.upload(formData, (evt) => {
        setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      const resumeId = uploadRes?.data?.resumeId;

      const { data: analysisRes } = await analysisApi.create({
        resumeId,
        jobDescriptionText: jobDescription.trim() || undefined,
      });
      const analysisId = analysisRes?.data?.analysisId;

      toast.success('Resume uploaded — analyzing now');
      navigate(`/analysis/${analysisId}`);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Upload your resume</h1>
        <p className="text-sm text-ink_text-muted mt-1">
          PDF or DOCX, up to 5 MB. Add a job description for a tailored analysis.
        </p>
      </div>

      <Card>
        <CardHeader title="Resume file" subtitle="This is what Gemini will analyze" />
        <ResumeDropzone
          file={file}
          onFileSelect={setFile}
          onFileRemove={() => setFile(null)}
          disabled={isSubmitting}
        />
        {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
          <ProgressBar value={uploadProgress} label="Uploading" className="mt-4" />
        )}
      </Card>

      <Card>
        <CardHeader
          title="Target job description"
          subtitle="Optional — tailors keyword matching to a specific role"
        />
        <textarea
          rows={7}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="Paste the job description here to check your resume against role-specific keywords…"
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm focus:border-violet-400/60 focus:outline-none transition-colors resize-none disabled:opacity-50"
        />
        <p className="text-xs text-ink_text-faint mt-2">
          Leave blank for a general ATS-readiness analysis.
        </p>
      </Card>

      <Button
        onClick={handleAnalyze}
        isLoading={isSubmitting}
        disabled={!file}
        icon={Sparkles}
        iconPosition="right"
        size="lg"
        fullWidth
      >
        {isSubmitting ? 'Analyzing…' : 'Analyze resume'}
      </Button>
    </div>
  );
}
