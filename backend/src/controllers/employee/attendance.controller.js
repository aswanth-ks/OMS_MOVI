import Attendance from '../../models/Attendance.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const m = month ? parseInt(month) - 1 : new Date().getMonth();
    const y = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0);

    const records = await Attendance.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    const stats = records.reduce((acc, curr) => {
      if (curr.status === 'Present') acc.present++;
      else if (curr.status === 'Absent') acc.absent++;
      else if (curr.status === 'Leave') acc.leave++;
      else if (curr.status === 'Half Day') acc.halfDay++;
      else if (curr.status === 'Holiday') acc.holiday++;
      return acc;
    }, { present: 0, absent: 0, leave: 0, halfDay: 0, holiday: 0 });

    sendSuccess(res, {
      period: { month: m + 1, year: y },
      stats,
      records,
    });
  } catch (error) {
    next(error);
  }
};
