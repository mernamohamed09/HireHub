import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export function UserDetailModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userService.getUserById(userId);
        setDetail(data.user);
      } catch {
        setError('Failed to load user details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div
        className="relative bg-surface-container rounded-xl border border-outline-variant shadow-2xl w-full max-w-md p-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-lg">
          <h3 className="font-h3 text-h3 text-on-surface">User Details</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-xl">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && <p className="text-error text-caption">{error}</p>}

        {detail && (
          <div className="space-y-md">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-xl">
                {detail.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-body font-bold text-on-surface">{detail.name}</p>
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{detail.role}</span>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-sm text-body">
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="col-span-2 text-on-surface">{detail.email}</dd>
              <dt className="text-on-surface-variant">Phone</dt>
              <dd className="col-span-2 text-on-surface">{detail.phone || 'Not set'}</dd>
              <dt className="text-on-surface-variant">Location</dt>
              <dd className="col-span-2 text-on-surface">{detail.location || 'Not set'}</dd>
              <dt className="text-on-surface-variant">Status</dt>
              <dd className="col-span-2 text-on-surface font-semibold">
                <span className={`px-sm py-xs rounded-full font-label-tag text-[10px] uppercase ${detail.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-error-container/40 text-error'}`}>
                  {detail.isActive !== false ? 'Active' : 'Suspended'}
                </span>
              </dd>
              <dt className="text-on-surface-variant">Joined</dt>
              <dd className="col-span-2 text-on-surface">{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : '-'}</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
