import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { 
  CheckSquare, AlertCircle, CalendarDays, Clock, Play, FileText, 
  ExternalLink, GraduationCap, CheckCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/intern/profile
const mockIntern = {
  _id: "64f1a2b3c4d5e6f7a8b9c0d1",
  name: "Rahul Mehta",
  email: "rahul.mehta@intern.movicloudlabs.com",
  employeeId: "INT-2024-001",
  avatar: "RM",
  college: "NIT Trichy",
  department: { _id: "dept001", name: "Engineering" },
  project: { _id: "proj001", name: "OWMS Internal Platform v2", status: "Active" },
  mentor: { _id: "emp001", name: "Alex Wong", role: "Senior Developer" },
  hrManager: { _id: "hr001", name: "Sarah Johnson" },
  pmoLead: { _id: "pmo001", name: "Aswanth K" },
  startDate: "2024-09-01T00:00:00Z",
  endDate: "2024-11-30T00:00:00Z",
  status: "Active",
  leaveBalance: { casual: 3, sick: 2, used: 1 },
  performanceRatings: [
    { week: 1, rating: 4, note: "Good start, quick learner" },
    { week: 2, rating: 3, note: "Needs to improve on deadlines" },
    { week: 3, rating: 4, note: "Back on track, solid work" },
    { week: 4, rating: 5, note: "Excellent work on the API module" },
  ]
};

const MOCK_TASKS = [
  { id: 1, title: 'Build Login Page UI', priority: 'High', priorityColor: 'bg-orange-500', status: 'In Progress', due: 'Today' },
  { id: 2, title: 'API Integration for Auth', priority: 'Critical', priorityColor: 'bg-red-500', status: 'Todo', due: 'Today' },
  { id: 3, title: 'Fix Navbar Responsive Issue', priority: 'Medium', priorityColor: 'bg-amber-500', status: 'In Review', due: 'Today' },
];

const MOCK_DEADLINES = [
  { id: 1, title: 'Submit Weekly Report', date: 'Tomorrow', priority: 'Medium', urgency: 'amber' },
  { id: 2, title: 'Auth Module Code Review', date: 'Oct 15', priority: 'High', urgency: 'blue' },
  { id: 3, title: 'Final Demo Prep', date: 'Oct 20', priority: 'Critical', urgency: 'gray' },
];

const MOCK_ACTIVITIES = [
  { id: 1, text: "Task 'Build Login Page' marked In Progress", time: "2h ago", color: "bg-blue-500" },
  { id: 2, text: "New task assigned by Alex Wong", time: "Yesterday", color: "bg-purple-500" },
  { id: 3, text: "Task 'Fix Navbar' completed and approved", time: "2 days ago", color: "bg-green-500" },
];

const MOCK_LEARNING = [
  { id: 1, title: "React 18 Fundamentals", type: "Course", date: "Oct 20", status: "In Progress", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-100" },
  { id: 2, title: "OWMS API Guide", type: "Document", date: "Oct 15", status: "Pending", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
];

// Sub-components
const CircularProgress = ({ percentage }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle cx="60" cy="60" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="none" />
        <motion.circle 
          cx="60" cy="60" r={radius} stroke="#2563EB" strokeWidth="8" fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-[#2563EB]">{percentage}%</span>
      </div>
    </div>
  );
};

export default function InternDashboard() {
  const navigate = useNavigate();

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'red': return 'bg-red-500';
      case 'amber': return 'bg-amber-500';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto pb-8 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Good morning, {mockIntern.name}</h1>
            <p className="text-sm text-[#64748B] mt-1">{mockIntern.college} &middot; {mockIntern.department.name} Intern</p>
          </div>
          <div>
            <p className="text-sm text-[#64748B] font-medium">Monday, October 12, 2024</p>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">12 Tasks</p>
              <p className="text-xs text-[#64748B]">8 completed</p>
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">2 Overdue</p>
              <p className="text-xs text-[#64748B]">Need attention</p>
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">94%</p>
              <p className="text-xs text-[#64748B]">26/28 days</p>
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">4 Days</p>
              <p className="text-xs text-[#64748B]">1 used this year</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN 65% */}
          <div className="w-full lg:w-[65%] space-y-6">
            
            {/* Today's Tasks */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[#0F172A]">Today's Tasks</h2>
                  <span className="bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-0.5 rounded font-bold">Oct 12</span>
                </div>
                <button onClick={() => navigate('/intern/tasks')} className="text-sm font-bold text-[#2563EB] hover:underline">
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_TASKS.map(task => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-[#E2E8F0] rounded-lg hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className={`w-2 h-2 rounded-full ${task.priorityColor}`} />
                      <span className="text-sm font-medium text-[#0F172A]">{task.title}</span>
                      <span className="text-xs bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded ml-2 hidden sm:inline-block">OWMS v2</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 pl-5 sm:pl-0">
                      <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">Due {task.due}</span>
                      <div className="w-24">
                        {task.status === 'Todo' && <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded w-full inline-block text-center">Todo</span>}
                        {task.status === 'In Progress' && <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded w-full inline-block text-center">In Progress</span>}
                        {task.status === 'In Review' && <span className="text-[11px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded w-full inline-block text-center">In Review</span>}
                      </div>
                      <div className="w-24 flex justify-end">
                        {task.status === 'Todo' && <button className="text-[11px] font-bold text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF] px-3 py-1 rounded transition-colors">Start</button>}
                        {task.status === 'In Progress' && <button className="text-[11px] font-bold text-purple-600 border border-purple-600 hover:bg-purple-50 px-3 py-1 rounded transition-colors">Submit</button>}
                        {task.status === 'In Review' && <button disabled className="text-[11px] font-bold text-slate-400 border border-slate-200 bg-slate-50 px-3 py-1 rounded cursor-not-allowed">Waiting</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Project Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-semibold text-[#0F172A]">My Project</h2>
                <span className="bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-2 py-0.5 rounded">Active</span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">{mockIntern.project.name}</h3>
              <p className="text-sm text-[#64748B] mt-1 line-clamp-2">
                A massive internal refactoring project to upgrade legacy systems to the new React 18 architecture.
              </p>
              
              <div className="mt-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-[#0F172A]">My Contribution</span>
                  <span className="text-xs font-bold text-[#2563EB]">8 of 12 tasks completed</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '66%' }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 text-sm text-[#64748B]">
                <p><strong>PMO Lead:</strong> {mockIntern.pmoLead.name}</p>
                <span className="hidden sm:inline text-slate-300">|</span>
                <p><strong>Mentor:</strong> {mockIntern.mentor.name}</p>
                <span className="hidden sm:inline text-slate-300">|</span>
                <p><strong>Due:</strong> Nov 30, 2026</p>
              </div>
              
              <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                <button onClick={() => navigate('/intern/tasks')} className="text-sm font-bold text-[#2563EB] hover:underline">
                  View Project Tasks &rarr;
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F172A] mb-5">Recent Activity</h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-0.5 before:bg-[#E2E8F0]">
                {MOCK_ACTIVITIES.map(act => (
                  <div key={act.id} className="relative flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full border-2 border-white z-10 ${act.color}`} />
                    <div className="flex-1">
                      <p className="text-sm text-[#0F172A]">{act.text}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN 35% */}
          <div className="w-full lg:w-[35%] space-y-6">
            
            {/* Internship Progress */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col items-center text-center">
              <h2 className="font-semibold text-[#0F172A] w-full text-left mb-6">Internship Progress</h2>
              <CircularProgress percentage={45} />
              <p className="text-xs text-[#64748B] mt-2 mb-4">of internship complete</p>
              
              <div className="flex gap-4 w-full justify-center text-sm font-medium text-[#0F172A] mb-5">
                <div><span className="text-[#64748B] text-xs block">Start</span>Sep 01</div>
                <div className="w-px bg-slate-200"></div>
                <div><span className="text-[#64748B] text-xs block">End</span>Nov 30</div>
              </div>
              
              <div className="bg-[#EFF6FF] text-[#2563EB] px-4 py-1.5 rounded-full text-sm font-bold inline-block">
                45 days remaining
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F172A] mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {MOCK_DEADLINES.map(dl => (
                  <div key={dl.id} className="flex gap-3">
                    <div className={`w-1 rounded-full shrink-0 ${getUrgencyColor(dl.urgency)}`} />
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-[#0F172A]">{dl.title}</p>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{dl.priority}</span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{dl.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Rating */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-[#0F172A]">My Performance</h2>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">&uarr; Improving</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <h3 className="text-3xl font-bold text-[#0F172A]">4.2<span className="text-lg text-slate-400">/5</span></h3>
                  <p className="text-xs font-medium text-[#64748B] mt-1">Overall Rating</p>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="flex-1">
                  <p className="text-xs text-[#64748B] mb-1">Week 4 Rating</p>
                  <div className="flex gap-0.5 text-amber-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#64748B] italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                "Excellent work on the API module. Quick learner."
              </p>
            </div>

            {/* Learning Resources */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-[#0F172A]">Learning</h2>
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">2 pending</span>
              </div>
              <div className="space-y-3 mb-4">
                {MOCK_LEARNING.map(lr => {
                  const Icon = lr.icon;
                  return (
                    <div key={lr.id} className="flex gap-3 items-center border border-[#E2E8F0] p-2.5 rounded-lg">
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${lr.bg} ${lr.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0F172A] truncate">{lr.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">Due {lr.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => navigate('/intern/learning')} className="text-sm font-bold text-[#2563EB] hover:underline">
                View All Resources &rarr;
              </button>
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  );
}