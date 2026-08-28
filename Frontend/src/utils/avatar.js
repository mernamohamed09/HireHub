import { SERVER_URL } from '../services/api';

// Resolves a stored profileImage to a usable <img> src, or null when there's no
// image (callers then render an initials fallback instead of a broken image).
// Uploaded avatars are stored server-relative ("/uploads/avatars/..."), so they
// must be resolved against the backend origin; absolute URLs pass through.
export function avatarUrl(profileImage) {
  if (!profileImage) return null;
  if (/^https?:\/\//i.test(profileImage)) return profileImage;
  return `${SERVER_URL}${profileImage}`;
}

// First letter of a name for the initials fallback.
export function avatarInitial(name) {
  return name?.trim()?.[0]?.toUpperCase() || '?';
}
