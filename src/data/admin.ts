// Sample admin data shaped like the designs. Screens read from here until the admin API is connected.
import type {Tone} from '../components/Admin';

export type Role = 'Student' | 'Instructor' | 'Manager' | 'Admin';
export const roles: Role[] = ['Student', 'Instructor', 'Manager', 'Admin'];
export const roleTone: Record<Role, Tone> = {Student: 'blue', Instructor: 'blue', Manager: 'blue', Admin: 'gold'};

export type User = {id: string; name: string; email: string; role: Role; courses: number; joined: string; lastSeen: string; suspended?: boolean};
export const users: User[] = [
  {id: 'tb', name: 'Tunde Bello', email: 'tunde@example.com', role: 'Instructor', courses: 6, joined: '3 Mar 2026', lastSeen: 'active today'},
  {id: 'mi', name: 'Mercy Ibe', email: 'mercy@example.com', role: 'Student', courses: 2, joined: '12 Apr 2026', lastSeen: 'active yesterday'},
  {id: 'ce', name: 'Chidi Eze', email: 'chidi@example.com', role: 'Manager', courses: 0, joined: '20 Jan 2026', lastSeen: 'active today'},
  {id: 'ao', name: 'Ada Obi', email: 'ada@example.com', role: 'Student', courses: 3, joined: '8 Jun 2026', lastSeen: 'active 3 days ago'},
];
export const initials = (name: string) => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

export const stats = {users: 12480, usersThisWeek: 240, usersLastWeek: 214, students: 12190, instructors: 278, admins: 12, courses: 312, inReview: 18, tickets: 14, urgent: 3};
export const signups = [{d: 'M', v: 62}, {d: 'T', v: 88}, {d: 'W', v: 70}, {d: 'T', v: 110}, {d: 'F', v: 96}, {d: 'S', v: 128}, {d: 'S', v: 80}];

export type CourseStatus = 'Published' | 'In review' | 'Draft' | 'Unpublished';
export const statusTone: Record<CourseStatus, Tone> = {Published: 'green', 'In review': 'gold', Draft: 'grey', Unpublished: 'grey'};
export type AdminCourse = {id: string; title: string; instructor: string; status: CourseStatus; featured?: boolean};
export const courses: AdminCourse[] = [
  {id: 'excel', title: 'Data analysis in Excel', instructor: 'Tunde Bello', status: 'Published'},
  {id: 'fin', title: 'Financial modelling', instructor: 'Tunde Bello', status: 'In review'},
  {id: 'write', title: 'Business writing', instructor: 'Mercy Ibe', status: 'Published'},
  {id: 'py', title: 'Intro to Python', instructor: 'Ada Obi', status: 'Draft'},
];

export const categories = [{name: 'AI', count: 84}, {name: 'Programming', count: 120}, {name: 'Design', count: 46}, {name: 'Mobile Dev', count: 32}];
export const tags = [{name: 'Excel', count: 22}, {name: 'Beginner', count: 140}, {name: 'Certificate', count: 96}, {name: 'Python', count: 18}];

export const enrolCheck = {ready: 48, problems: ['Row 12: invalid email', 'Row 20: unknown course', 'Row 33: duplicate']};

export type Payment = {id: string; name: string; detail: string; amount: number; date: string; status: 'Paid' | 'Pending' | 'Refunded'};
export const payments: Payment[] = [
  {id: 'p1', name: 'Mercy Ibe', detail: 'Excel course, card', amount: 15000, date: '18 Oct', status: 'Paid'},
  {id: 'p2', name: 'Chidi Eze', detail: 'Python, bank transfer', amount: 15000, date: '17 Oct', status: 'Paid'},
  {id: 'p3', name: 'Ada Obi', detail: '2 courses, card', amount: 15000, date: '16 Oct', status: 'Paid'},
  {id: 'p4', name: 'Tunde Bello', detail: 'Refund requested', amount: 15000, date: '15 Oct', status: 'Pending'},
];

export type Promo = {code: string; detail: string; active: boolean};
export const promos: Promo[] = [
  {code: 'LAUNCH20', detail: '20% off, 84 uses', active: true},
  {code: 'SCHOOL10', detail: '10% off, 12 uses', active: true},
  {code: 'BLACKFRI', detail: '40% off, ended', active: false},
];

export const instructorPermissions = [
  {key: 'create', label: 'Create courses', on: true},
  {key: 'grade', label: 'Grade submissions', on: true},
  {key: 'users', label: 'View all users', on: false},
  {key: 'payments', label: 'Manage payments', on: false},
  {key: 'announce', label: 'Send announcements', on: true},
  {key: 'export', label: 'Export reports', on: false},
];
export const instructorCount = 38;

export type LogEntry = {id: string; title: string; who: string; kind: 'Users' | 'Payments' | 'Courses'};
export const auditLog: LogEntry[] = [
  {id: 'l1', title: 'Role changed', who: 'Admin Sam, 10:42 today', kind: 'Users'},
  {id: 'l2', title: 'Course unpublished', who: 'Admin Sam, 09:15 today', kind: 'Courses'},
  {id: 'l3', title: 'User suspended', who: 'Admin Ife, yesterday', kind: 'Users'},
  {id: 'l4', title: 'Refund processed', who: 'Admin Ife, yesterday', kind: 'Payments'},
];

export type Integration = {id: string; name: string; connected: boolean};
export const integrations: Integration[] = [
  {id: 'sso', name: 'Single sign-on', connected: true},
  {id: 'scorm', name: 'SCORM and xAPI', connected: false},
  {id: 'zoom', name: 'Zoom', connected: true},
  {id: 'sms', name: 'Email and SMS', connected: true},
  {id: 'plag', name: 'Plagiarism checker', connected: false},
];

export type Ticket = {id: string; title: string; who: string; open: boolean; messages: {me: boolean; text: string}[]};
export const tickets: Ticket[] = [
  {id: 't1', title: 'Cannot access course', who: 'Mercy Ibe, 2h ago', open: true, messages: [{me: false, text: 'Hi, my course will not open since yesterday. Can you help?'}]},
  {id: 't2', title: 'Refund question', who: 'Chidi Eze, 1d ago', open: true, messages: [{me: false, text: 'I paid twice for Python. Can I get one back?'}]},
  {id: 't3', title: 'Certificate error', who: 'Ada Obi, 2d ago', open: false, messages: [{me: false, text: 'My certificate shows the wrong name.'}, {me: true, text: 'Fixed it, Ada. Please download it again.'}]},
];

export type PrivacyRequest = {id: string; kind: 'Data export' | 'Delete account'; who: string; due: string; open: boolean};
export const privacyRequests: PrivacyRequest[] = [
  {id: 'r1', kind: 'Data export', who: 'Mercy Ibe', due: 'due in 5 days', open: true},
  {id: 'r2', kind: 'Delete account', who: 'Ada Obi', due: 'due in 12 days', open: true},
  {id: 'r3', kind: 'Data export', who: 'Tunde Bello', due: 'completed', open: false},
];
