import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { candidateService } from '../../services/candidateService';
import { cvFileMeta } from '../../utils/fileDisplay';

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
      <header className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">CV Manager</h2>
          <p className="text-on-surface-variant">Upload and manage your professional resume</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-sm shadow-md active:scale-95"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <span className="material-symbols-outlined">upload</span>
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
        <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center mb-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-3xl">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-lg flex-1">
          <div className="col-span-12 flex flex-col gap-lg">
            {/* Drag-and-drop zone */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl bg-surface-container p-xl flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-tertiary bg-tertiary/10'
                  : 'border-outline-variant hover:border-tertiary hover:bg-tertiary/5'
              } ${isUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}
            >
              <div className="w-16 h-16 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-tertiary text-4xl">cloud_upload</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-xs">
                {isUploading
                  ? 'Uploading your CV…'
                  : isDragging
                    ? 'Drop to upload'
                    : resumeUrl
                      ? 'Replace your CV'
                      : 'Upload your CV'}
              </h3>
              <p className="text-caption text-on-surface-variant mb-md">
                Drag and drop, or browse — PDF or DOCX up to 5MB
              </p>
              {isUploading ? (
                <div className="w-full max-w-xs">
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-caption text-on-surface-variant mt-xs">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="px-md py-xs bg-surface-container-highest rounded-full text-label-tag text-tertiary border border-tertiary/30">
                  BROWSE FILES
                </div>
              )}
            </div>

            {/* Current CV */}
            <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant">
              <div className="px-md py-sm border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
                <span className="font-bold text-on-surface text-sm">Current CV</span>
              </div>
              {resumeUrl ? (
                <div className="p-md flex items-center gap-md">
                  <a
                    href="#"
                    onClick={openResume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-md flex-1 overflow-hidden group"
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${cvMeta?.isPdf ? 'bg-red-900/20 text-error' : 'bg-blue-900/20 text-blue-400'}`}>
                      <span className="material-symbols-outlined">{cvMeta?.icon || 'description'}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-sm">
                        <p className="font-bold text-on-surface text-sm truncate group-hover:text-tertiary transition-colors">
                          {cvMeta?.label || 'My Resume'}
                        </p>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant">
                          {cvMeta?.ext || 'FILE'}
                        </span>
                      </div>
                      <p className="text-caption text-tertiary">
                        Active • Click to view{cvMeta?.uploadedLabel ? ` • Uploaded ${cvMeta.uploadedLabel}` : ''}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
                  </a>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete CV"
                    aria-label="Delete CV"
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">{isDeleting ? 'hourglass_empty' : 'delete'}</span>
                  </button>
                </div>
              ) : (
                <p className="p-md text-on-surface-variant text-sm">No CV uploaded yet.</p>
              )}
            </div>

            {/* CV Tips Card */}
            <div className="bg-surface-container-high rounded-xl p-lg border border-outline-variant relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-sm mb-md text-tertiary">
                <span className="material-symbols-outlined">lightbulb</span>
                <h4 className="font-bold text-sm uppercase tracking-wider">Expert CV Tips</h4>
              </div>
              <ul className="space-y-md">
                <li className="flex gap-md items-start">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-1">check_circle</span>
                  <div className="flex-1">
                    <p className="text-on-surface text-sm font-semibold">Use keywords</p>
                    <p className="text-caption text-on-surface-variant">Match your skills with job descriptions to pass ATS filters.</p>
                  </div>
                </li>
                <li className="flex gap-md items-start">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-1">check_circle</span>
                  <div className="flex-1">
                    <p className="text-on-surface text-sm font-semibold">Quantify results</p>
                    <p className="text-caption text-on-surface-variant">Use numbers (e.g., "Increased sales by 20%") to show impact.</p>
                  </div>
                </li>
                <li className="flex gap-md items-start">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-1">check_circle</span>
                  <div className="flex-1">
                    <p className="text-on-surface text-sm font-semibold">Keep it to 2 pages</p>
                    <p className="text-caption text-on-surface-variant">Conciseness is key. Focus on the last 10 years of experience.</p>
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
