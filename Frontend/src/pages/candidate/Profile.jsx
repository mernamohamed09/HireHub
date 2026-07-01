import { Button } from '../../components/ui/Button';

export function Profile() {
  return (
    <div className="w-full">
      {/* Header Profile Card */}
      <header className="glass-panel rounded-xl p-lg mb-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md shadow-md relative overflow-hidden">
        <div className="flex items-center gap-lg">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-tertiary shadow-lg">
              <img className="w-full h-full object-cover" alt="Sarah Ahmed" src="https://via.placeholder.com/96" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary-container p-1.5 rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </div>
          </div>
          <div>
            <h2 className="font-h2 text-h2 text-on-surface">Sarah Ahmed</h2>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <p className="font-body text-body">Senior Product Designer</p>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <p className="font-body text-body">Cairo, Egypt</p>
            </div>
          </div>
        </div>
        <Button variant="primary" className="flex items-center gap-sm transition-colors active:scale-95">
          <span className="material-symbols-outlined">edit</span>
          Edit Profile
        </Button>
      </header>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Experience & Skills */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Experience Card */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-xl">
              <h3 className="font-h3 text-h3 text-on-surface">Experience</h3>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-tertiary transition-colors">add_circle</span>
            </div>
            <div className="space-y-xl">
              {/* Instabug */}
              <div className="flex gap-md group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant">
                    <span className="material-symbols-outlined text-tertiary">corporate_fare</span>
                  </div>
                  <div className="w-0.5 flex-1 bg-outline-variant mt-2 mb-2"></div>
                </div>
                <div className="flex-1 pb-lg border-b border-outline-variant/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-body text-body font-bold text-on-surface">Senior Designer</h4>
                      <p className="font-body text-body text-tertiary">Instabug</p>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">2021 - Present</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-sm">Leading design systems and user experience for core mobile SDKs and dashboard analytics.</p>
                </div>
              </div>
              
              {/* Robosta */}
              <div className="flex gap-md group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant">
                    <span className="material-symbols-outlined text-secondary">rocket_launch</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-body text-body font-bold text-on-surface">UI Designer</h4>
                      <p className="font-body text-body text-tertiary">Robosta</p>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">2019 - 2021</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-sm">Crafted visual identities and interface designs for various e-commerce and fintech startups.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Skills Card */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-sm">
              {['React', 'Tailwind', 'Figma', 'Arabic', 'English'].map(skill => (
                <span key={skill} className="font-label-tag text-label-tag bg-tertiary-container/30 text-tertiary px-md py-sm rounded-full border border-tertiary/20 uppercase tracking-wider">
                  {skill}
                </span>
              ))}
              <span className="font-label-tag text-label-tag bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full border border-outline-variant uppercase tracking-wider cursor-pointer hover:bg-surface-container-highest transition-colors">
                + Add Skill
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: CV, Completion, Contact */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Completion Meter */}
          <div className="bg-surface-container-highest rounded-xl p-lg border border-tertiary/30 shadow-inner overflow-hidden relative">
            <div className="absolute top-0 right-0 p-lg">
              <span className="material-symbols-outlined text-tertiary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <h3 className="font-body text-body font-bold text-on-surface mb-sm">Profile Completion</h3>
            <div className="flex items-end gap-sm mb-md">
              <span className="text-h2 font-h2 text-tertiary">85%</span>
              <span className="font-caption text-caption text-on-surface-variant mb-1.5 text-xs">Almost there!</span>
            </div>
            <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden mb-lg">
              <div className="h-full bg-gradient-to-r from-tertiary to-primary-container transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
            </div>
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              Add a <span className="text-tertiary font-bold">Portfolio Link</span> to reach 100% and get 5x more profile views.
            </p>
          </div>

          {/* CV Upload Area */}
          <section className="bg-surface-container rounded-xl p-lg border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-h3 text-h3 text-on-surface mb-lg">Documents</h3>
            <div className="bg-surface-container-low border-2 border-dashed border-tertiary/40 rounded-xl p-lg flex flex-col items-center justify-center text-center mb-md group cursor-pointer hover:bg-tertiary-container/5 transition-colors">
              <span className="material-symbols-outlined text-tertiary text-h1 mb-sm">cloud_upload</span>
              <p className="font-body text-body font-bold text-on-surface">Upload new CV</p>
              <p className="font-caption text-caption text-on-surface-variant">PDF, DOCX up to 10MB</p>
            </div>
            <div className="space-y-sm">
              <div className="bg-tertiary-container/10 border border-tertiary/30 rounded-lg p-md flex items-center justify-between group">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                  <div className="overflow-hidden">
                    <p className="font-body text-body font-bold text-on-surface truncate">Sarah_Ahmed_CV_2024.pdf</p>
                    <div className="flex items-center gap-sm">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="font-caption text-caption text-tertiary">Active</span>
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-error transition-colors">delete</span>
              </div>
            </div>
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
                  <p className="font-body text-body text-on-surface">sarah.ahmed@design.com</p>
                </div>
              </li>
              <li className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="font-caption text-caption text-on-surface-variant">Phone</p>
                  <p className="font-body text-body text-on-surface">+20 123 456 7890</p>
                </div>
              </li>
              <li className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <div>
                  <p className="font-caption text-caption text-on-surface-variant">Website</p>
                  <p className="font-body text-body text-tertiary">sarah-portfolio.design</p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
