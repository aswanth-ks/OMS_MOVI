import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageWrapper from '../../components/PageWrapper';
import AccessDenied from '../../components/shared/AccessDenied';

// --- MOCK DATA ---
const MOCK_EMPLOYEES = [
  { id: 'EMP-001', name: 'Sarah Jenkins', email: 'sarah.j@movicloudlabs.com', dept: 'Engineering', designation: 'Senior Frontend Engineer', type: 'Full-time', joinDate: '2021-03-15', status: 'Active', avatar: 'S', assignedHR: 'HR' },
  { id: 'EMP-002', name: 'Michael Chang', email: 'michael.c@movicloudlabs.com', dept: 'Design', designation: 'Product Designer', type: 'Full-time', joinDate: '2022-07-01', status: 'Active', avatar: 'M', assignedHR: 'HR' },
  { id: 'EMP-003', name: 'Alex Wong', email: 'alex.w@movicloudlabs.com', dept: 'Engineering', designation: 'Software Engineering Intern', type: 'Intern', joinDate: '2024-01-10', status: 'Active', avatar: 'A', assignedHR: 'ARUN' },
  { id: 'EMP-004', name: 'Jessica Pearson', email: 'jessica.p@movicloudlabs.com', dept: 'Sales', designation: 'Regional Director', type: 'Full-time', joinDate: '2019-11-20', status: 'On Leave', avatar: 'J', assignedHR: 'ARUN' },
  { id: 'EMP-005', name: 'David Kim', email: 'david.k@movicloudlabs.com', dept: 'Marketing', designation: 'Content Strategist', type: 'Part-time', joinDate: '2023-05-12', status: 'Active', avatar: 'D', assignedHR: 'HR' },
  { id: 'EMP-006', name: 'Emma Watson', email: 'emma.w@movicloudlabs.com', dept: 'HR & Ops', designation: 'HR Coordinator', type: 'Contract', joinDate: '2023-09-01', status: 'Active', avatar: 'E', assignedHR: 'ARUN' },
  { id: 'EMP-007', name: 'James Gordon', email: 'james.g@movicloudlabs.com', dept: 'Finance', designation: 'Accountant', type: 'Full-time', joinDate: '2020-02-28', status: 'Terminated', avatar: 'J', assignedHR: 'HR' },
];

const TYPE_COLORS = {
  'Full-time': 'bg-blue-100 text-blue-700',
  'Part-time': 'bg-amber-100 text-amber-700',
  'Contract': 'bg-purple-100 text-purple-700',
  'Intern': 'bg-emerald-100 text-emerald-700'
};

const STATUS_COLORS = {
  'Active': 'bg-[#16A34A]/10 text-[#16A34A]',
  'On Leave': 'bg-[#F59E0B]/10 text-[#D97706]',
  'Terminated': 'bg-[#DC2626]/10 text-[#DC2626]'
};

export default function Employees() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const canRead   = hasPermission('Users', 'read');
  const canExport = hasPermission('Users', 'export');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Only show employees assigned to the logged-in HR user
  const myEmployees = MOCK_EMPLOYEES.filter(emp => !user?.name || emp.assignedHR.toLowerCase() === user.name.toLowerCase());

  // Derived unique lists for filters
  const departments = [...new Set(myEmployees.map(e => e.dept))];
  const types = [...new Set(myEmployees.map(e => e.type))];
  const statuses = [...new Set(myEmployees.map(e => e.status))];

  // Filter logic
  const filteredEmployees = myEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? emp.dept === filterDept : true;
    const matchesType = filterType ? emp.type === filterType : true;
    const matchesStatus = filterStatus ? emp.status === filterStatus : true;
    
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  if (!canRead) return <PageWrapper><AccessDenied message="You don't have permission to view employees." /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-5 max-w-[1440px] mx-auto pb-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Employee Directory</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              View and manage all employee records assigned to you.
            </p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[280px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-md py-1.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            
            {/* Filters */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="border border-[#E2E8F0] rounded-md py-1.5 px-3 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] cursor-pointer bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-[#E2E8F0] rounded-md py-1.5 px-3 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] cursor-pointer bg-white hidden md:block"
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-[#E2E8F0] rounded-md py-1.5 px-3 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] cursor-pointer bg-white hidden md:block"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {(searchTerm || filterDept || filterType || filterStatus) && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterDept(''); setFilterType(''); setFilterStatus(''); }}
                className="text-[13px] text-[#2563EB] hover:underline font-medium px-2"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {canExport && (
              <button className="border border-[#E2E8F0] text-[#0F172A] px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export
              </button>
            )}
          </div>
        </div>

        {/* TABLE VIEW */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Employee</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">ID</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Role</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Type</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Join Date</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Status</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0 cursor-pointer"
                      onClick={() => navigate(`/hr/employees/${emp.id}`)}
                    >
                      {/* Avatar + Name + Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold text-[12px] shrink-0">
                            {emp.avatar}
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-[#0F172A]">{emp.name}</div>
                            <div className="text-[12px] text-[#64748B] mt-0.5">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3 text-[13px] font-mono text-[#64748B]">
                        {emp.id}
                      </td>

                      {/* Department & Designation */}
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium text-[#0F172A]">{emp.dept}</div>
                        <div className="text-[12px] text-[#64748B] mt-0.5">{emp.designation}</div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${TYPE_COLORS[emp.type]}`}>
                          {emp.type}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {new Date(emp.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_COLORS[emp.status]}`}>
                          {emp.status}
                        </span>
                      </td>

                      {/* Actions (Always Visible) */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/hr/employees/${emp.id}`)}
                            className="text-[#64748B] hover:text-[#2563EB] transition-colors"
                            title="View Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button 
                            className="text-[#64748B] hover:text-[#10B981] transition-colors"
                            title="Message"
                          >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-[#64748B]">
                        <span className="material-symbols-outlined text-[#CBD5E1] text-[32px] mb-3">search_off</span>
                        <p className="text-[14px] font-medium text-[#0F172A]">No employees found</p>
                        <p className="text-[12px] mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
            <p className="text-[13px] text-[#64748B]">
              Showing <span className="font-medium text-[#0F172A]">{filteredEmployees.length}</span> results
            </p>
            <div className="flex gap-1">
              <button className="p-1 border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="p-1 border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
