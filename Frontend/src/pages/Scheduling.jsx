import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { interviewService } from '../services/interviewService';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';

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
    <div className="w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-md -mt-lg mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)] mb-xl">
        <div className="flex items-center gap-xl">
          <h2 className="font-h3 text-h3 font-bold text-on-surface">Interview Scheduling</h2>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-gutter max-w-container_max_width w-full">
        {/* Left Column: Calendar */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          <section className="bg-surface-container-low rounded-xl border border-outline-variant p-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-lg">
              <div className="flex items-center gap-md">
                <h3 className="font-h2 text-h2 text-on-surface">{monthNames[month]} {year}</h3>
                <div className="flex gap-xs">
                  <button onClick={prevMonth} className="p-1 hover:bg-surface-container-high rounded-md transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button onClick={nextMonth} className="p-1 hover:bg-surface-container-high rounded-md transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-md text-caption">
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-tertiary inline-block"></span>
                  <span className="text-on-surface-variant">Scheduled</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-outline-variant border border-outline-variant rounded-lg overflow-hidden">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="bg-surface-container-high py-2 text-center font-label-tag text-label-tag text-on-surface-variant uppercase">{d}</div>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-surface/50 h-20 sm:h-28 p-2" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayInterviews = getInterviewsForDay(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                const isSelected = selectedDay === day;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`bg-surface h-20 sm:h-28 p-2 transition-colors hover:bg-surface-container-highest cursor-pointer relative ${isSelected ? 'ring-2 ring-inset ring-tertiary' : ''}`}
                  >
                    <span className={`font-bold text-caption inline-flex items-center justify-center ${isToday ? 'bg-primary text-on-primary w-6 h-6 rounded-full' : 'text-on-surface'}`}>
                      {day}
                    </span>
                    {dayInterviews.length > 0 && (
                      <div className="mt-1 p-1 bg-primary-container/40 border-l-2 border-primary text-[10px] text-primary truncate rounded-r-sm hidden sm:block">
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
            <section className="bg-surface-container rounded-xl border border-outline-variant p-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between gap-sm mb-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-tertiary">{editingId ? 'edit_calendar' : 'add_circle'}</span>
                  <h3 className="font-h3 text-h3 text-on-surface">{editingId ? 'Reschedule Interview' : 'Schedule an Interview'}</h3>
                </div>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-caption text-on-surface-variant hover:text-on-surface underline">
                    Cancel edit
                  </button>
                )}
              </div>
              <form className="space-y-md" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Select Job</label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      disabled={!!editingId}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface disabled:opacity-60"
                      required
                    >
                      {myJobs.map(job => (
                        <option key={job._id} value={job._id}>{job.title}</option>
                      ))}
                      {myJobs.length === 0 && <option value="">No jobs posted yet</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Select Candidate</label>
                    <select
                      value={form.candidateId}
                      onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
                      disabled={!!editingId}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface disabled:opacity-60"
                      required
                    >
                      {applicants.map(app => (
                        <option key={app._id} value={app.applicant?._id}>{app.applicant?.name}</option>
                      ))}
                      {applicants.length === 0 && <option value="">No applicants for selected job</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Date</label>
                    <input 
                      type="date"
                      value={form.date} 
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Start Time</label>
                    <input 
                      type="time" 
                      value={form.startTime} 
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">End Time</label>
                    <input 
                      type="time" 
                      value={form.endTime} 
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Interview Type</label>
                    <select 
                      value={form.type} 
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Meeting Link (e.g., Google Meet)</label>
                    <input 
                      type="url" 
                      value={form.meetingLink} 
                      onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-caption text-on-surface-variant mb-1">Additional Notes</label>
                  <textarea 
                    value={form.notes} 
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface"
                    placeholder="Enter details for the candidate..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || (!editingId && applicants.length === 0)}
                  className="w-full bg-tertiary text-on-tertiary py-3 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Schedule Interview'}
                </button>
              </form>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Upcoming Interviews */}
          <section className="bg-surface-container-low rounded-xl border border-outline-variant p-lg shadow-md hover:scale-[1.01] transition-transform duration-200">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Upcoming Interviews</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-lg">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : upcomingInterviews.length === 0 ? (
              <p className="text-on-surface-variant text-body">No upcoming interviews.</p>
            ) : (
              <div className="space-y-md">
                {upcomingInterviews.map(interview => {
                  const interviewDate = new Date(interview.date);
                  const isToday = interviewDate.toDateString() === new Date().toDateString();
                  const otherPerson = user?.role === 'company' ? interview.candidate : interview.interviewer;
                  return (
                    <div key={interview._id} className="p-md bg-surface-container-high rounded-lg border border-outline-variant relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <div className="flex justify-between items-start mb-sm">
                        <div className="flex gap-md">
                          <div className="w-12 h-12 rounded-lg border border-outline-variant bg-primary-container text-surface flex items-center justify-center font-bold text-lg shrink-0">
                            {otherPerson?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h4 className="font-bold text-body text-on-surface">{otherPerson?.name || 'Unknown'}</h4>
                            <p className="text-caption text-on-surface-variant">{interview.job?.title || 'Interview'}</p>
                          </div>
                        </div>
                        {isToday && <span className="bg-primary-container/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">Today</span>}
                      </div>
                      <div className="flex items-center gap-md text-caption text-on-surface-variant mb-md">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          {interviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {interview.startTime} - {interview.endTime}
                        </div>
                      </div>
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="w-full bg-primary-container text-white py-2 rounded-md text-caption font-bold hover:bg-primary-container/80 transition-colors flex items-center justify-center gap-sm">
                          <span className="material-symbols-outlined text-sm">video_call</span>
                          Join Meeting
                        </a>
                      )}
                      <div className="flex gap-md mt-sm">
                        {(user?.role === 'company' || user?.role === 'admin') && (
                          <button onClick={() => startEdit(interview)} className="flex-1 text-tertiary text-caption font-medium hover:underline">Reschedule</button>
                        )}
                        <button onClick={() => handleCancel(interview._id)} className="flex-1 text-error text-caption font-medium hover:underline">Cancel</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-md">
            <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl hover:border-tertiary transition-colors">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Scheduled</p>
              <p className="font-h2 text-h2 text-tertiary">{totalScheduled}</p>
            </div>
            <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary transition-colors">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Completed</p>
              <p className="font-h2 text-h2 text-primary">{totalCompleted}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
