import { useState } from 'react';
import { Button } from '../components/ui/Button';

const bookedDays = [5, 12, 14, 26];
const availableDays = [2, 3, 8, 9, 10, 15, 16, 17, 22, 23, 24, 29, 30, 31];
const daysInMonth = 31;
const startOffset = 1; // Oct 1 = Tuesday, offset 1 empty cell

export function Scheduling() {
  const [activeTab, setActiveTab] = useState('recruiter');
  const [selectedDay, setSelectedDay] = useState(26);

  return (
    <div className="w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-md -mt-lg mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)] mb-xl">
        <div className="flex items-center gap-xl">
          <h2 className="font-h3 text-h3 font-bold text-on-surface hidden md:block">Interview Scheduling</h2>
          {/* View Switcher */}
          <div className="flex bg-surface-container-low rounded-lg p-1">
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-md py-1.5 text-body font-medium rounded-md shadow-sm transition-all ${activeTab === 'recruiter' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Recruiter Availability
            </button>
            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-md py-1.5 text-body font-medium rounded-md transition-all ${activeTab === 'candidate' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Candidate View
            </button>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Button variant="primary" className="active:scale-95">Join Meeting</Button>
        </div>
      </header>

      {/* Page Content: Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter max-w-container_max_width w-full">
        {/* Left Column: Calendar */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Calendar Card */}
          <section className="bg-surface-container-low rounded-xl border border-outline-variant p-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-lg">
              <div className="flex items-center gap-md">
                <h3 className="font-h2 text-h2 text-on-surface">October 2024</h3>
                <div className="flex gap-xs">
                  <button className="p-1 hover:bg-surface-container-high rounded-md transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="p-1 hover:bg-surface-container-high rounded-md transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-md text-caption">
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-tertiary inline-block"></span>
                  <span className="text-on-surface-variant">Available</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-primary-container inline-block"></span>
                  <span className="text-on-surface-variant">Booked</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-outline-variant border border-outline-variant rounded-lg overflow-hidden">
              {/* Day Headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="bg-surface-container-high py-2 text-center font-label-tag text-label-tag text-on-surface-variant uppercase">{d}</div>
              ))}

              {/* Empty start offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-surface/50 h-20 sm:h-28 p-2" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isBooked = bookedDays.includes(day);
                const isAvailable = availableDays.includes(day);
                const isSelected = selectedDay === day;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`bg-surface h-20 sm:h-28 p-2 transition-colors hover:bg-surface-container-highest cursor-pointer relative ${isSelected ? 'ring-2 ring-inset ring-tertiary' : ''}`}
                  >
                    <span className={`font-bold text-caption inline-flex items-center justify-center ${day === 26 ? 'bg-primary text-on-primary w-6 h-6 rounded-full' : 'text-on-surface'}`}>
                      {day}
                    </span>
                    {isBooked && (
                      <div className="mt-1 p-1 bg-primary-container/40 border-l-2 border-primary text-[10px] text-primary truncate rounded-r-sm hidden sm:block">
                        Booked: Interview
                      </div>
                    )}
                    {isAvailable && !isBooked && (
                      <div className="mt-1 p-1 bg-tertiary/20 border-l-2 border-tertiary text-[10px] text-tertiary truncate rounded-r-sm hidden sm:block">
                        4 Slots Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Add Slot Form */}
          <section className="bg-surface-container rounded-xl border border-outline-variant p-lg shadow-md glass-panel hover:scale-[1.01] transition-transform duration-200">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-tertiary">add_circle</span>
              <h3 className="font-h3 text-h3 text-on-surface">Add Availability</h3>
            </div>
            <form className="space-y-md" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-caption text-on-surface-variant mb-1">Select Date</label>
                <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" type="date" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-caption text-on-surface-variant mb-1">Start Time</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" type="time" />
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-1">End Time</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface" type="time" />
                </div>
              </div>
              <button className="w-full bg-tertiary text-on-tertiary py-3 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all">
                Save Availability
              </button>
            </form>
          </section>

          {/* Upcoming Bookings */}
          <section className="bg-surface-container-low rounded-xl border border-outline-variant p-lg shadow-md hover:scale-[1.01] transition-transform duration-200">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Upcoming Bookings</h3>
            <div className="space-y-md">
              {/* Active Booking */}
              <div className="p-md bg-surface-container-high rounded-lg border border-outline-variant relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex justify-between items-start mb-sm">
                  <div className="flex gap-md">
                    <div className="w-12 h-12 rounded-lg border border-outline-variant bg-primary-container text-surface flex items-center justify-center font-bold text-lg shrink-0">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-body text-on-surface">Sarah Ahmed</h4>
                      <p className="text-caption text-on-surface-variant">Senior UI Designer</p>
                    </div>
                  </div>
                  <span className="bg-primary-container/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">Today</span>
                </div>
                <div className="flex items-center gap-md text-caption text-on-surface-variant mb-md">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Oct 26, 2024
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    3:00 PM
                  </div>
                </div>
                <button className="w-full bg-primary-container text-white py-2 rounded-md text-caption font-bold hover:bg-primary-container/80 transition-colors flex items-center justify-center gap-sm">
                  <span className="material-symbols-outlined text-sm">video_call</span>
                  Join Meeting
                </button>
              </div>

              {/* Secondary Booking */}
              <div className="p-md bg-surface border border-outline-variant rounded-lg hover:border-outline transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-sm">
                  <div>
                    <h4 className="font-bold text-body text-on-surface">Marcus Chen</h4>
                    <p className="text-caption text-on-surface-variant">Frontend Developer</p>
                  </div>
                  <span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Oct 28</span>
                </div>
                <div className="flex items-center gap-md text-caption text-on-surface-variant">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    11:30 AM
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">link</span>
                    Video Call
                  </div>
                </div>
              </div>

              <button className="w-full py-2 text-caption text-tertiary font-medium hover:underline transition-all">View All Schedule</button>
            </div>
          </section>

          {/* Insights/Stats */}
          <div className="grid grid-cols-2 gap-md">
            <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl hover:border-tertiary transition-colors">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Open Slots</p>
              <p className="font-h2 text-h2 text-tertiary">24</p>
            </div>
            <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary transition-colors">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Booked</p>
              <p className="font-h2 text-h2 text-primary">12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
