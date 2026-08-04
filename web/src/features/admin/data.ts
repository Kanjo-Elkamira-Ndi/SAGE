/* ============================================================
 * SAGE Admin Console — mock data
 * Mirrors the content of the Stitch admin reference screens.
 * To be replaced with real API calls (see docs/frontend-roadmap.md Phase 8).
 * ============================================================ */

/* ---------- Dashboard ---------- */
export const dashboardStats = {
  totalStudents: "14,200",
  totalStudentsTrend: "+2.4%",
  totalLecturers: "850",
  totalLecturersTrend: "Stable",
  activeCourses: "1,240",
  activeCoursesTrend: "+12",
  atRiskCount: "124",
};

export const retentionData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  undergraduate: [72, 74, 69, 78, 76, 81, 79, 84],
  graduate: [60, 62, 58, 66, 64, 69, 67, 73],
};

export interface ActivityItem {
  icon: "person_add" | "library_add" | "report" | "campaign" | "shield";
  text: string;
  time: string;
}

export const recentActivity: ActivityItem[] = [
  { icon: "person_add", text: "Created a new user account", time: "2m ago" },
  { icon: "library_add", text: "Published CS402 to Spring catalog", time: "45m ago" },
  { icon: "report", text: "New at-risk alert for Elias Miller", time: "2h ago" },
  { icon: "campaign", text: "Broadcasted exam schedule announcement", time: "5h ago" },
  { icon: "shield", text: "Elevated access for Sarah Chen", time: "1d ago" },
];

export interface DepartmentHealth {
  name: string;
  score: number;
}

export const departmentHealth: DepartmentHealth[] = [
  { name: "Faculty of Arts", score: 94 },
  { name: "Engineering", score: 82 },
  { name: "Digital Humanities", score: 45 },
  { name: "Institution Maintenance", score: 66 },
];

/* ---------- Users ---------- */
export type UserRole = "Admin" | "Lecturer" | "Student";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Pending" | "Inactive";
  lastLogin: string;
}

export const users: AppUser[] = [
  { id: "u1", name: "Julianne De Luca", email: "j.deluca@sage.edu", role: "Admin", department: "Institutional Registry", status: "Active", lastLogin: "10 mins ago" },
  { id: "u2", name: "Prof. Marcus Thorne", email: "m.thorne@sage.edu", role: "Lecturer", department: "Computer Science", status: "Active", lastLogin: "2h ago" },
  { id: "u3", name: "Sarah O'Connell", email: "s.oconnell@student.sage.edu", role: "Student", department: "Applied Mathematics", status: "Active", lastLogin: "3d ago" },
  { id: "u4", name: "Dr. Elena Vance", email: "e.vance@sage.edu", role: "Admin", department: "Institutional Registry", status: "Active", lastLogin: "just now" },
  { id: "u5", name: "Prof. Julian Smith", email: "j.smith@sage.edu", role: "Lecturer", department: "Economics & Finance", status: "Active", lastLogin: "1d ago" },
  { id: "u6", name: "Amara Lopez", email: "a.lopez@student.sage.edu", role: "Student", department: "Humanities", status: "Pending", lastLogin: "Never" },
  { id: "u7", name: "Dr. Robert Hayes", email: "r.hayes@sage.edu", role: "Lecturer", department: "Mechanical Engineering", status: "Active", lastLogin: "30m ago" },
  { id: "u8", name: "Linda Meyers", email: "l.meyers@sage.edu", role: "Admin", department: "BioSciences", status: "Inactive", lastLogin: "2 weeks ago" },
  { id: "u9", name: "James Holt", email: "j.holt@student.sage.edu", role: "Student", department: "Business School", status: "Active", lastLogin: "4h ago" },
  { id: "u10", name: "Prof. Maria Wong", email: "m.wong@sage.edu", role: "Lecturer", department: "Philosophy & Ethics", status: "Active", lastLogin: "6h ago" },
];

export const userKpis = {
  totalUsers: "1,284",
  totalUsersDelta: "+12%",
  activeNow: "452",
  activeNowTag: "High Load",
  pendingApprovals: "18",
  pendingApprovalsTag: "Action Required",
  securityAlerts: "Healthy",
};

