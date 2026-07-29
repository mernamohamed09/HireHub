import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/Button';
import { ChangePasswordForm } from '../../components/ChangePasswordForm';
import { companyService } from '../../services/companyService';

export function Profile() {
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ companyName: '', industry: '', description: '', website: '', foundedYear: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await companyService.getMyProfile();
        setProfile(data.profile);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          setError('Failed to load company profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const startEditing = () => {
    setForm({
      companyName: profile?.companyName || user?.name || '',
      industry: profile?.industry || '',
      description: profile?.description || '',
      website: profile?.website || '',
      foundedYear: profile?.foundedYear || '',
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const data = await companyService.updateMyProfile({
        companyName: form.companyName,
        industry: form.industry,
        description: form.description,
        website: form.website,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
      });
      setProfile(data.profile);
      setIsEditing(false);
    } catch {
      setError('Failed to save company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Delete your company profile data (industry, description, website)? Your account and job posts will stay.')) return;
    try {
      await companyService.deleteMyProfile();
      setProfile(null);
    } catch {
      setError('Failed to delete company profile.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3xl">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-gutter">
      <header className="glass-panel rounded-xl p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md shadow-md">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">{profile?.companyName || user?.name}</h2>
          <p className="text-on-surface-variant text-body">{profile?.industry || 'No industry set yet'}</p>
        </div>
        <Button variant="primary" className="flex items-center gap-sm" onClick={startEditing}>
          <span className="material-symbols-outlined">edit</span>
          Edit Company Profile
        </Button>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center">
          {error}
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="bg-surface-container rounded-xl p-lg border border-outline-variant space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface mb-sm">Edit Company Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-caption text-on-surface-variant font-medium mb-1">Company Name</label>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div>
              <label className="block text-caption text-on-surface-variant font-medium mb-1">Industry</label>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" />
            </div>
            <div>
              <label className="block text-caption text-on-surface-variant font-medium mb-1">Website</label>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-caption text-on-surface-variant font-medium mb-1">Founded Year</label>
              <input type="number" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-caption text-on-surface-variant font-medium mb-1">Description</label>
            <textarea rows={4} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-sm">
            <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <section className="bg-surface-container rounded-xl p-lg border border-outline-variant">
        <h3 className="font-h3 text-h3 text-on-surface mb-sm">About</h3>
        <p className="text-on-surface-variant">{profile?.description || 'No description added yet.'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-lg">
          <div>
            <p className="text-caption text-on-surface-variant">Website</p>
            <p className="text-on-surface">{profile?.website || 'Not set'}</p>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant">Founded</p>
            <p className="text-on-surface">{profile?.foundedYear || 'Not set'}</p>
          </div>
        </div>
      </section>

      <ChangePasswordForm />

      <section className="bg-error-container/10 rounded-xl p-lg border border-error/20 space-y-md">
        <h3 className="font-h3 text-h3 text-error">Danger Zone</h3>
        <Button variant="outline" className="border-error text-error hover:bg-error/10" onClick={handleDeleteProfile}>
          Delete Company Profile Data
        </Button>
      </section>
    </div>
  );
}
