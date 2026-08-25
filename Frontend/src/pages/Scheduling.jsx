import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { interviewService } from '../services/interviewService';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { ChevronLeft, ChevronRight, Edit, PlusCircle, Calendar, Clock, Video, Loader2 } from 'lucide-react';

export function Scheduling() {
  const { user } = useSelector((state) => state.auth);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scheduling Form States (for Company users)
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [form, setForm] = useState({
    candidateId: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'video',
    meetingLink: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating a new interview

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    loadInterviews();
    if (user?.role === 'company' || user?.role === 'admin') {
      loadCompanyJobs();
    }
    // The loaders are stable function declarations for this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load applicants whenever selected job changes
  useEffect(() => {
    if (selectedJobId) {
      loadJobApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  async function loadInterviews() {
    try {
      setIsLoading(true);
      const data = await interviewService.getMyInterviews();
      setInterviews(data.interviews || []);
    } catch {
      toast.error('Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCompanyJobs() {
    try {
      const data = await jobService.getAllJobs();
      const ownJobs = (data.jobs || []).filter(job => job.postedBy?._id === user?._id);
      setMyJobs(ownJobs);
      if (ownJobs.length > 0) {
        setSelectedJobId(ownJobs[0]._id);
      }
    } catch {
      toast.error('Failed to load jobs list');
    }
  }

  async function loadJobApplicants(jobId) {
    try {
      const data = await applicationService.getApplicantsForJob(jobId);
      setApplicants(data.applicants || []);
      if (data.applicants && data.applicants.length > 0) {
        setForm(f => ({ ...f, candidateId: data.applicants[0].applicant?._id || '' }));
      }
    } catch {
      toast.error('Failed to load applicants');
    }
  }

  const handleCancel = async (id) => {
    try {
      await interviewService.cancelInterview(id);
      setInterviews(prev => prev.map(i => i._id === id ? { ...i, status: 'cancelled' } : i));
      toast.success('Interview cancelled');
    } catch {
      toast.error('Failed to cancel interview');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      candidateId: applicants[0]?.applicant?._id || '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'video',
      meetingLink: '',
      notes: ''
    });
  };

  const startEdit = (interview) => {
    setEditingId(interview._id);
    if (interview.job?._id) setSelectedJobId(interview.job._id);
    setForm({
      candidateId: interview.candidate?._id || '',
      date: interview.date ? new Date(interview.date).toISOString().slice(0, 10) : '',
      startTime: interview.startTime || '',
      endTime: interview.endTime || '',
      type: interview.type || 'video',
      meetingLink: interview.meetingLink || '',
      notes: interview.notes || ''
    });
    // Bring the form into view.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId || !form.candidateId || !form.date || !form.startTime || !form.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        await interviewService.updateInterview(editingId, {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          type: form.type,
          meetingLink: form.meetingLink,
          notes: form.notes
        });
        toast.success('Interview rescheduled');
      } else {
        const activeApp = applicants.find(a => a.applicant?._id === form.candidateId);
        await interviewService.createInterview({
          jobId: selectedJobId,
          applicationId: activeApp?._id,
          candidateId: form.candidateId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          type: form.type,
          meetingLink: form.meetingLink,
          notes: form.notes
        });
        toast.success('Interview scheduled successfully');
      }

      loadInterviews();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const startOffset = startDay === 0 ? 6 : startDay - 1; // Monday start
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getInterviewsForDay = (day) => {
    return interviews.filter(i => {
      const d = new Date(i.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day && i.status !== 'cancelled';
    });
  };

  const upcomingInterviews = interviews
    .filter(i => new Date(i.date) >= new Date() && i.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const totalScheduled = interviews.filter(i => i.status === 'scheduled').length;
  const totalCompleted = interviews.filter(i => i.status === 'completed').length;

  return (
    <div className="w-full relative">
      {/* Header */}
      <header className="glass-card-pro border-b border-white/5 sticky top-0 z-40 bg-black/40 backdrop-blur-xl flex justify-between items-center h-20 px-8 -mt-8 mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)] mb-8">
        <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        <div className="flex items-center gap-6 relative z-10">
          <h2 className="font-bold text-3xl text-white">Interview Scheduling</h2>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Left Column: Calendar */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="glass-card-pro rounded-2xl border border-white/5 p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-amber-400"></div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-2xl text-white">{monthNames[month]} {year}</h3>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-white/5 hover:border-white/20">
                    <ChevronLeft className="text-white w-5 h-5" />
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-white/5 hover:border-white/20">
                    <ChevronRight className="text-white w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block"></span>
                  <span className="text-slate-400">Scheduled</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-[1px] bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-inner">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="bg-black/40 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-black/20 h-24 sm:h-32 p-2 backdrop-blur-sm" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayInterviews = getInterviewsForDay(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                const isSelected = selectedDay === day;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`bg-black/20 h-24 sm:h-32 p-2 transition-all hover:bg-white/5 cursor-pointer relative ${isSelected ? 'ring-2 ring-inset ring-emerald-400 bg-emerald-500/5' : ''}`}
                  >
                    <span className={`font-bold text-xs inline-flex items-center justify-center ${isToday ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-white w-7 h-7 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    {dayInterviews.length > 0 && (
                      <div className="mt-2 p-1.5 bg-emerald-500/20 border-l-2 border-emerald-400 text-[10px] font-bold text-emerald-400 truncate rounded-r-md hidden sm:block shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        {dayInterviews.length} Interview{dayInterviews.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Add Interview Form (Only for Company / Recruiters) */}
          {(user?.role === 'company' || user?.role === 'admin') && (
            <section className="glass-card-pro rounded-2xl border border-white/5 p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none"></div>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  {editingId ? <Edit className="text-amber-400 w-6 h-6" /> : <PlusCircle className="text-emerald-400 w-6 h-6" />}
                  <h3 className="font-bold text-2xl text-white">{editingId ? 'Reschedule Interview' : 'Schedule an Interview'}</h3>
                </div>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-colors">
                    Cancel edit
                  </button>
                )}
              </div>
              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Job</label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      disabled={!!editingId}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white disabled:opacity-50"
                      required
                    >
                      {myJobs.map(job => (
                        <option key={job._id} value={job._id} className="bg-background">{job.title}</option>
                      ))}
                      {myJobs.length === 0 && <option value="" className="bg-background">No jobs posted yet</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Candidate</label>
                    <select
                      value={form.candidateId}
                      onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
                      disabled={!!editingId}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white disabled:opacity-50"
                      required
                    >
                      {applicants.map(app => (
                        <option key={app._id} value={app.applicant?._id} className="bg-background">{app.applicant?.name}</option>
                      ))}
                      {applicants.length === 0 && <option value="" className="bg-background">No applicants for selected job</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                    <input 
                      type="date"
                      value={form.date} 
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                    <input 
                      type="time" 
                      value={form.startTime} 
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                    <input 
                      type="time" 
                      value={form.endTime} 
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interview Type</label>
                    <select 
                      value={form.type} 
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white"
                    >
                      <option value="video" className="bg-background">Video Call</option>
                      <option value="phone" className="bg-background">Phone Call</option>
                      <option value="in-person" className="bg-background">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meeting Link (e.g., Google Meet)</label>
                    <input 
                      type="url" 
                      value={form.meetingLink} 
                      onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white placeholder-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Notes</label>
                  <textarea 
                    value={form.notes} 
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all text-white resize-none"
                    placeholder="Enter details for the candidate..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || (!editingId && applicants.length === 0)}
                  className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-none border-none"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Schedule Interview'}
                </button>
              </form>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Upcoming Interviews */}
          <section className="glass-card-pro rounded-2xl border border-white/5 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            <h3 className="font-bold text-xl text-white mb-6 relative z-10">Upcoming Interviews</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-emerald-400" />
              </div>
            ) : upcomingInterviews.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium">No upcoming interviews.</p>
            ) : (
              <div className="space-y-4 relative z-10">
                {upcomingInterviews.map(interview => {
                  const interviewDate = new Date(interview.date);
                  const isToday = interviewDate.toDateString() === new Date().toDateString();
                  const otherPerson = user?.role === 'company' ? interview.candidate : interview.interviewer;
                  return (
                    <div key={interview._id} className="p-4 bg-black/20 rounded-xl border border-white/5 hover:border-emerald-400/50 hover:bg-white/5 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-amber-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl border border-white/5 bg-black/40 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-inner group-hover:border-emerald-400/30 transition-colors">
                            {otherPerson?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">{otherPerson?.name || 'Unknown'}</h4>
                            <p className="text-xs text-slate-400 mt-1">{interview.job?.title || 'Interview'}</p>
                          </div>
                        </div>
                        {isToday && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)] whitespace-nowrap">Today</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-emerald-400" />
                          {interviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-amber-400" />
                          {interview.startTime} - {interview.endTime}
                        </div>
                      </div>
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-black hover:shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 mb-3">
                          <Video size={16} />
                          Join Meeting
                        </a>
                      )}
                      <div className="flex gap-4 mt-2">
                        {(user?.role === 'company' || user?.role === 'admin') && (
                          <button onClick={() => startEdit(interview)} className="flex-1 text-emerald-400 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors text-left">Reschedule</button>
                        )}
                        <button onClick={() => handleCancel(interview._id)} className="flex-1 text-red-500 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors text-right">Cancel</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 glass-card-pro rounded-2xl border border-white/5 hover:border-emerald-400/50 transition-all hover:bg-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 relative z-10">Scheduled</p>
              <p className="font-bold text-4xl text-emerald-400 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{totalScheduled}</p>
            </div>
            <div className="p-6 glass-card-pro rounded-2xl border border-white/5 hover:border-amber-400/50 transition-all hover:bg-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 relative z-10">Completed</p>
              <p className="font-bold text-4xl text-amber-400 relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{totalCompleted}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