export const departments = [
  "Computer Science",
  "Mathematics",
  "Fine Arts",
  "Engineering",
  "Applied Mathematics",
  "Economics & Finance",
  "Humanities",
  "BioSciences",
];

/* ---------- Departments ---------- */
export interface Department {
  id: string;
  name: string;
  faculty: string;
  code: string;
  courses: number;
  lecturers: number;
  status: "Active" | "Review" | "Restricted";
}

export const departmentsList: Department[] = [
  { id: "d1", name: "Computer Science", faculty: "Faculty of Engineering", code: "CS-ENG", courses: 42, lecturers: 28, status: "Active" },
  { id: "d2", name: "Mathematics", faculty: "Faculty of Science", code: "MATH-SCI", courses: 31, lecturers: 15, status: "Active" },
  { id: "d3", name: "Physics", faculty: "Faculty of Science", code: "PHYS-SCI", courses: 24, lecturers: 12, status: "Active" },
  { id: "d4", name: "History & Archaeology", faculty: "Faculty of Humanities", code: "HIST-HUM", courses: 18, lecturers: 9, status: "Active" },
  { id: "d5", name: "BioSciences", faculty: "Faculty of Science", code: "BIO-SCI", courses: 27, lecturers: 14, status: "Review" },
  { id: "d6", name: "Economics & Finance", faculty: "Faculty of Social Sciences", code: "ECON-SOC", courses: 22, lecturers: 11, status: "Active" },
  { id: "d7", name: "Mechanical Engineering", faculty: "Faculty of Engineering", code: "MECH-ENG", courses: 19, lecturers: 10, status: "Active" },
  { id: "d8", name: "Digital Humanities", faculty: "Faculty of Humanities", code: "DIGHUM-HUM", courses: 12, lecturers: 6, status: "Restricted" },
];

export const facultyOptions = [
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Humanities",
  "School of Medicine",
];

export const departmentCapacity = {
  total: "482",
  perDept: "60.3",
  note: "Institutional resource utilization is currently at optimal levels across all faculties.",
};

/* ---------- Courses ---------- */
export interface Course {
  id: string;
  code: string;
  title: string;
  tag: string;
  lecturerInitials: string;
  lecturer: string;
  department: string;
  enrolled: number;
  capacity: number;
  status: "Active" | "Registration" | "Archived" | "Review";
}

export const courses: Course[] = [
  { id: "c1", code: "CS402", title: "Neural Networks & Deep Learning", tag: "Core Technical Elective", lecturerInitials: "DA", lecturer: "Dr. Alicia Vance", department: "Computer Science", enrolled: 142, capacity: 150, status: "Active" },
  { id: "c2", code: "ECON201", title: "Macroeconomic Theory II", tag: "Mandatory Foundation", lecturerInitials: "JS", lecturer: "Prof. Julian Smith", department: "Economics & Finance", enrolled: 310, capacity: 400, status: "Registration" },
  { id: "c3", code: "ME101", title: "Intro to Thermodynamics", tag: "Introductory Course", lecturerInitials: "RH", lecturer: "Dr. Robert Hayes", department: "Mechanical Engineering", enrolled: 188, capacity: 200, status: "Active" },
  { id: "c4", code: "PHIL120", title: "Logic and Critical Thinking", tag: "General Elective", lecturerInitials: "MW", lecturer: "Prof. Maria Wong", department: "Philosophy & Ethics", enrolled: 0, capacity: 60, status: "Archived" },
  { id: "c5", code: "MATH301", title: "Advanced Calculus II", tag: "Mandatory Foundation", lecturerInitials: "RT", lecturer: "Prof. Robert Thorne", department: "Mathematics", enrolled: 96, capacity: 120, status: "Active" },
  { id: "c6", code: "BIO210", title: "Molecular Biology Lab", tag: "Core Technical Elective", lecturerInitials: "SC", lecturer: "Sarah Chen", department: "BioSciences", enrolled: 64, capacity: 80, status: "Review" },
];

