import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import FleetManagementPage from '@/pages/FleetManagementPage';
import ScheduleCalendarPage from '@/pages/ScheduleCalendarPage';
import ScheduleDetailPage from '@/pages/ScheduleDetailPage';
import OccupancyMergePage from '@/pages/OccupancyMergePage';
import OccupancySplitPage from '@/pages/OccupancySplitPage';
import ApprovalListPage from '@/pages/ApprovalListPage';
import ApprovalTrackPage from '@/pages/ApprovalTrackPage';
import ApprovalConfigPage from '@/pages/ApprovalConfigPage';
import ReminderCenterPage from '@/pages/ReminderCenterPage';
import ReminderAuditPage from '@/pages/ReminderAuditPage';
import AirspaceReportPage from '@/pages/AirspaceReportPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/fleet" element={<FleetManagementPage />} />
          <Route path="/schedule" element={<ScheduleCalendarPage />} />
          <Route path="/schedule/:id" element={<ScheduleDetailPage />} />
          <Route path="/occupancy/merge" element={<OccupancyMergePage />} />
          <Route path="/occupancy/split" element={<OccupancySplitPage />} />
          <Route path="/approval/list" element={<ApprovalListPage />} />
          <Route path="/approval/config" element={<ApprovalConfigPage />} />
          <Route path="/approval/:id" element={<ApprovalTrackPage />} />
          <Route path="/reminder/center" element={<ReminderCenterPage />} />
          <Route path="/reminder/audit" element={<ReminderAuditPage />} />
          <Route path="/airspace/report" element={<AirspaceReportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
