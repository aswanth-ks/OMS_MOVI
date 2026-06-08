import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';

// --- MOCK DATA ---
const PROJECTS_HEALTH = [
  {
    id: 'PRJ-101', name: 'Cloud Migration Phase 2',
    progress: 75, health: 'On Track', statusColor: 'bg-[#10B981]',
    stats: { total: 42, done: 30, inProgress: 8, pending: 4 },
    budget: { spent: 450, total: 600, unit: 'hrs' },
    blockers: 0
  },
  {
    id: 'PRJ-102', name: 'Mobile App Redesign',
    progress: 42, health: 'At Risk', statusColor: 'bg-[#F59E0B]',
    stats: { total: 28, done: 12, inProgress: 10, pending: 6 },
    budget: { spent: 320, total: 400, unit: 'hrs' },
    blockers: 3
  },
  {
    id: 'PRJ-104', name: 'Internal Tools v3.0',
    progress: 92, health: 'On Track', statusColor: 'bg-[#10B981]',
    stats: { total: 15, done: 14, inProgress: 1, pending: 0 },
    budget: { spent: 110, total: 150, unit: 'hrs' },
    blockers: 0
  }
];

const ACTIVE_BLOCKERS = [
  { id: 'BLK-01', task: 'Approve AWS IAM Roles', project: 'Mobile App Redesign', assignee: 'Alex Wong', timeBlocked: '2 days', priority: 'Critical' },
  { id: 'BLK-02', task: 'Design System Figma Handoff', project: 'Mobile App Redesign', assignee: 'Sarah Jenkins', timeBlocked: '4 hours', priority: 'High' },
  { id: 'BLK-03', task: 'API Rate Limit Issue', project: 'Mobile App Redesign', assignee: 'Mike Ross', timeBlocked: '1 day', priority: 'High' },
];

const RESOURCE_WARNINGS = [
  { member: 'Alex Wong', role: 'Backend Dev', project: 'Mobile App Redesign', warning: 'Allocated 50 hrs/week (125% capacity)', severity: 'High' },
  { member: 'Frontend Team', role: 'Department', project: 'Multiple', warning: 'Velocity dropped 15% this sprint', severity: 'Medium' }
];

export default function PMOMonitoring() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-8 max-w-[1400px] mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Project Monitoring</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Deep dive into project execution, active bottlenecks, and resource utilization.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/pmo/timeline')}
              className="border border-[#E2E8F0] bg-white text-[#0F172A] px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              View Timeline
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Project Health Cards */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">donut_large</span>
              Execution Health
            </h2>

            <div className="space-y-5">
              {PROJECTS_HEALTH.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: p.health === 'On Track' ? '#10B981' : p.health === 'At Risk' ? '#F59E0B' : '#EF4444' }} />
                  
                  <div className="flex items-start justify-between mb-5 pl-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">{p.id}</span>
                        <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          p.health === 'On Track' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFFBEB] text-[#D97706]'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {p.health}
                        </div>
                        {p.blockers > 0 && (
                          <div className="text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            {p.blockers} Blockers
                          </div>
                        )}
                      </div>
                      <h3 className="text-[18px] font-bold text-[#0F172A]">{p.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[28px] font-black text-[#0F172A] leading-none">{p.progress}%</p>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Complete</p>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden mb-6 pl-2">
                    <div className={`h-full ${p.statusColor} rounded-full`} style={{ width: `${p.progress}%` }} />
                  </div>

                  <div className="grid grid-cols-4 gap-4 pl-2">
                    {[
                      { label: 'Total Tasks', value: p.stats.total, color: 'text-[#0F172A]' },
                      { label: 'Completed', value: p.stats.done, color: 'text-[#10B981]' },
                      { label: 'In Progress', value: p.stats.inProgress, color: 'text-[#2563EB]' },
                      { label: 'Hours Spent', value: `${p.budget.spent} / ${p.budget.total}`, color: 'text-[#64748B]' },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                        <p className={`text-[16px] font-black ${stat.color} leading-none mb-1`}>{stat.value}</p>
                        <p className="text-[11px] font-bold text-[#64748B]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Blockers & Warnings */}
          <div className="space-y-6">
            
            <h2 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#EF4444] text-[20px]">report</span>
              Attention Required
            </h2>

            {/* Blockers */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#FEF2F2] flex justify-between items-center">
                <h3 className="text-[13px] font-bold text-[#DC2626] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">back_hand</span>
                  Active Blockers
                </h3>
                <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{ACTIVE_BLOCKERS.length}</span>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {ACTIVE_BLOCKERS.map(b => (
                  <div key={b.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{b.task}</p>
                      <span className="text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 rounded-full shrink-0">
                        {b.timeBlocked}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mb-2">{b.project}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-[#2563EB] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span> {b.assignee}
                      </p>
                      <button className="text-[11px] font-bold text-[#0F172A] border border-[#E2E8F0] px-3 py-1 rounded-md hover:bg-[#E2E8F0] transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Warnings */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#FFFBEB] flex items-center gap-2">
                <h3 className="text-[13px] font-bold text-[#D97706] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  Resource Warnings
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {RESOURCE_WARNINGS.map((w, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <p className="text-[12px] font-bold text-[#0F172A] mb-0.5">{w.member} <span className="text-[#64748B] font-normal">({w.role})</span></p>
                    <p className="text-[11px] text-[#DC2626] font-medium leading-relaxed">{w.warning}</p>
                  </div>
                ))}
                <button className="w-full py-2 mt-2 bg-white border border-[#E2E8F0] rounded-lg text-[12px] font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                  Reallocate Resources
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