export const courseKpis = {
  totalCourses: "1,248",
  totalCoursesDelta: "+3.2%",
  activeEnrollment: "42,801",
  activeEnrollmentTag: "Spring 2024",
  avgClassSize: "34.3",
  completionRate: "94.8%",
};

export const courseDepartments = [
  "Computer Science",
  "Economics & Finance",
  "Mechanical Engineering",
  "Philosophy & Ethics",
  "Mathematics",
  "BioSciences",
];

export const reviewQueue = {
  count: 14,
  note: "There are 14 new courses awaiting final administrative approval for the Fall 2024 semester. Reviewing these ensures syllabus compliance with academic standards.",
};

/* ---------- Activity Logs ---------- */
export type LogCategory = "Academic" | "Evaluation" | "Security" | "System" | "Organization" | "Finance";

export interface ActivityLog {
  id: string;
  timestamp: string;
  initials: string;
  user: string;
  role: string;
  action: string;
  category: LogCategory;
}

export const activityLogs: ActivityLog[] = [
  { id: "l1", timestamp: "2023-10-19 14:22:04", initials: "SV", user: "Sarah Vane", role: "Registrar", action: "Course Updated: CS101 Foundations", category: "Academic" },
  { id: "l2", timestamp: "2023-10-19 13:58:12", initials: "MD", user: "Mark Davids", role: "Faculty Dean", action: "Grade Released: Advanced Calculus II", category: "Evaluation" },
  { id: "l3", timestamp: "2023-10-19 12:45:00", initials: "JV", user: "Julian Vance", role: "Admin", action: "Security Alert: Multiple Failed Logins", category: "Security" },
  { id: "l4", timestamp: "2023-10-19 11:15:33", initials: "Sys", user: "SAGE Core", role: "System", action: "Automated Backup Completed", category: "System" },
  { id: "l5", timestamp: "2023-10-19 10:30:22", initials: "LM", user: "Linda Meyers", role: "Dept. Head", action: "Department Profile Updated: BioSciences", category: "Organization" },
  { id: "l6", timestamp: "2023-10-19 09:02:11", initials: "AR", user: "Adam Reed", role: "Finance", action: "Budget Allocation Approved: Research Lab 4", category: "Finance" },
  { id: "l7", timestamp: "2023-10-19 08:15:40", initials: "EL", user: "Elena Lovic", role: "Dept. Head", action: "Access Denied: Attempted to modify faculty roster", category: "Security" },
  { id: "l8", timestamp: "2023-10-18 21:48:05", initials: "Sys", user: "SAGE Core", role: "System", action: "Scheduled maintenance window opened", category: "System" },
];

export const logActionTypes = [
  "All Actions",
  "Course Updated",
  "Grade Released",
  "User Created",
  "Access Denied",
];

export const logEntityTypes = ["Course", "User", "Department", "System"];

/* ---------- Reports ---------- */
export const reportsKpis = {
  totalEnrollment: "12,482",
  growthRate: "+4.2%",
  peakConcurrent: "4,209",
  avgSession: "42m",
};

export const gradeDistribution = [
  { label: "Distinction (A)", value: 24 },
  { label: "Merit (B)", value: 48 },
  { label: "Pass (C)", value: 18 },
  { label: "Other", value: 10 },
];

export const atRiskKpis = {
  high: "42",
  medium: "128",
  avgScore: "64%",
  activeActions: "18",
};

export const riskFactors = [
  { label: "Academic Performance", value: 45 },
  { label: "Attendance Patterns", value: 30 },
  { label: "LMS Engagement", value: 25 },
];

export interface AtRiskStudent {
  id: string;
  initials: string;
  name: string;
  studentId: string;
  course: string;
  department: string;
  level: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  factor: "Low Engagement" | "Missed Deadlines" | "Attendance" | "Performance" | "Communication";
}

