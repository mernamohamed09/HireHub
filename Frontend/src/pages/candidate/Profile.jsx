import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { ChangePasswordForm } from '../../components/ChangePasswordForm';
import { candidateService } from '../../services/candidateService';
import { userService } from '../../services/userService';
import { setUser } from '../../store/slices/authSlice';
import { avatarUrl } from '../../utils/avatar';
import { Camera, Edit2, Sparkles, Loader2, User, Building2, MapPin, Mail, Phone, ExternalLink, FileText, Briefcase } from 'lucide-react';

const emptyExperience = () => ({ position: '', company: '', startDate: '', endDate: '', description: '' });
const emptyEducation = () => ({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
const emptyForm = () => ({
  title: '',
  bio: '',
  skills: '',
  phone: '',
  location: '',
  experience: [],
  education: [],
  socialLinks: { linkedin: '', github: '', portfolio: '', website: '' },
});

export function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const data = await userService.uploadAvatar(file);
      dispatch(setUser({ profileImage: data.user.profileImage }));
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to upload picture');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleAutofill = async () => {
    try {
      setIsAutofilling(true);
      const data = await candidateService.autofillFromResume();
      const s = data.suggestions || {};
      setForm((prev) => ({
        ...prev,
        title: s.title || prev.title,
        bio: s.bio || prev.bio,
        skills: s.skills?.length ? s.skills.join(', ') : prev.skills,
        phone: s.contact?.phone || prev.phone,
        location: s.contact?.location || prev.location,
        experience: s.experience?.length ? s.experience : prev.experience,
        education: s.education?.length ? s.education : prev.education,
        socialLinks: {
          ...prev.socialLinks,
          ...Object.fromEntries(
            Object.entries(s.socialLinks || {}).filter(([, value]) => Boolean(value))
          ),
        },
      }));
      if (s.warnings?.length) toast.info(s.warnings.join(' '));
      toast.success('Filled from your CV — review and save');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not autofill from CV');
    } finally {
      setIsAutofilling(false);
    }
  };

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
          setError('Failed to load profile. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const startEditing = () => {
    setForm({
      title: profile?.title || '',
      bio: profile?.bio || '',
      skills: (profile?.skills || []).join(', '),
      phone: user?.phone || '',
      location: user?.location || '',
      experience: profile?.experience?.length ? profile.experience : [],
      education: profile?.education?.length ? profile.education : [],
      socialLinks: { ...emptyForm().socialLinks, ...(profile?.socialLinks || {}) },
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        title: form.title,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: form.experience.map((item) => ({
          ...item,
          startDate: item.startDate || null,
          endDate: item.endDate || null,
        })),
        education: form.education.map((item) => ({
          ...item,
          graduationYear: item.graduationYear ? Number(item.graduationYear) : undefined,
        })),
        socialLinks: form.socialLinks,
      };
      const data = await candidateService.updatePortfolio(
        payload,
        { phone: form.phone, location: form.location }
      );
      setProfile(data.profile);
      dispatch(setUser(data.user));
      setIsEditing(false);
      toast.success('Profile updated');
    } catch {
      setError('Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateListItem = (field, index, key, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeListItem = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const openResume = async (event) => {
    event.preventDefault();
    try {
      const blob = await candidateService.downloadResume();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error('Could not open your CV');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Delete your candidate profile data (title, bio, skills, experience, education, CV)? Your account will stay.')) return;
    try {
      await candidateService.deleteMyProfile();
      setProfile(null);
    } catch {
      setError('Failed to delete profile.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-400/10 border border-amber-400/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] rounded-xl p-6 text-center font-bold">
        {error}
      </div>
    );
  }

  const experience = profile?.experience || [];
  const education = profile?.education || [];
  const skills = profile?.skills || [];

  return (
    <div className="w-full">
      {/* Header Profile Card */}
      <header className="glass-card-pro rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative group/avatar">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-surface-container flex items-center justify-center">
              {avatarUrl(user?.profileImage) ? (
                <img className="w-full h-full object-cover" alt={user?.name} src={avatarUrl(user.profileImage)} />
              ) : (
                <User size={48} className="text-white/20" />
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              title="Change profile picture"
              aria-label="Change profile picture"
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)] hover:scale-105 transition-all disabled:opacity-60"
            >
              {isUploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h2 className="font-bold text-3xl text-white mb-2">{user?.name || 'Candidate'}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant font-medium">
              <span className="bg-surface-container-high px-3 py-1 rounded-md border border-white/5 text-emerald-400">{profile?.title || 'No title added yet'}</span>
              {user?.location && (
                <span className="flex items-center gap-1 bg-surface-container-high px-3 py-1 rounded-md border border-white/5"><MapPin size={14} className="text-amber-500" />{user.location}</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="primary" className="flex items-center gap-2 transition-all shadow-none bg-gradient-to-r from-emerald-500 to-amber-400 border-none relative z-10 text-white" onClick={startEditing}>
          <Edit2 size={16} />
          Edit Profile
        </Button>
      </header>

      {isEditing && (
        <form onSubmit={handleSave} className="glass-card-pro p-8 mb-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[100px] rounded-full"></div>
          <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
            <h3 className="font-bold text-2xl text-white">Edit Profile</h3>
            <Button
              type="button"
              variant="outline"
              onClick={handleAutofill}
              disabled={isAutofilling}
              className="flex items-center gap-2 border-emerald-400/50 text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
              title="Fill these fields from your uploaded CV"
            >
              {isAutofilling ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isAutofilling ? 'Reading your CV…' : 'Autofill from CV'}
            </Button>
          </div>
          
          <div className="relative z-10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Title</label>
            <input
              className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Senior Product Designer"
            />
          </div>
          
          <div className="relative z-10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Bio</label>
            <textarea
              className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          
          <div className="relative z-10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Skills (comma separated)</label>
            <input
              className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="React, Figma, TypeScript"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Phone</label>
              <input
                className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Location</label>
              <input
                className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <fieldset className="border border-white/10 rounded-2xl p-6 relative z-10 bg-surface-container/50">
            <legend className="px-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Professional links</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(form.socialLinks).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">{key}</label>
                  <input
                    type="url"
                    className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                    value={value}
                    onChange={(e) => setForm({
                      ...form,
                      socialLinks: { ...form.socialLinks, [key]: e.target.value },
                    })}
                    placeholder="https://"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="border border-white/10 rounded-2xl p-6 space-y-6 relative z-10 bg-surface-container/50">
            <div className="flex items-center justify-between">
              <legend className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Work experience</legend>
              <Button
                type="button"
                variant="ghost"
                className="text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10 text-xs py-1 px-3"
                onClick={() => setForm({ ...form, experience: [...form.experience, emptyExperience()] })}
              >
                Add experience
              </Button>
            </div>
            {form.experience.map((item, index) => (
              <div key={`experience-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/50 p-4 rounded-xl border border-white/5">
                {['position', 'company'].map((key) => (
                  <input
                    key={key}
                    className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                    placeholder={key === 'position' ? 'Position' : 'Company'}
                    value={item[key] || ''}
                    onChange={(e) => updateListItem('experience', index, key, e.target.value)}
                  />
                ))}
                <input
                  type="date"
                  className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                  value={(item.startDate || '').slice(0, 10)}
                  onChange={(e) => updateListItem('experience', index, 'startDate', e.target.value)}
                />
                <input
                  type="date"
                  className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                  value={(item.endDate || '').slice(0, 10)}
                  onChange={(e) => updateListItem('experience', index, 'endDate', e.target.value)}
                  aria-label="End date; leave blank for present"
                />
                <textarea
                  className="md:col-span-2 bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all resize-none"
                  placeholder="Highlights and responsibilities"
                  value={item.description || ''}
                  onChange={(e) => updateListItem('experience', index, 'description', e.target.value)}
                  rows={2}
                />
                <button type="button" className="text-amber-400 text-left text-xs font-bold hover:underline w-max" onClick={() => removeListItem('experience', index)}>
                  Remove experience
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset className="border border-white/10 rounded-2xl p-6 space-y-6 relative z-10 bg-surface-container/50">
            <div className="flex items-center justify-between">
              <legend className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Education</legend>
              <Button
                type="button"
                variant="ghost"
                className="text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10 text-xs py-1 px-3"
                onClick={() => setForm({ ...form, education: [...form.education, emptyEducation()] })}
              >
                Add education
              </Button>
            </div>
            {form.education.map((item, index) => (
              <div key={`education-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/50 p-4 rounded-xl border border-white/5">
                {[
                  ['institution', 'Institution'],
                  ['degree', 'Degree'],
                  ['fieldOfStudy', 'Field of study'],
                  ['graduationYear', 'Graduation year'],
                ].map(([key, placeholder]) => (
                  <input
                    key={key}
                    type={key === 'graduationYear' ? 'number' : 'text'}
                    className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                    placeholder={placeholder}
                    value={item[key] || ''}
                    onChange={(e) => updateListItem('education', index, key, e.target.value)}
                  />
                ))}
                <button type="button" className="text-amber-400 text-left text-xs font-bold hover:underline w-max" onClick={() => removeListItem('education', index)}>
                  Remove education
                </button>
              </div>
            ))}
          </fieldset>
          <div className="flex gap-4 pt-2 relative z-10">
            <Button type="submit" variant="primary" disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-amber-400 border-none text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="ghost" className="border border-white/10" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Experience & Skills */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Experience Card */}
          <section className="glass-card-pro rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
            <h3 className="font-bold text-2xl text-white mb-8">Experience</h3>
            {experience.length === 0 ? (
              <p className="text-on-surface-variant text-sm font-medium">No experience added yet.</p>
            ) : (
              <div className="space-y-8">
                {experience.map((exp, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-surface-container border border-white/10 rounded-xl flex items-center justify-center shadow-inner z-10 relative">
                        <Briefcase size={20} className="text-emerald-400" />
                      </div>
                      {i < experience.length - 1 && <div className="w-0.5 flex-1 bg-white/10 mt-2 mb-2"></div>}
                    </div>
                    <div className={`flex-1 ${i < experience.length - 1 ? 'pb-8' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{exp.position}</h4>
                          <p className="font-bold text-sm text-on-surface-variant">{exp.company}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-surface-container-high rounded-full border border-white/5 text-emerald-400">
                          {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-on-surface-variant/80 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Education Card */}
          <section className="glass-card-pro rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
            <h3 className="font-bold text-2xl text-white mb-8">Education</h3>
            {education.length === 0 ? (
              <p className="text-on-surface-variant text-sm font-medium">No education added yet.</p>
            ) : (
              <div className="space-y-6">
                {education.map((edu, i) => (
                  <div key={i} className="bg-surface-container-high/30 p-4 rounded-xl border border-white/5">
                    <p className="font-bold text-base text-white mb-1">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</p>
                    <p className="text-xs text-on-surface-variant font-medium">
                      {edu.institution}{edu.graduationYear ? ` • ${edu.graduationYear}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Skills Card */}
          <section className="glass-card-pro rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
            <h3 className="font-bold text-2xl text-white/90 mb-6">Skills & Expertise</h3>
            {skills.length === 0 ? (
              <p className="text-on-surface-variant text-sm font-medium">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full border border-emerald-500/30 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: CV, Bio, Contact */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Bio */}
          <section className="glass-card-pro rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <h3 className="font-bold text-lg text-white mb-4">About</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {profile?.bio || 'No bio added yet.'}
            </p>
          </section>

          {/* CV */}
          <section className="glass-card-pro rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <h3 className="font-bold text-lg text-white mb-4">Documents</h3>
            {profile?.resumeUrl ? (
              <a
                href="#"
                onClick={openResume}
                target="_blank"
                rel="noreferrer"
                className="bg-surface-container border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-400/5 rounded-xl p-4 flex items-center gap-4 transition-all group"
              >
                <FileText size={24} className="text-emerald-400 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="font-bold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">View current CV</p>
              </a>
            ) : (
              <p className="text-on-surface-variant text-xs font-medium">No CV uploaded yet. Manage it from CV Manager.</p>
            )}
          </section>

          {/* Contact Info Card */}
          <section className="glass-card-pro rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <h3 className="font-bold text-lg text-white mb-6">Contact Information</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-white/10 flex items-center justify-center text-amber-500 shadow-inner">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Email</p>
                  <p className="font-bold text-sm text-white">{user?.email || '-'}</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="font-bold text-sm text-white">{user?.phone || 'Not set'}</p>
                </div>
              </li>
            </ul>
          </section>

          {Object.values(profile?.socialLinks || {}).some(Boolean) && (
            <section className="glass-card-pro rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
              <h3 className="font-bold text-lg text-white mb-4">Professional Links</h3>
              <div className="space-y-3">
                {Object.entries(profile.socialLinks).filter(([, value]) => Boolean(value)).map(([label, value]) => (
                  <a
                    key={label}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-emerald-400 hover:underline capitalize font-bold text-sm p-3 bg-surface-container-high/30 rounded-xl border border-white/5 hover:border-emerald-400/30 transition-all"
                  >
                    <span>{label}</span>
                    <ExternalLink size={16} />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <ChangePasswordForm />

        <section className="bg-amber-400/5 rounded-2xl p-6 border border-amber-400/20 space-y-4">
          <h3 className="font-bold text-xl text-amber-400">Danger Zone</h3>
          <Button variant="ghost" className="border border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-black transition-all" onClick={handleDeleteProfile}>
            Delete Profile Data
          </Button>
        </section>
      </div>
    </div>
  );
}
