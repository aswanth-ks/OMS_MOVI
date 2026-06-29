import User     from '../models/User.js';
import Role     from '../models/Role.js';
import Settings from '../models/Settings.js';

/**
 * Auto-assign the least-loaded HR to a new employee/intern.
 *
 * Priority:
 *   1. HR users in the same department, under cap  → least loaded
 *   2. Any HR user across departments, under cap   → least loaded
 *   3. All HRs at cap                              → least loaded anyway (soft cap)
 *
 * Returns { hrUser, capExceeded }
 *   hrUser      — the chosen HR User document (null if no HR users exist)
 *   capExceeded — true when the assigned HR is already at or over cap
 */
export async function autoAssignHR(employee) {
  // Get configurable cap
  const settings = await Settings.findOne({ key: 'global' }).select('hr');
  const cap = settings?.hr?.onboardingHRCap ?? 10;

  // Find HR role
  const hrRole = await Role.findOne({ slug: 'hr' }).select('_id');
  if (!hrRole) return { hrUser: null, capExceeded: false };

  // All active HR users
  const hrUsers = await User.find({
    role:      hrRole._id,
    status:    'Active',
    deletedAt: { $exists: false },
  }).select('_id name department');

  if (!hrUsers.length) return { hrUser: null, capExceeded: false };

  // Count each HR's current active onboarding load
  const withLoad = await Promise.all(
    hrUsers.map(async (hr) => ({
      hr,
      load: await User.countDocuments({
        hrManager:          hr._id,
        onboardingComplete: false,
        deletedAt:          { $exists: false },
      }),
    }))
  );

  // Sort by load ascending
  withLoad.sort((a, b) => a.load - b.load);

  // 1. Same dept, under cap
  const sameDeptUnder = withLoad.filter(
    x => x.hr.department?.toString() === employee.department?.toString() && x.load < cap
  );
  if (sameDeptUnder.length) return { hrUser: sameDeptUnder[0].hr, capExceeded: false };

  // 2. Any dept, under cap
  const anyUnder = withLoad.filter(x => x.load < cap);
  if (anyUnder.length) return { hrUser: anyUnder[0].hr, capExceeded: false };

  // 3. All at cap — assign least loaded (soft cap)
  return { hrUser: withLoad[0].hr, capExceeded: true };
}
