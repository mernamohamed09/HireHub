import { Button } from '../../components/ui/Button';

const mockCandidates = {
  screening: [
    { id: 1, name: 'Mahmoud Reda', applied: 'Oct 12, 2024', tags: ['React', 'TypeScript'], rating: 4 },
    { id: 2, name: 'Sarah Johnson', applied: 'Oct 14, 2024', tags: ['Next.js', 'Tailwind'], rating: 3 },
    { id: 3, name: 'David Chen', applied: 'Oct 15, 2024', tags: ['Redux', 'Unit Testing'], rating: 5 },
  ],
  technical: [
    { id: 4, name: 'Layla Hassan', applied: 'Oct 08, 2024', tags: ['Architecture', 'Hooks'], rating: 4 },
    { id: 5, name: 'Kenji Watanabe', applied: 'Oct 10, 2024', tags: ['Graphql', 'Apollo'], rating: 3 },
  ],
  hr: [
    { id: 6, name: 'Elena Rodriguez', applied: 'Oct 05, 2024', tags: ['Soft Skills', 'Leadership'], rating: 5 },
    { id: 7, name: 'Samuel Lee', applied: 'Oct 07, 2024', tags: ['Communication'], rating: 3 },
  ],
  offer: [
    { id: 8, name: 'Omar Farooq', applied: 'Sep 28, 2024', tags: ['Expert React'], rating: 4 },
    { id: 9, name: 'Alice Dubois', applied: 'Sep 30, 2024', tags: ['State Mgmt'], rating: 5 },
  ],
  hired: [
    { id: 10, name: 'Marcus Thorne', applied: 'Oct 01, 2024', tags: ['Onboarded'], rating: 5, isHired: true },
    { id: 11, name: 'Fatima Al-Sayed', applied: 'Oct 03, 2024', tags: ['Onboarded'], rating: 4, isHired: true },
  ],
};

const StarRating = ({ rating }) => (
  <div className="flex gap-xs">
    {[1, 2, 3, 4, 5].map((star) => (
      <span 
        key={star} 
        className={`material-symbols-outlined text-[14px] ${star <= rating ? 'text-tertiary' : 'text-outline'}`}
        style={star <= rating ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        star
      </span>
    ))}
  </div>
);

const CandidateCard = ({ candidate }) => (
  <div className={`bg-surface-container border ${candidate.isHired ? 'border-secondary-container/50 opacity-80' : 'border-outline-variant'} rounded-xl p-md shadow-md hover:border-primary-container transition-all cursor-grab active:cursor-grabbing hover:scale-[1.02]`}>
    <div className="flex justify-between items-start mb-sm">
      <span className={`material-symbols-outlined drag-handle ${candidate.isHired ? 'text-secondary' : 'text-outline'}`}>
        {candidate.isHired ? 'check_circle' : 'drag_indicator'}
      </span>
      <StarRating rating={candidate.rating} />
    </div>
    <p className="font-body text-body font-bold text-on-surface">{candidate.name}</p>
    <p className="font-caption text-caption text-on-surface-variant mb-md">
      {candidate.isHired ? 'Joined' : 'Applied'} {candidate.applied}
    </p>
    <div className="flex flex-wrap gap-xs mb-lg">
      {candidate.tags.map(tag => (
        <span key={tag} className={`${candidate.isHired ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-highest text-on-surface'} text-[10px] uppercase tracking-wider px-sm py-1 rounded-full font-label-tag`}>
          {tag}
        </span>
      ))}
    </div>
    {!candidate.isHired && (
      <button className="w-full py-xs border border-outline-variant rounded-lg font-caption text-caption flex items-center justify-center gap-xs hover:bg-surface-container-high text-on-surface-variant group">
        Move <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    )}
  </div>
);

const KanbanColumn = ({ title, count, items, isHiredColumn }) => (
  <section className="min-w-[280px] max-w-[320px] flex flex-col h-[calc(100vh-200px)]">
    <div className="flex items-center justify-between mb-md px-xs">
      <div className="flex items-center gap-sm">
        <h2 className="font-body text-body font-bold text-on-surface">{title}</h2>
        <span className={`${isHiredColumn ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'} text-[10px] px-sm py-0.5 rounded-full`}>
          {count}
        </span>
      </div>
      {!isHiredColumn && (
        <button className="text-on-surface-variant hover:text-tertiary transition-colors">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      )}
    </div>
    <div className="flex-1 space-y-md overflow-y-auto custom-scrollbar pr-xs">
      {items.map(candidate => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  </section>
);

export function ATSBoard() {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full relative">
      {/* Top Navigation / Header */}
      <header className="bg-surface-container/50 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center justify-between px-md w-full mb-lg -mt-lg mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)] z-40 relative">
        <div className="flex items-center gap-md">
          {/* Job Selector Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-lg border border-outline-variant hover:border-tertiary transition-colors">
              <span className="material-symbols-outlined text-tertiary">work_history</span>
              <span className="font-h3 text-h3 text-on-surface">Senior React Developer</span>
              <span className="font-caption text-caption text-on-surface-variant bg-surface-container-highest px-xs rounded ml-sm">23 applicants</span>
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <Button variant="primary" className="flex items-center gap-xs active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Invite Candidate
          </Button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto custom-scrollbar relative mx-[-24px] lg:mx-[-32px] px-lg lg:px-xl pb-lg">
        <div className="flex h-full gap-lg min-w-max relative z-10 pt-md">
          <KanbanColumn title="Screening" count={mockCandidates.screening.length} items={mockCandidates.screening} />
          <KanbanColumn title="Technical Test" count={mockCandidates.technical.length} items={mockCandidates.technical} />
          <KanbanColumn title="HR Interview" count={mockCandidates.hr.length} items={mockCandidates.hr} />
          <KanbanColumn title="Offer" count={mockCandidates.offer.length} items={mockCandidates.offer} />
          <KanbanColumn title="Hired" count={mockCandidates.hired.length} items={mockCandidates.hired} isHiredColumn={true} />
        </div>
      </div>
    </div>
  );
}
