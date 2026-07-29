import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { ChangePasswordForm } from '../../components/ChangePasswordForm';
import { candidateService } from '../../services/candidateService';
import { userService } from '../../services/userService';
import { setUser } from '../../store/slices/authSlice';
import { avatarUrl } from '../../utils/avatar';

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
      <div className="flex items-center justify-center py-3xl">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center">
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
      <header className="glass-panel rounded-xl p-lg mb-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md shadow-md relative overflow-hidden">
        <div className="flex items-center gap-lg">
          <div className="relative group">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-tertiary shadow-lg bg-surface-container-high flex items-center justify-center">
              {avatarUrl(user?.profileImage) ? (
                <img className="w-full h-full object-cover" alt={user?.name} src={avatarUrl(user.profileImage)} />
              ) : (
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant">person</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              title="Change profile picture"
              aria-label="Change profile picture"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg border-2 border-surface hover:brightness-110 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isUploadingAvatar ? 'hourglass_empty' : 'photo_camera'}
              </span>
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
            <h2 className="font-h2 text-h2 text-on-surface">{user?.name || 'Candidate'}</h2>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <p className="font-body text-body">{profile?.title || 'No title added yet'}</p>
              {user?.location && (
                <>
                  <span className="w-1 h-1 rounded-full bg-outline"></span>
                  <p className="font-body text-body">{user.location}</p>
                </>
              )}
            </div>
          </div>
        </div>
        <Button variant="primary" className="flex items-center gap-sm transition-colors active:scale-95" onClick={startEditing}>
          <span className="material-symbols-outlined">edit</span>
          Edit Profile
        </Button>
      </header>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-surface-container rounded-xl p-lg border border-outline-variant mb-lg space-y-md">
          <div className="flex items-center justify-between gap-md flex-wrap">
            <h3 className="font-h3 text-h3 text-on-surface">Edit Profile</h3>
            <Button
              type="button"
              variant="outline"
              onClick={handleAutofill}
              disabled={isAutofilling}
              className="flex items-center gap-sm"
              title="Fill these fields from your uploaded CV"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              {isAutofilling ? 'Reading your CV…' : 'Autofill from CV'}
            </Button>
          </div>
          <div>
            <label className="block text-caption text-on-surface-variant font-medium mb-1">Title</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-tertiary"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Senior Product Designer"
            />
          </div>
          <div>
            <label className="block text-caption text-on-surface-variant font-medium mb-1">Bio</label>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-tertiary"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-caption text-on-surface-variant font-medium mb-1">Skills (comma separated)</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-tertiary"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="React, Figma, TypeScript"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-caption text-on-surface-variant font-medium mb-1">Phone</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-tertiary"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-caption text-on-surface-variant font-medium mb-1">Location</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-tertiary"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <fieldset className="border border-outline-variant rounded-xl p-md">
            <legend className="px-sm text-caption text-on-surface-variant font-medium">Professional links</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {Object.entries(form.socialLinks).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-caption text-on-surface-variant capitalize mb-1">{key}</label>
                  <input
                    type="url"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-tertiary"
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

          <fieldset className="border border-outline-variant rounded-xl p-md space-y-md">
            <div className="flex items-center justify-between">
              <legend className="text-caption text-on-surface-variant font-medium">Work experience</legend>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm({ ...form, experience: [...form.experience, emptyExperience()] })}
              >
                Add experience
              </Button>
            </div>
            {form.experience.map((item, index) => (
              <div key={`experience-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-sm bg-surface-container-low p-md rounded-lg">
                {['position', 'company'].map((key) => (
                  <input
                    key={key}
                    className="bg-background border border-outline-variant rounded-lg px-md py-sm text-on-surface"
                    placeholder={key === 'position' ? 'Position' : 'Company'}
                    value={item[key] || ''}
                    onChange={(e) => updateListItem('experience', index, key, e.target.value)}
                  />
                ))}
                <input
                  type="date"
                  className="bg-background border border-outline-variant rounded-lg px-md py-sm text-on-surface"
                  value={(item.startDate || '').slice(0, 10)}
                  onChange={(e) => updateListItem('experience', index, 'startDate', e.target.value)}
                />
                <input
                  type="date"
                  className="bg-background border border-outline-variant rounded-lg px-md py-sm text-on-surface"
                  value={(item.endDate || '').slice(0, 10)}
                  onChange={(e) => updateListItem('experience', index, 'endDate', e.target.value)}
                  aria-label="End date; leave blank for present"
                />
                <textarea
                  className="md:col-span-2 bg-background border border-outline-variant rounded-lg px-md py-sm text-on-surface"
                  placeholder="Highlights and responsibilities"
                  value={item.description || ''}
                  onChange={(e) => updateListItem('experience', index, 'description', e.target.value)}
                />
                <button type="button" className="text-error text-left text-sm" onClick={() => removeListItem('experience', index)}>
                  Remove experience
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset className="border border-outline-variant rounded-xl p-md space-y-md">
            <div className="flex items-center justify-between">
              <legend className="text-caption text-on-surface-variant font-medium">Education</legend>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm({ ...form, education: [...form.education, emptyEducation()] })}
              >
                Add education
              </Button>
            </div>
            {form.education.map((item, index) => (
              <div key={`education-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-sm bg-surface-container-low p-md rounded-lg">
                {[
                  ['institution', 'Institution'],
                  ['degree', 'Degree'],
                  ['fieldOfStudy', 'Field of study'],
                  ['graduationYear', 'Graduation year'],
                ].map(([key, placeholder]) => (
                  <input
                    key={key}
                    type={key === 'graduationYear' ? 'number' : 'text'}
                    className="bg-background border border-outline-variant rounded-lg px-md py-sm text-on-surface"
                    placeholder={placeholder}
                    value={item[key] || ''}
                    onChange={(e) => updateListItem('education', index, key, e.target.value)}
                  />
                ))}
                <button type="button" className="text-error text-left text-sm" onClick={() => removeListItem('education', index)}>
                  Remove education
                </button>
              </div>
            ))}
          </fieldset>
          <div className="flex gap-sm">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Experience & Skills */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Experience Card */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-xl">Experience</h3>
            {experience.length === 0 ? (
              <p className="text-on-surface-variant font-body">No experience added yet.</p>
            ) : (
              <div className="space-y-xl">
                {experience.map((exp, i) => (
                  <div key={i} className="flex gap-md group">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant">
                        <span className="material-symbols-outlined text-tertiary">corporate_fare</span>
                      </div>
                      {i < experience.length - 1 && <div className="w-0.5 flex-1 bg-outline-variant mt-2 mb-2"></div>}
                    </div>
                    <div className={`flex-1 ${i < experience.length - 1 ? 'pb-lg border-b border-outline-variant/30' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-body text-body font-bold text-on-surface">{exp.position}</h4>
                          <p className="font-body text-body text-tertiary">{exp.company}</p>
                        </div>
                        <span className="font-caption text-caption text-on-surface-variant">
                          {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="font-caption text-caption text-on-surface-variant mt-sm">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Education Card */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Education</h3>
            {education.length === 0 ? (
              <p className="text-on-surface-variant font-body">No education added yet.</p>
            ) : (
              <div className="space-y-md">
                {education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-body text-body font-bold text-on-surface">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {edu.institution}{edu.graduationYear ? ` • ${edu.graduationYear}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Skills Card */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Skills & Expertise</h3>
            {skills.length === 0 ? (
              <p className="text-on-surface-variant font-body">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-sm">
                {skills.map(skill => (
                  <span key={skill} className="font-label-tag text-label-tag bg-tertiary-container/30 text-tertiary px-md py-sm rounded-full border border-tertiary/20 uppercase tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: CV, Bio, Contact */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Bio */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-body text-body font-bold text-on-surface mb-sm">About</h3>
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              {profile?.bio || 'No bio added yet.'}
            </p>
          </section>

          {/* CV */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Documents</h3>
            {profile?.resumeUrl ? (
              <a
                href="#"
                onClick={openResume}
                target="_blank"
                rel="noreferrer"
                className="bg-tertiary-container/10 border border-tertiary/30 rounded-lg p-md flex items-center gap-md hover:bg-tertiary-container/20 transition-colors"
              >
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                <p className="font-body text-body font-bold text-on-surface truncate">View current CV</p>
              </a>
            ) : (
              <p className="text-on-surface-variant font-body text-caption">No CV uploaded yet. Manage it from CV Manager.</p>
            )}
          </section>

          {/* Contact Info Card */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Contact Information</h3>
            <ul className="space-y-lg">
              <li className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="font-caption text-caption text-on-surface-variant">Email</p>
                  <p className="font-body text-body text-on-surface">{user?.email || '-'}</p>
                </div>
              </li>
              <li className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="font-caption text-caption text-on-surface-variant">Phone</p>
                  <p className="font-body text-body text-on-surface">{user?.phone || 'Not set'}</p>
                </div>
              </li>
            </ul>
          </section>

          {Object.values(profile?.socialLinks || {}).some(Boolean) && (
            <section className="bg-surface-container rounded-xl p-lg border border-outline-variant">
              <h3 className="font-h3 text-h3 text-on-surface mb-lg">Professional Links</h3>
              <div className="space-y-sm">
                {Object.entries(profile.socialLinks).filter(([, value]) => Boolean(value)).map(([label, value]) => (
                  <a
                    key={label}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-tertiary hover:underline capitalize"
                  >
                    <span>{label}</span>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-gutter space-y-gutter">
        <ChangePasswordForm />

        <section className="bg-error-container/10 rounded-xl p-lg border border-error/20 space-y-md">
          <h3 className="font-h3 text-h3 text-error">Danger Zone</h3>
          <Button variant="outline" className="border-error text-error hover:bg-error/10" onClick={handleDeleteProfile}>
            Delete Profile Data
          </Button>
        </section>
      </div>
    </div>
  );
}