export const atRiskStudents: AtRiskStudent[] = [
  { id: "r1", initials: "EM", name: "Elias Miller", studentId: "2024-00891", course: "Applied Thermodynamics III", department: "Engineering Dept.", level: "HIGH", score: 88, factor: "Low Engagement" },
  { id: "r2", initials: "SC", name: "Sarah Chen", studentId: "2024-11204", course: "Molecular Biology Lab", department: "Natural Sciences", level: "MEDIUM", score: 62, factor: "Missed Deadlines" },
  { id: "r3", initials: "JH", name: "James Holt", studentId: "2024-05432", course: "Microeconomics 101", department: "Business School", level: "LOW", score: 35, factor: "Missed Deadlines" },
  { id: "r4", initials: "AL", name: "Amara Lopez", studentId: "2024-09923", course: "Introduction to Ethics", department: "Humanities Dept.", level: "HIGH", score: 92, factor: "Performance" },
  { id: "r5", initials: "DB", name: "Daniel Brooks", studentId: "2024-07718", course: "Quantum Mechanics", department: "Physics Dept.", level: "MEDIUM", score: 68, factor: "Low Engagement" },
  { id: "r6", initials: "MN", name: "Maya Nguyen", studentId: "2024-13005", course: "Data Structures", department: "Engineering Dept.", level: "HIGH", score: 84, factor: "Attendance" },
];

export const recentReports = [
  { name: "Q3 Financial Aid Distribution", type: "Financial", by: "System (Auto)", date: "Oct 24, 2023" },
  { name: "Faculty Performance Audit", type: "Staffing", by: "Dr. J. Vance", date: "Oct 22, 2023" },
  { name: "Engineering Dept Enrollment", type: "Enrollment", by: "System (Auto)", date: "Oct 20, 2023" },
];

/* ---------- Permissions ---------- */
export interface Personnel {
  id: string;
  initials: string;
  name: string;
  email: string;
  access: string[];
  restricted?: boolean;
}

export const personnel: Personnel[] = [
  { id: "p1", initials: "SC", name: "Sarah Chen", email: "s.chen@sage.edu", access: ["L3_COURSES", "L1_REPORTS"] },
  { id: "p2", initials: "MK", name: "Marcus Knight", email: "m.knight@sage.edu", access: ["AUDIT_LOGS"] },
  { id: "p3", initials: "EL", name: "Elena Lovic", email: "e.lovic@sage.edu", access: ["DEPT_HEAD", "HR_ADMIN"] },
  { id: "p4", initials: "RT", name: "Robert Thorne", email: "r.thorne@sage.edu", access: ["RESTRICTED"], restricted: true },
];

export const securityKeys = [
  "SYS_ROOT",
  "DEPT_MGR",
  "ENROLL_OPS",
  "FIN_VIEW",
];

export const permissionKpis = {
  totalAdmins: "24",
  activeSessions: "08",
};

export const roleCards = [
  { icon: "admin_panel_settings", title: "System Roots", desc: "Full bypass authority for all institutional nodes. Restricted to Executive Board only." },
  { icon: "account_balance", title: "Departmental Leads", desc: "Curriculum and staff management within specific college branches." },
  { icon: "monitoring", title: "Audit Officers", desc: "Read-only high-level data access for institutional compliance reporting." },
];

/* ---------- Announcements ---------- */
export interface Announcement {
  id: string;
  time: string;
  course: string;
  title: string;
}

export const announcements: Announcement[] = [
  { id: "a1", time: "09:15 AM", course: "CS401", title: "Midterm Review Session Details" },
  { id: "a2", time: "02:45 PM", course: "UX101", title: "Assignment 3: Wireframe Submission Deadline" },
  { id: "a3", time: "11:00 AM", course: "TH499", title: "Guest Speaker: Industry Ethics in AI" },
  { id: "a4", time: "08:30 AM", course: "CS401", title: "Lab Week 4 Instructions Published" },
];

export const announcementCourses = [
  "Advanced Algorithms (CS401)",
  "Machine Learning Foundations (DS202)",
  "Human-Computer Interaction (UX101)",
  "Senior Thesis Seminar (TH499)",
];

export const announcementInsights = {
  activePosts: "24",
  scheduled: "03",
  avgReach: "68%",
};
