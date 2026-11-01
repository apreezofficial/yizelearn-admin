import React, {createContext, useContext, useMemo, useState} from 'react';
import {courses as seedCourses, integrations as seedIntegrations, payments as seedPayments, privacyRequests as seedPrivacy, promos as seedPromos, tickets as seedTickets, users as seedUsers, type AdminCourse, type Integration, type Payment, type PrivacyRequest, type Promo, type Role, type Ticket, type User} from './admin';

// Admin changes live here for the session so every screen sees them. Swap the setters for API calls once the admin API is ready.
function useAdminState() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [courses, setCourses] = useState<AdminCourse[]>(seedCourses);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [promos, setPromos] = useState<Promo[]>(seedPromos);
  const [integrations, setIntegrations] = useState<Integration[]>(seedIntegrations);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [privacy, setPrivacy] = useState<PrivacyRequest[]>(seedPrivacy);

  return useMemo(() => ({
    users, courses, payments, promos, integrations, tickets, privacy,
    setRole: (ids: string[], role: Role) => setUsers(list => list.map(u => (ids.includes(u.id) ? {...u, role} : u))),
    setSuspended: (ids: string[], suspended: boolean) => setUsers(list => list.map(u => (ids.includes(u.id) ? {...u, suspended} : u))),
    invite: (email: string, role: Role) => setUsers(list => [...list, {id: email, name: email.split('@')[0], email, role, courses: 0, joined: 'Invited', lastSeen: 'invite sent'}]),
    updateCourse: (id: string, change: Partial<AdminCourse>) => setCourses(list => list.map(c => (c.id === id ? {...c, ...change} : c))),
    deleteCourse: (id: string) => setCourses(list => list.filter(c => c.id !== id)),
    refund: (id: string) => setPayments(list => list.map(p => (p.id === id ? {...p, status: 'Refunded', detail: 'Refunded'} : p))),
    addPromo: (code: string) => setPromos(list => [{code, detail: 'New, 0 uses', active: true}, ...list]),
    connect: (id: string) => setIntegrations(list => list.map(i => (i.id === id ? {...i, connected: true} : i))),
    reply: (id: string, text: string) => setTickets(list => list.map(t => (t.id === id ? {...t, messages: [...t.messages, {me: true, text}]} : t))),
    solve: (id: string) => setTickets(list => list.map(t => (t.id === id ? {...t, open: false} : t))),
    completePrivacy: (id: string) => setPrivacy(list => list.map(r => (r.id === id ? {...r, open: false, due: 'completed'} : r))),
  }), [users, courses, payments, promos, integrations, tickets, privacy]);
}

type Admin = ReturnType<typeof useAdminState>;
const AdminContext = createContext<Admin | null>(null);
export function AdminProvider({children}: {children: React.ReactNode}) { return <AdminContext.Provider value={useAdminState()}>{children}</AdminContext.Provider>; }
export function useAdmin() {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error('useAdmin needs AdminProvider');
  return admin;
}
