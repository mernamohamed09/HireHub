import { useState } from 'react';
import { Button } from '../../components/ui/Button';

const mockCVs = [
  { id: 1, name: 'Sarah_Ahmed_CV_2024.pdf', date: 'Dec 12, 2023', size: '1.2 MB', type: 'pdf' },
  { id: 2, name: 'Product_Designer_Senior_Role.docx', date: 'Nov 05, 2023', size: '840 KB', type: 'doc' },
  { id: 3, name: 'Creative_Portfolio_Resume.pdf', date: 'Oct 22, 2023', size: '2.5 MB', type: 'pdf' },
];

export function CVManager() {
  const [activeId, setActiveId] = useState(1);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">CV Manager</h2>
          <p className="text-on-surface-variant">Upload and manage your professional resumes</p>
        </div>
        <Button variant="primary" className="flex items-center gap-sm shadow-md active:scale-95">
          <span className="material-symbols-outlined">upload</span>
          Upload New
        </Button>
      </header>

      {/* Bento Layout */}
      <div className="grid grid-cols-12 gap-lg flex-1">
        {/* Left Column: Upload & List */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-lg">
          {/* Drag-and-drop zone */}
          <div className="border-2 border-dashed border-outline-variant hover:border-tertiary hover:bg-tertiary/5 rounded-xl bg-surface-container p-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-tertiary text-4xl">cloud_upload</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-xs">Drop your CV here</h3>
            <p className="text-caption text-on-surface-variant mb-md">PDF, DOCX up to 10MB</p>
            <div className="px-md py-xs bg-surface-container-highest rounded-full text-label-tag text-tertiary border border-tertiary/30">
              BROWSE FILES
            </div>
          </div>

          {/* File List */}
          <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant">
            <div className="px-md py-sm border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
              <span className="font-bold text-on-surface text-sm">Managed Documents</span>
              <span className="text-caption text-on-surface-variant">{mockCVs.length} Files</span>
            </div>
            <ul className="divide-y divide-outline-variant">
              {mockCVs.map(cv => {
                const isActive = activeId === cv.id;
                const isPdf = cv.type === 'pdf';
                return (
                  <li 
                    key={cv.id}
                    onClick={() => setActiveId(cv.id)}
                    className={`p-md border-l-4 group cursor-pointer hover:bg-surface-container-highest transition-colors ${isActive ? 'bg-tertiary-container/10 border-tertiary' : 'border-transparent'}`}
                  >
                    <div className="flex items-center gap-md">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${isPdf ? 'bg-red-900/20' : 'bg-blue-900/20'}`}>
                        <span className={`material-symbols-outlined ${isPdf ? 'text-error' : 'text-primary'}`}>
                          {isPdf ? 'picture_as_pdf' : 'description'}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-on-surface text-sm truncate">{cv.name}</p>
                        <p className="text-caption text-on-surface-variant">Uploaded {cv.date} • {cv.size}</p>
                      </div>
                      <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-xs hover:text-tertiary"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button className="p-xs hover:text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CV Tips Card */}
          <div className="bg-surface-container-high rounded-xl p-lg border border-outline-variant relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-sm mb-md text-tertiary">
              <span className="material-symbols-outlined">lightbulb</span>
              <h4 className="font-bold text-sm uppercase tracking-wider">Expert CV Tips</h4>
            </div>
            <ul className="space-y-md">
              <li className="flex gap-md items-start">
                <span className="material-symbols-outlined text-tertiary text-sm mt-1">check_circle</span>
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-semibold">Use keywords</p>
                  <p className="text-caption text-on-surface-variant">Match your skills with job descriptions to pass ATS filters.</p>
                </div>
              </li>
              <li className="flex gap-md items-start">
                <span className="material-symbols-outlined text-tertiary text-sm mt-1">check_circle</span>
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-semibold">Quantify results</p>
                  <p className="text-caption text-on-surface-variant">Use numbers (e.g., "Increased sales by 20%") to show impact.</p>
                </div>
              </li>
              <li className="flex gap-md items-start">
                <span className="material-symbols-outlined text-tertiary text-sm mt-1">check_circle</span>
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-semibold">Keep it to 2 pages</p>
                  <p className="text-caption text-on-surface-variant">Conciseness is key. Focus on the last 10 years of experience.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: CV Preview */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <div className="glass-panel flex-1 rounded-xl p-xl shadow-2xl relative flex flex-col">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-lg pb-md border-b border-white/10">
              <div className="flex items-center gap-md">
                <span className="text-on-surface font-bold">{mockCVs.find(cv => cv.id === activeId)?.name || 'CV'}</span>
                <span className="text-xs bg-surface-container-highest px-sm py-xs rounded text-on-surface-variant">Preview Mode</span>
              </div>
              <div className="flex gap-sm">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-lg">zoom_in</span>
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-lg">print</span>
                </button>
              </div>
            </div>

            {/* PDF Mockup Content */}
            <div className="flex-1 bg-white text-gray-900 p-8 md:p-12 rounded-sm shadow-inner overflow-y-auto max-h-[800px]">
              <div className="max-w-3xl mx-auto space-y-lg">
                {/* CV Header */}
                <div className="border-b-2 border-primary-container pb-lg mb-xl">
                  <h2 className="text-4xl font-extrabold mb-xs text-gray-900">Sarah Ahmed</h2>
                  <h3 className="text-xl text-primary-container font-semibold tracking-tight uppercase">Senior Product Designer</h3>
                  <div className="mt-md flex flex-wrap gap-md text-sm text-gray-600">
                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-base">mail</span> sarah.ahmed@example.com</span>
                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-base">phone</span> +44 7700 900 123</span>
                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-base">location_on</span> London, United Kingdom</span>
                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-base">public</span> sarahahmed.design</span>
                  </div>
                </div>

                {/* CV Summary */}
                <section>
                  <h4 className="text-lg font-bold border-l-4 border-primary-container pl-md mb-md">Professional Profile</h4>
                  <p className="text-gray-700 leading-relaxed">
                    User-centric Product Designer with over 8 years of experience building scalable SaaS platforms and high-conversion mobile applications. Expert in design systems, cross-functional leadership, and rapid prototyping. Proven track record of improving user engagement by up to 45% through data-driven design iterations.
                  </p>
                </section>

                {/* CV Experience */}
                <section>
                  <h4 className="text-lg font-bold border-l-4 border-primary-container pl-md mb-md">Work Experience</h4>
                  <div className="space-y-lg">
                    <div>
                      <div className="flex justify-between items-baseline">
                        <h5 className="font-bold text-md">Lead Product Designer</h5>
                        <span className="text-sm font-semibold italic text-gray-500">2021 — Present</span>
                      </div>
                      <p className="text-primary-container font-semibold text-sm">TechFlow Systems • London</p>
                      <ul className="mt-sm list-disc list-inside text-gray-700 text-sm space-y-xs">
                        <li>Directed a team of 5 designers to overhaul the core enterprise dashboard.</li>
                        <li>Implemented a comprehensive design system, reducing design-to-dev time by 30%.</li>
                        <li>Conducted 50+ user research sessions to validate new feature roadmaps.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline">
                        <h5 className="font-bold text-md">Senior UX Designer</h5>
                        <span className="text-sm font-semibold italic text-gray-500">2018 — 2021</span>
                      </div>
                      <p className="text-primary-container font-semibold text-sm">FinEdge Labs • Dubai</p>
                      <ul className="mt-sm list-disc list-inside text-gray-700 text-sm space-y-xs">
                        <li>Designed the end-to-end user journey for a fintech app with 1M+ active users.</li>
                        <li>Collaborated with engineering to ensure 98% design fidelity across platforms.</li>
                        <li>Optimized checkout flow resulting in a 22% decrease in cart abandonment.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* CV Education & Skills */}
                <div className="grid grid-cols-2 gap-xl pt-lg">
                  <section>
                    <h4 className="text-lg font-bold border-l-4 border-primary-container pl-md mb-md">Education</h4>
                    <div>
                      <p className="font-bold text-sm">MA Digital Media Design</p>
                      <p className="text-xs text-gray-500">University of the Arts London • 2017</p>
                    </div>
                  </section>
                  <section>
                    <h4 className="text-lg font-bold border-l-4 border-primary-container pl-md mb-md">Core Skills</h4>
                    <div className="flex flex-wrap gap-xs">
                      {['Figma', 'React.js', 'UX Strategy', 'Design Ops', 'User Testing'].map(s => (
                        <span key={s} className="px-sm py-xs bg-gray-100 text-gray-800 text-xs font-bold rounded">{s}</span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
