import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/Button';
import { ChangePasswordForm } from '../../components/ChangePasswordForm';
import { companyService } from '../../services/companyService';
import { Edit2, Building2, Globe, Calendar, Info, ExternalLink, AlertTriangle, AlertCircle } from 'lucide-react';

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
    <div className="w-full space-y-8 p-4 md:p-8 max-w-5xl mx-auto relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
      
      <header className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-surface-container/80 border border-white/10 flex items-center justify-center shadow-inner">
            <Building2 size={32} className="text-neon-cyan" />
          </div>
          <div>
            <h2 className="font-bold text-3xl md:text-4xl text-white mb-2">{profile?.companyName || user?.name}</h2>
            <p className="text-on-surface-variant font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-mint shadow-glow-mint"></span>
              {profile?.industry || 'No industry set yet'}
            </p>
          </div>
        </div>
        <Button variant="primary" className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-neon-purple to-neon-pink text-white border-none shadow-glow-purple hover:shadow-[0_0_30px_rgba(188,19,254,0.6)] transition-all px-6 py-3" onClick={startEditing}>
          <Edit2 size={16} />
          Edit Company Profile
        </Button>
      </header>

      {error && (
        <div className="bg-neon-pink/10 border border-neon-pink/30 text-neon-pink shadow-glow-pink rounded-2xl p-6 text-center font-bold flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="glass-panel rounded-3xl p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-cyan/10 blur-[100px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <h3 className="font-bold text-2xl text-white mb-6 relative z-10">Edit Company Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Company Name</label>
              <input className="w-full bg-surface-container/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple focus:shadow-glow-purple transition-all" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Industry</label>
              <input className="w-full bg-surface-container/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple focus:shadow-glow-purple transition-all" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Website</label>
              <input className="w-full bg-surface-container/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple focus:shadow-glow-purple transition-all" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Founded Year</label>
              <input type="number" className="w-full bg-surface-container/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple focus:shadow-glow-purple transition-all" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} />
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
            <textarea rows={4} className="w-full bg-surface-container/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-purple focus:shadow-glow-purple transition-all resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          
          <div className="flex gap-4 pt-4 relative z-10">
            <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-pink text-white border-none shadow-glow-purple flex-1 md:flex-none px-8 py-3" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="ghost" className="border-white/10 hover:bg-white/5 flex-1 md:flex-none px-8 py-3" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2 glass-card rounded-3xl p-8 shadow-xl group hover:border-neon-cyan/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
            <Info size={20} className="text-neon-cyan" />
            About
          </h3>
          <p className="text-on-surface-variant leading-relaxed">{profile?.description || 'No description added yet.'}</p>
        </section>

        <section className="glass-card rounded-3xl p-8 shadow-xl group hover:border-neon-orange/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neon-orange opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="font-bold text-xl text-white mb-6">Company Info</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Globe size={14} className="text-neon-orange" /> Website
              </p>
              {profile?.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-white hover:text-neon-orange transition-colors font-medium break-all flex items-center gap-1">
                  {profile.website} <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-on-surface-variant">Not set</p>
              )}
            </div>
            
            <div className="w-full h-px bg-white/5"></div>
            
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-neon-purple" /> Founded
              </p>
              <p className="text-white font-medium">{profile?.foundedYear || 'Not set'}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="pt-8">
        <ChangePasswordForm />
      </div>

      <section className="bg-neon-pink/5 rounded-3xl p-8 border border-neon-pink/20 shadow-[0_0_15px_rgba(255,42,109,0.1)] space-y-4">
        <h3 className="font-bold text-xl text-neon-pink flex items-center gap-2">
          <AlertTriangle size={20} /> Danger Zone
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">This action cannot be undone and will permanently delete your company profile data.</p>
        <Button variant="ghost" className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink hover:text-black transition-all px-6 py-3" onClick={handleDeleteProfile}>
          Delete Company Profile Data
        </Button>
      </section>
    </div>
  );
}
