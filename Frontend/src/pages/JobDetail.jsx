import { useState } from 'react';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

export function JobDetail() {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  
  const { register, handleSubmit } = useForm();

  const handleApply = (data) => {
    console.log("Applied", data);
    setIsApplyModalOpen(false);
    // TODO: Connect to Application Service
  };

  return (
    <>
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-gutter py-xl w-full">
        <div className="flex flex-col lg:flex-row gap-lg">
          
          {/* Main Job Detail Column */}
          <div className="flex-1 space-y-lg">
            
            {/* Header Card */}
            <div className="bg-surface-container rounded-xl p-xl border border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16"></div>
              <div className="flex items-start justify-between">
                <div className="flex gap-lg">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-sm shrink-0 shadow-xl shadow-black/20">
                    <img className="w-full object-contain" alt="Paymob" src="https://via.placeholder.com/64" />
                  </div>
                  <div>
                    <h1 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
                      Senior Software Engineer
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </h1>
                    <p className="text-tertiary font-medium">Paymob</p>
                    <div className="flex flex-wrap gap-md mt-md">
                      <div className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span className="text-caption">Maadi, Cairo</span>
                      </div>
                      <div className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span className="text-caption">Full-time</span>
                      </div>
                      <div className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">home_work</span>
                        <span className="text-caption">Remote-friendly</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-outline-variant flex gap-xl px-sm">
              {['Overview', 'Company', 'Benefits', 'Reviews'].map(tab => (
                <button 
                  key={tab}
                  className={`pb-md transition-all ${activeTab === tab ? 'border-b-2 border-tertiary text-tertiary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Job Description Content */}
            <div className="space-y-xl text-on-surface-variant leading-relaxed">
              <section>
                <h3 className="font-h3 text-h3 text-on-surface mb-md">About the role</h3>
                <p>We are looking for a Senior Software Engineer to join our core payments team. You will be responsible for building high-scale financial systems that process millions of transactions daily. At Paymob, we value clean code, architectural integrity, and a proactive approach to solving complex problems.</p>
              </section>
              <section>
                <h3 className="font-h3 text-h3 text-on-surface mb-md">Responsibilities</h3>
                <ul className="space-y-sm">
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">check_circle</span>
                    <span>Design and implement scalable microservices using Python and Go.</span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">check_circle</span>
                    <span>Optimize database queries and system performance for low-latency transaction processing.</span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">check_circle</span>
                    <span>Collaborate with product managers to define technical requirements and roadmaps.</span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">check_circle</span>
                    <span>Mentor junior and mid-level engineers through code reviews and pair programming.</span>
                  </li>
                </ul>
              </section>
              <section>
                <h3 className="font-h3 text-h3 text-on-surface mb-md">Requirements</h3>
                <ul className="space-y-sm">
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">arrow_forward</span>
                    <span>5+ years of experience in backend development at a high-growth tech company.</span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">arrow_forward</span>
                    <span>Strong proficiency in Python, Django, and SQL databases (PostgreSQL/MySQL).</span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">arrow_forward</span>
                    <span>Experience with distributed systems, message brokers (Kafka/RabbitMQ), and Redis.</span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary mt-1 text-[16px]">arrow_forward</span>
                    <span>Background in Fintech or Payments is a significant plus.</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 space-y-lg">
              <div className="bg-surface-container rounded-xl p-lg border border-outline-variant shadow-lg">
                <h3 className="font-h3 text-h3 mb-md">Apply Now</h3>
                <p className="text-caption text-on-surface-variant mb-lg">Join the fintech revolution in the MENA region. This position is currently open for applications.</p>
                <div className="space-y-md">
                  <button 
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-bold hover:bg-primary transition-all flex items-center justify-center gap-sm shadow-lg shadow-primary-container/20"
                  >
                    Submit Application
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                  <button className="w-full border border-outline-variant py-md rounded-lg font-bold hover:bg-surface-container-high transition-all flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    Save for Later
                  </button>
                </div>
                
                <hr className="my-lg border-outline-variant"/>
                
                <div className="space-y-md">
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">Posted:</span>
                    <span className="text-on-surface font-medium">2 days ago</span>
                  </div>
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">Applicants:</span>
                    <span className="text-on-surface font-medium">124</span>
                  </div>
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">Salary Range:</span>
                    <span className="text-tertiary font-bold">Confidential</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-container-high rounded-xl p-lg border border-outline-variant border-dashed">
                <p className="text-caption text-on-surface-variant text-center">Looking for similar roles?</p>
                <button className="w-full mt-sm text-primary font-bold text-caption hover:underline">View all jobs at Paymob</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Senior Software Engineer"
      >
        <form onSubmit={handleSubmit(handleApply)} className="space-y-lg">
          <div className="space-y-sm">
            <label className="block font-label-tag text-on-surface-variant uppercase">Choose Resume</label>
            <div className="relative">
              <select 
                {...register("resume")}
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-md px-md text-on-surface focus:ring-2 focus:ring-tertiary focus:outline-none appearance-none cursor-pointer"
              >
                <option>Sarah_Ahmed_CV_2024.pdf</option>
                <option>Sarah_Ahmed_Product_Lead_CV.pdf</option>
                <option>+ Upload New Resume</option>
              </select>
              <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <div className="space-y-sm">
            <label className="block font-label-tag text-on-surface-variant uppercase">Cover Note (Optional)</label>
            <textarea 
              {...register("coverNote")}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-md px-md text-on-surface focus:ring-2 focus:ring-tertiary focus:outline-none resize-none" 
              placeholder="Explain why you're a great fit for this role at Paymob..." 
              rows="5"
            ></textarea>
          </div>
          <div className="bg-surface-container-high/50 p-md rounded-lg flex items-start gap-md border border-outline-variant">
            <span className="material-symbols-outlined text-tertiary">info</span>
            <p className="text-caption text-on-surface-variant">Your profile and contact details will be shared with Paymob's recruitment team automatically.</p>
          </div>
          <div className="flex gap-md pt-md">
            <Button 
              variant="outline" 
              type="button" 
              className="flex-1" 
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              className="flex-1 shadow-lg shadow-primary-container/20"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
