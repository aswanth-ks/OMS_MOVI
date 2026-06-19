import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Pencil, Download, Archive, Trash2, CheckSquare, Clock, AlertCircle, 
  Users, GraduationCap, Flag, FileText, Plus, UserPlus, File, Eye 
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { TaskDetailModal } from '../../components/pmo/TaskDetailModal';
import { WorkloadBar } from '../../components/pmo/WorkloadBar';
import { InternProgressRing } from '../../components/pmo/InternProgressRing';
import { ProjectHealthBadge } from '../../components/pmo/ProjectHealthBadge';
import { MilestoneTimeline } from '../../components/pmo/MilestoneTimeline';
import { pmoAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedTask, setSelectedTask] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const TABS = ['Overview', 'Tasks', 'Team', 'Interns', 'Timeline', 'Files', 'Activity'];

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projRes = await pmoAPI.getProject(id);
      setProject(projRes.data.data);
      
      const tasksRes = await pmoAPI.getTasks({ projectId: id });
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  // Compute stats for team members based on project tasks
  const teamWithTaskStats = (project?.team || []).map(member => {
    const memberTasks = tasks.filter(t => t.assignedTo?._id === member.user?._id);
    const tasksAssigned = memberTasks.length;
    const tasksDone = memberTasks.filter(t => t.status === 'Done').length;
    
    // Simple mock workload mapping if not present
    const workload = memberTasks.filter(t => t.status !== 'Done').length * 15;

    return {
      ...member,
      tasksAssigned,
      tasksDone,
      workload: Math.min(workload, 100)
    };
  });

  // Compute stats for interns based on project tasks
  const internsWithTaskStats = (project?.interns || []).map(intern => {
    const internTasks = tasks.filter(t => t.assignedTo?._id === intern.user?._id);
    const tasksAssigned = internTasks.length;
    const tasksDone = internTasks.filter(t => t.status === 'Done').length;
    
    return {
      ...intern,
      tasksAssigned,
      tasksDone
    };
  });

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-24">
          <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
        </div>
      );
    }

    if (!project) {
      return (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-[#0F172A]">Project Not Found</h3>
          <p className="text-sm mt-1">This project does not exist or you do not have permission to view it.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Overview':
        return <OverviewTab project={project} team={teamWithTaskStats} />;
      case 'Tasks':
        return <TasksTab tasks={tasks} onTaskClick={setSelectedTask} />;
      case 'Team':
        return <TeamTab team={teamWithTaskStats} navigate={navigate} />;
      case 'Interns':
        return <InternsTab interns={internsWithTaskStats} navigate={navigate} />;
      case 'Timeline':
        return <TimelineTab project={project} />;
      case 'Files':
        return <FilesTab />;
      case 'Activity':
        return <ActivityTab project={project} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
          <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
        </div>
      </PageWrapper>
    );
  }

  if (!project) {
    return (
      <PageWrapper>
        <div className="p-8 text-center bg-[#F8FAFC] h-full flex flex-col justify-center items-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-[#0F172A]">Project Not Found</h1>
          <button onClick={() => navigate('/pmo/projects')} className="mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold">Back to Projects</button>
        </div>
      </PageWrapper>
    );
  }

  // Calculate task counts
  const totalTasksCount = project.tasks?.total ?? tasks.length;
  const completedTasksCount = project.tasks?.done ?? tasks.filter(t => t.status === 'Done').length;
  const inProgressTasksCount = project.tasks?.inProgress ?? tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasksCount = project.tasks?.overdue ?? 0;

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full bg-[#F8FAFC]">
        
        {/* HEADER SECTION */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-6 flex flex-col gap-4 text-left">
          {/* Row 1: Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#64748B] font-medium">
            <span className="hover:text-[#0F172A] cursor-pointer" onClick={() => navigate('/pmo/dashboard')}>PMO</span>
            <ChevronRight size={14} />
            <span className="hover:text-[#0F172A] cursor-pointer" onClick={() => navigate('/pmo/projects')}>Projects</span>
            <ChevronRight size={14} />
            <span className="text-[#0F172A]">{project.name}</span>
          </div>

          {/* Row 2: Identity */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-[#0F172A]">{project.name}</h1>
              <div className="flex items-center gap-2">
                <ProjectHealthBadge status={project.status} />
                <span className={`px-2 py-1 text-xs font-bold rounded border ${
                  project.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' :
                  project.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {project.priority || 'Medium'} Priority
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg border border-transparent transition-colors flex items-center gap-2">
                <Pencil size={16} /> Edit Project
              </button>
              <button className="px-3 py-1.5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg border border-transparent transition-colors flex items-center gap-2">
                <Download size={16} /> Export Report
              </button>
              <button className="px-3 py-1.5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg border border-transparent transition-colors flex items-center gap-2">
                <Archive size={16} /> Archive
              </button>
              <button className="px-3 py-1.5 text-sm font-semibold text-[#DC2626] border border-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {/* Row 3: Stat Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-semibold text-[#0F172A] gap-4">
              <span className="flex items-center gap-2"><CheckSquare size={16} className="text-[#64748B]" /> Total Tasks: {totalTasksCount}</span>
              <span className="w-[1px] h-4 bg-[#E2E8F0] hidden sm:block"></span>
              <span className="flex items-center gap-2 text-[#16A34A]"><CheckSquare size={16} /> Completed: {completedTasksCount}</span>
              <span className="w-[1px] h-4 bg-[#E2E8F0] hidden sm:block"></span>
              <span className="flex items-center gap-2 text-[#2563EB]"><Clock size={16} /> In Progress: {inProgressTasksCount}</span>
              <span className="w-[1px] h-4 bg-[#E2E8F0] hidden sm:block"></span>
              <span className="flex items-center gap-2 text-[#DC2626]"><AlertCircle size={16} /> Overdue: {overdueTasksCount}</span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 flex gap-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT AREA */}
        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </PageWrapper>
  );
}

// --- TAB COMPONENTS ---

const OverviewTab = ({ project, team }) => {
  const managerName = project.manager?.name || 'Unknown PMO';
  const managerAvatar = project.manager?.avatar || managerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const deptName = project.department?.name || 'Engineering';
  const startDateStr = project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A';
  const endDateStr = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A';
  const budgetAllocated = project.budget?.allocated || project.budget || 0;
  const budgetSpent = project.budget?.spent || project.budgetSpent || 0;
  const healthPercent = project.completionPercent || 0;
  const healthStatus = project.healthStatus || 'On Track';
  
  // Tasks calculations
  const totalTasks = project.tasks?.total || 0;
  const doneTasks = project.tasks?.done || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-left">
      {/* Left Column (60%) */}
      <div className="flex-[3] space-y-6">
        
        {/* Project Information */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Project Information</h3>
          <p className="text-sm text-[#475569] leading-relaxed mb-6">{project.description || 'No description provided.'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Project Manager</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{managerAvatar}</div>
                <span className="text-sm font-semibold text-[#0F172A]">{managerName}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Department</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569]">{deptName}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Timeline</p>
              <p className="text-sm font-semibold text-[#0F172A]">{startDateStr} → {endDateStr}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Budget</p>
              <p className="text-sm font-semibold text-[#0F172A]">₹{budgetAllocated.toLocaleString()}</p>
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider mr-2 self-center">Tags:</span>
              {project.tags.map(tag => (
                <span key={tag} className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Milestones</h3>
          <MilestoneTimeline milestones={project.milestones || []} />
          <button className="mt-6 w-full py-2.5 border-2 border-dashed border-[#E2E8F0] text-[#64748B] font-bold text-sm rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Add Milestone
          </button>
        </div>

      </div>

      {/* Right Column (40%) */}
      <div className="flex-[2] space-y-6">
        
        {/* Project Health */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A] mb-6">Project Health</h3>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full border-8 border-[#10B981] flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-[#0F172A]">{healthPercent}%</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#10B981]">{healthStatus}</h4>
              <p className="text-xs font-medium text-[#64748B] mt-1">Based on task completion and milestone dates.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#64748B]">Task Progress</span>
                <span className="text-[#0F172A]">{doneTasks} of {totalTasks} done</span>
              </div>
              <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${totalTasks > 0 ? (doneTasks/totalTasks)*100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#64748B]">Budget Spent</span>
                <span className="text-[#0F172A]">₹{(budgetSpent/100000).toFixed(1)}L of ₹{(budgetAllocated/100000).toFixed(1)}L</span>
              </div>
              <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${budgetAllocated > 0 ? (budgetSpent/budgetAllocated)*100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#0F172A] flex items-center gap-3 transition-colors">
              <Plus size={18} className="text-[#64748B]" /> Add Task
            </button>
            <button className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#0F172A] flex items-center gap-3 transition-colors">
              <UserPlus size={18} className="text-[#64748B]" /> Add Team Member
            </button>
            <button className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#0F172A] flex items-center gap-3 transition-colors">
              <GraduationCap size={18} className="text-[#64748B]" /> Assign Intern
            </button>
            <button className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#0F172A] flex items-center gap-3 transition-colors">
              <Flag size={18} className="text-[#64748B]" /> Add Milestone
            </button>
            <button className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#0F172A] flex items-center gap-3 transition-colors">
              <FileText size={18} className="text-[#64748B]" /> Generate Report
            </button>
          </div>
        </div>

        {/* Team Summary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#0F172A]">Team Summary</h3>
          </div>
          <div className="space-y-4">
            {team.slice(0, 4).map((member, i) => {
              const name = member.user?.name || 'Unknown';
              const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={member.user?._id || i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#EFF6FF] text-[#1D4ED8]">{initial}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0F172A] leading-tight">{name}</p>
                    <p className="text-xs text-[#64748B]">{member.role}</p>
                  </div>
                  <span className="text-xs font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full">{member.tasksDone}/{member.tasksAssigned} tasks</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

const TasksTab = ({ tasks, onTaskClick }) => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden text-left">
    <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
      <input type="text" placeholder="Search tasks..." className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-1 focus:ring-[#2563EB] outline-none" />
      <div className="flex gap-2">
        <button className="px-4 py-1.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] flex items-center gap-2">
          <Plus size={16} /> Add Task
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-[#475569]">
        <thead className="bg-[#F8FAFC] text-xs uppercase font-bold text-[#64748B] border-b border-[#E2E8F0]">
          <tr>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Points</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {tasks.map(t => (
            <tr key={t._id} className="hover:bg-[#F8FAFC] cursor-pointer" onClick={() => onTaskClick(t)}>
              <td className="px-4 py-4 font-semibold text-[#0F172A]">{t.title}</td>
              <td className="px-4 py-4">{t.assignedTo?.name || 'Unassigned'}</td>
              <td className="px-4 py-4">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</td>
              <td className="px-4 py-4">
                <span className="bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded text-xs font-bold">{t.status}</span>
              </td>
              <td className="px-4 py-4 font-bold">{t.effortPoints || 0} pts</td>
              <td className="px-4 py-4">
                <button className="text-[#64748B] hover:text-[#0F172A]"><Eye size={16} /></button>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-12 text-[#64748B]">No tasks defined for this project.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const TeamTab = ({ team, navigate }) => (
  <div className="space-y-6 text-left">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-bold text-[#0F172A]">Project Team ({team.length})</h2>
      <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
        <UserPlus size={16} /> Add Team Member
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {team.map((member, i) => {
        const name = member.user?.name || 'Unknown';
        const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div key={member.user?._id || i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[#EFF6FF] text-[#1D4ED8]">{initial}</div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{name}</h3>
                <p className="text-xs text-[#64748B] font-medium">{member.role} · {member.user?.designation || 'Staff'}</p>
              </div>
            </div>
            <div className="flex justify-between text-center divide-x divide-[#E2E8F0] border-y border-[#E2E8F0] py-3 mb-4">
              <div className="flex-1"><p className="text-sm font-bold text-[#0F172A]">{member.tasksAssigned}</p><p className="text-[10px] uppercase font-bold text-[#64748B]">Assigned</p></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#16A34A]">{member.tasksDone}</p><p className="text-[10px] uppercase font-bold text-[#64748B]">Done</p></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#0F172A]">{member.tasksAssigned > 0 ? Math.round((member.tasksDone/member.tasksAssigned)*100) : 0}%</p><p className="text-[10px] uppercase font-bold text-[#64748B]">Completion</p></div>
            </div>
            <WorkloadBar percentage={member.workload} size="sm" />
            <div className="mt-5 flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); if(member.user?._id) navigate(`/hr/employees/${member.user._id}`); }} className="flex-1 py-1.5 border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F8FAFC]">View Profile</button>
              <button className="flex-1 py-1.5 border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F8FAFC]">Assign Task</button>
            </div>
          </div>
        );
      })}
      {team.length === 0 && (
        <div className="col-span-2 py-12 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-white text-[#64748B]">No team members allocated to this project.</div>
      )}
    </div>
  </div>
);

const InternsTab = ({ interns, navigate }) => (
  <div className="space-y-6 text-left">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-bold text-[#0F172A]">Assigned Interns ({interns.length})</h2>
      <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
        <Plus size={16} /> Assign Intern
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {interns.map((intern, i) => {
        const name = intern.user?.name || 'Unknown Intern';
        const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div key={intern.user?._id || i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xl font-bold mb-3">{initial}</div>
            <h3 className="text-base font-bold text-[#0F172A]">{name}</h3>
            <p className="text-xs text-[#64748B] mb-4 bg-[#F1F5F9] inline-block px-2 py-1 rounded">{intern.user?.college || 'N/A'}</p>
            <div className="flex justify-center mb-4">
              <InternProgressRing percentage={intern.tasksAssigned > 0 ? Math.round((intern.tasksDone/intern.tasksAssigned)*100) : 0} size={64} />
            </div>
            <p className="text-xs font-bold text-[#64748B] mb-5">{intern.tasksDone} of {intern.tasksAssigned} tasks done</p>
            <div className="mt-auto flex gap-2 w-full">
              <button onClick={() => { if(intern.user?._id) navigate(`/hr/interns/${intern.user._id}`); }} className="flex-1 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F1F5F9]">View Profile</button>
            </div>
          </div>
        );
      })}
      {interns.length === 0 && (
        <div className="col-span-full py-12 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-white text-[#64748B] w-full">No interns assigned to this project.</div>
      )}
    </div>
  </div>
);

const TimelineTab = () => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
    <Clock size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-bold text-[#0F172A]">Project Timeline</h3>
    <p className="text-sm mt-1">Gantt view scoped to this project will render here.</p>
  </div>
);

const FilesTab = () => (
  <div className="space-y-6 text-left">
    <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-12 text-center hover:bg-[#F8FAFC] cursor-pointer transition-colors">
      <File size={48} className="mx-auto mb-4 text-[#94A3B8]" />
      <h3 className="text-base font-bold text-[#0F172A] mb-1">Drop files here or click to browse</h3>
      <p className="text-xs font-medium text-[#64748B]">Max 10MB per file · PDF, XLSX, DOCX, PNG, JPG supported</p>
    </div>
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-sm">
      <p className="text-sm font-bold text-[#64748B]">No files uploaded yet.</p>
    </div>
  </div>
);

const ActivityTab = ({ project }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm text-left">
    <div className="space-y-6 pl-4 border-l-2 border-[#E2E8F0] ml-4">
      <div className="relative">
        <div className="absolute -left-[25px] w-3 h-3 bg-blue-500 rounded-full mt-1.5 ring-4 ring-white" />
        <p className="text-sm text-[#0F172A]">Project created with priority <span className="font-bold text-orange-600">{project.priority || 'Medium'}</span></p>
        <p className="text-xs font-bold text-[#64748B] mt-0.5">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  </div>
);
