import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { candidateService } from '../../services/candidateService';
import { cvFileMeta } from '../../utils/fileDisplay';
import { UploadCloud, CheckCircle2, Trash2, ExternalLink, FileText, Lightbulb, Loader2 } from 'lucide-react';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

const hasAcceptedExtension = (fileName) =>
  ACCEPTED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));

export function CVManager() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await candidateService.getMyProfile();
        setProfile(data.profile);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          setError('Failed to load your CV. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const uploadFile = async (file) => {
    if (!hasAcceptedExtension(file.name)) {
      setError('Only PDF and DOCX files are allowed.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      const data = await candidateService.uploadResume(file, setUploadProgress);
      setProfile(data.profile);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to upload CV.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your CV? You will need to upload one again before applying to jobs.')) return;

    try {
      setIsDeleting(true);
      setError(null);
      const data = await candidateService.deleteResume();
      setProfile(data.profile);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete CV.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openResume = async (event) => {
    event.preventDefault();
    try {
      const blob = await candidateService.downloadResume();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to open CV.');
    }
  };

  const resumeUrl = profile?.resumeUrl;
  const cvMeta = cvFileMeta(resumeUrl, profile?.updatedAt);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-bold text-3xl md:text-4xl text-white">CV Manager</h2>
          <p className="text-on-surface-variant font-medium mt-2">Upload and manage your professional resume</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2 shadow-lg bg-surface-container/50 border border-white/10 hover:border-white/30 hover:bg-white/5 text-white/90 transition-all"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <UploadCloud size={18} />
          {isUploading ? 'Uploading...' : resumeUrl ? 'Replace CV' : 'Upload New'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </header>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 text-red-400 shadow-none rounded-xl p-6 text-center mb-6 font-bold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={40} className="animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 flex-1">
          <div className="col-span-12 flex flex-col gap-8">
            {/* Drag-and-drop zone */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-400/10 shadow-none'
                  : 'border-white/20 hover:border-emerald-300 hover:bg-emerald-300/5 hover:shadow-none glass-card-pro border-white/5'
              } ${isUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}
            >
              <div className="w-20 h-20 rounded-full bg-surface-container border border-white/10 shadow-inner flex items-center justify-center mb-6">
                <UploadCloud size={40} className="text-emerald-300" />
              </div>
              <h3 className="font-bold text-2xl text-white mb-2">
                {isUploading
                  ? 'Uploading your CV…'
                  : isDragging
                    ? 'Drop to upload'
                    : resumeUrl
                      ? 'Replace your CV'
                      : 'Upload your CV'}
              </h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Drag and drop, or browse — PDF or DOCX up to 5MB
              </p>
              {isUploading ? (
                <div className="w-full max-w-xs">
                  <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-200 shadow-none"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-emerald-400 mt-2">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="px-6 py-2 bg-surface-container border border-white/10 hover:border-emerald-300 hover:text-emerald-300 rounded-xl text-xs font-bold text-white transition-all shadow-md uppercase tracking-wider">
                  BROWSE FILES
                </div>
              )}
            </div>

            {/* Current CV */}
            <div className="glass-card-pro border-white/5 rounded-2xl overflow-hidden group hover:border-emerald-400/50 transition-all relative">
              <div className="px-6 py-4 border-b border-white/10 bg-surface-container-high/50 flex justify-between items-center">
                <span className="font-bold text-white text-sm">Current CV</span>
              </div>
              {resumeUrl ? (
                <div className="p-6 flex items-center gap-6">
                  <a
                    href="#"
                    onClick={openResume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 flex-1 overflow-hidden group/link"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${cvMeta?.isPdf ? 'bg-red-900/20 text-red-400 border-red-400/30 shadow-none' : 'bg-blue-900/20 text-emerald-300 border-emerald-300/30 shadow-none'}`}>
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-white text-base truncate group-hover/link:text-emerald-300 transition-colors">
                          {cvMeta?.label || 'My Resume'}
                        </p>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-emerald-500 border border-emerald-500/30 shadow-none">
                          {cvMeta?.ext || 'FILE'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Active • Click to view{cvMeta?.uploadedLabel ? ` • Uploaded ${cvMeta.uploadedLabel}` : ''}
                      </p>
                    </div>
                    <ExternalLink size={20} className="text-on-surface-variant group-hover/link:text-emerald-300 transition-colors" />
                  </a>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete CV"
                    aria-label="Delete CV"
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/50 hover:shadow-none border border-transparent transition-all disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  </button>
                </div>
              ) : (
                <p className="p-6 text-on-surface-variant text-sm font-medium">No CV uploaded yet.</p>
              )}
            </div>

            {/* CV Tips Card */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-300/20 blur-3xl rounded-full"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Lightbulb size={24} className="text-emerald-300" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-white">Expert CV Tips</h4>
              </div>
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4 items-start">
                  <CheckCircle2 size={20} className="text-emerald-300 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold mb-1">Use keywords</p>
                    <p className="text-xs text-on-surface-variant">Match your skills with job descriptions to pass ATS filters.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 size={20} className="text-emerald-300 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold mb-1">Quantify results</p>
                    <p className="text-xs text-on-surface-variant">Use numbers (e.g., "Increased sales by 20%") to show impact.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 size={20} className="text-emerald-300 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold mb-1">Keep it to 2 pages</p>
                    <p className="text-xs text-on-surface-variant">Conciseness is key. Focus on the last 10 years of experience.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
