// The CV is stored under a machine-generated name like
// "cv-<userId>-<timestampMs>-<random>.pdf". Showing that raw string is ugly and
// leaks ids, so derive a clean, human-friendly presentation from it.
export function cvFileMeta(resumeUrl, fallbackDate) {
  if (!resumeUrl) return null;

  const raw = resumeUrl.split('/').pop() || '';
  const ext = (raw.includes('.') ? raw.split('.').pop() : '').toUpperCase();

  // The 13-digit millisecond timestamp embedded by the upload middleware.
  const match = raw.match(/-(\d{13})-/);
  const uploadedAt = match ? new Date(Number(match[1])) : (fallbackDate ? new Date(fallbackDate) : null);

  const isPdf = ext === 'PDF';

  return {
    // A stable, friendly label instead of the generated filename.
    label: `My Resume.${ext.toLowerCase() || 'pdf'}`,
    ext: ext || 'FILE',
    isPdf,
    icon: isPdf ? 'picture_as_pdf' : 'description',
    uploadedAt,
    uploadedLabel: uploadedAt
      ? uploadedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
  };
}
