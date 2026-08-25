import { useState } from 'react';
import { Button } from './ui/Button';
import { userService } from '../services/userService';

export function ChangePasswordForm() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      setIsSaving(true);
      await userService.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setSuccess(true);
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="glass-card-pro rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
      <h3 className="font-bold text-2xl text-white mb-6 relative z-10">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm relative z-10">
        {error && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
        {success && <p className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">Password updated successfully.</p>}
        <input
          required type="password" placeholder="Current password"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all text-white placeholder-slate-500"
          value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        />
        <input
          required type="password" placeholder="New password (min 6 characters)" minLength={6}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all text-white placeholder-slate-500"
          value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <input
          required type="password" placeholder="Confirm new password"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 focus:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all text-white placeholder-slate-500"
          value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
        <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Update Password'}</Button>
      </form>
    </section>
  );
}
