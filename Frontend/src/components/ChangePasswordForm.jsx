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
    <section className="bg-surface-container rounded-xl p-lg border border-outline-variant">
      <h3 className="font-h3 text-h3 text-on-surface mb-lg">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-md max-w-sm">
        {error && <p className="text-error text-caption">{error}</p>}
        {success && <p className="text-tertiary text-caption">Password updated successfully.</p>}
        <input
          required type="password" placeholder="Current password"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary"
          value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        />
        <input
          required type="password" placeholder="New password (min 6 characters)" minLength={6}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary"
          value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <input
          required type="password" placeholder="Confirm new password"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary"
          value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
        <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Update Password'}</Button>
      </form>
    </section>
  );
}
