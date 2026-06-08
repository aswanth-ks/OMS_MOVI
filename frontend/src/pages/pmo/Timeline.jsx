import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';

// --- MOCK DATA ---
const GANTT_PROJECTS = [
  {
    id: 'PRJ-101', name: 'Cloud Migration Phase 2', manager: 'Sarah Jenkins', health: 'On Track', color: 'bg-[#10B981]',
    startWeek: 1, durationWeeks: 5,
    milestones: [
      { week: 2, name: 'Data Mapped' },
      { week: 5, name: 'Cutover Complete' }
    ]
  },
  {
    id: 'PRJ-102', name: 'Mobile App Redesign', manager: 'Mike Ross', health: 'At Risk', color: 'bg-[#F59E0B]',
    startWeek: 2, durationWeeks: 7,
    milestones: [
      { week: 4, name: 'Design Handoff' },
      { week: 8, name: 'Beta Release' }
    ]
  },
  {
    id: 'PRJ-103', name: 'Q4 Security Audit', manager: 'Alex Wong', health: 'Delayed', color: 'bg-[#EF4444]',
    startWeek: 1, durationWeeks: 3,
    milestones: [
      { week: 3, name: 'Audit Report' }
    ]
  },
  {
    id: 'PRJ-104', name: 'Internal Tools v3.0', manager: 'Jessica Pearson', health: 'On Track', color: 'bg-[#10B981]',
    startWeek: 5, durationWeeks: 6,
    milestones: [
      { week: 7, name: 'MVP Launch' },
      { week: 10, name: 'Full Rollout' }
    ]
  }
];

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];

export default function PMOTimeline() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState('Weeks'); // Weeks or Months

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-8 max-w-[1400px] mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Project Timeline</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Gantt chart view for tracking long-term delivery schedules and milestones.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1">
              {['Weeks', 'Months', 'Quarters'].map(v => (
                <button 
                  key={v}
                  onClick={() => setViewState(v)}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                    viewState === v ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button 
              onClick={() => navigate('/pmo/monitoring')}
              className="border border-[#E2E8F0] bg-white text-[#0F172A] px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">donut_large</span>
              View Monitoring
            </button>
          </div>
        </div>

        {/* GANTT CHART */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          
          {/* Gantt Header */}
          <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
            {/* Left Sidebar Header */}
            <div className="w-[300px] shrink-0 p-4 border-r border-[#E2E8F0] flex items-center">
              <h3 className="text-[13px] font-bold text-[#0F172A]">Projects & Milestones</h3>
            </div>
            {/* Timeline Header */}
            <div className="flex-1 flex overflow-hidden">
              {WEEKS.map((w, i) => (
                <div key={i} className="flex-1 min-w-[60px] border-r border-[#E2E8F0] last:border-r-0 p-3 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-[#64748B]">{w}</span>
                  <span className="text-[10px] text-[#94A3B8] mt-0.5">Oct {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Body */}
          <div className="flex flex-col divide-y divide-[#F1F5F9] bg-[linear-gradient(90deg,transparent_calc(100%-1px),#F8FAFC_calc(100%-1px))] bg-[length:calc((100%-300px)/12)_100%] bg-no-repeat bg-right">
            {GANTT_PROJECTS.map((proj) => (
              <div key={proj.id} className="flex relative group hover:bg-[#F8FAFC] transition-colors">
                
                {/* Left Sidebar (Project Details) */}
                <div className="w-[300px] shrink-0 p-4 border-r border-[#E2E8F0] bg-white group-hover:bg-[#F8FAFC] transition-colors z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">{proj.id}</span>
                    <span className={`w-2 h-2 rounded-full ${proj.color}`} />
                  </div>
                  <h4 className="text-[14px] font-bold text-[#0F172A] leading-tight mb-1">{proj.name}</h4>
                  <p className="text-[11px] font-medium text-[#64748B]">PM: {proj.manager}</p>
                </div>

                {/* Timeline Area */}
                <div className="flex-1 relative py-4">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {WEEKS.map((_, i) => (
                      <div key={i} className="flex-1 min-w-[60px] border-r border-[#F1F5F9] last:border-r-0" />
                    ))}
                  </div>

                  {/* Project Duration Bar */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg ${proj.color} bg-opacity-20 border ${proj.color.replace('bg-', 'border-')} flex items-center px-3 shadow-sm transition-all hover:brightness-95 cursor-pointer z-10`}
                    style={{
                      left: `calc(${((proj.startWeek - 1) / 12) * 100}%)`,
                      width: `calc(${(proj.durationWeeks / 12) * 100}%)`
                    }}
                  >
                    <div className={`h-full w-1 absolute left-0 top-0 rounded-l-lg ${proj.color}`} />
                    <span className="text-[11px] font-bold text-[#0F172A] ml-1 truncate">
                      {proj.durationWeeks} Weeks
                    </span>
                  </div>

                  {/* Milestones */}
                  {proj.milestones.map((ms, idx) => (
                    <div 
                      key={idx}
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 group/ms cursor-pointer"
                      style={{ left: `calc(${((ms.week - 1) / 12) * 100}% + calc(100% / 24))` }}
                    >
                      <div className="w-3.5 h-3.5 bg-[#2563EB] rotate-45 border-2 border-white shadow-sm group-hover/ms:scale-125 transition-transform" />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover/ms:opacity-100 transition-opacity bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none">
                        {ms.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F172A]" />
                      </div>
                    </div>
                  ))}

                </div>

              </div>
            ))}
          </div>

          {/* Footer Legend */}
          <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-[11px] font-bold text-[#64748B]">
            <div className="flex gap-6">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> On Track</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> At Risk</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Delayed</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#2563EB] rotate-45 ml-1" /> Key Milestone</span>
            </div>
            <span>Showing Next 12 Weeks</span>
          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
