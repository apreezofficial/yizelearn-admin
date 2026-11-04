import React, {useEffect, useRef, useState} from 'react';
import {Alert, BackHandler, StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {initialWindowMetrics, SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {TabBar, type TabItem} from './src/components/Catalog';
import {ScreenTransition} from './src/components/ScreenTransition';
import {adminAuth} from './src/api/auth';
import {LoginScreen, VerifyScreen} from './src/screens/AuthScreens';
import {AdminProvider} from './src/data/store';
import {DashboardScreen} from './src/screens/DashboardScreen';
import {BulkSelectScreen, InviteScreen, UserDetailScreen, UsersScreen} from './src/screens/UsersScreens';
import {BulkEnrolScreen, CategoriesScreen, CoursesScreen} from './src/screens/CoursesScreens';
import {PaymentsScreen, PromoCodesScreen} from './src/screens/PaymentsScreens';
import {AnnouncementScreen, AuditLogScreen, ConfigureIntegrationScreen, InstructorRoleScreen, IntegrationsScreen, MoreScreen, PrivacyScreen, SupportScreen, TicketScreen, type MorePage} from './src/screens/MoreScreens';
import {LearningProvider, LearningScreen} from './src/screens/LearningScreens';
import {ProfileScreen} from './src/screens/ProfileScreens';
import {useGlass} from './src/theme/system';
import {colors} from './src/theme/tokens';

type Tab = 'Dashboard' | 'Users' | 'Courses' | 'Payments' | 'More';
type Page = Tab | MorePage | 'User' | 'BulkSelect' | 'Invite' | 'Configure' | 'Ticket' | 'Login' | 'Verify';
const tabs: TabItem<Tab>[] = [
  {key: 'Dashboard', label: 'Dashboard', icon: 'dashboard'},
  {key: 'Users', label: 'Users', icon: 'users'},
  {key: 'Courses', label: 'Courses', icon: 'laptop'},
  {key: 'Payments', label: 'Payments', icon: 'card'},
  {key: 'More', label: 'More', icon: 'more'},
];
const isTab = (p: Page): p is Tab => tabs.some(t => t.key === p);

export default function App() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><AdminProvider><LearningProvider><AdminApp /></LearningProvider></AdminProvider></SafeAreaProvider>;
}

function AdminApp() {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const glass = useGlass();
  const [page, setPage] = useState<Page>('Login');
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [param, setParam] = useState('');
  // Pages opened since the last tab, so the on-screen back and Android's back button retrace them.
  const history = useRef<Page[]>([]);

  const nav = (p: Page, value?: string) => {
    setParam(value ?? '');
    if (isTab(p)) { history.current = []; setTab(p); } else history.current.push(page);
    setPage(p);
  };
  const back = () => setPage(history.current.pop() ?? tab);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 'Dashboard' || page === 'Login') return false;
      if (isTab(page)) nav('Dashboard'); else back();
      return true;
    });
    return () => sub.remove();
  });

  const bell = () => nav('Audit');
  const logout = () => Alert.alert('Log out?', 'You will need to sign in again to manage yizelearn.', [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Log out', style: 'destructive', onPress: () => { adminAuth.signOut(); history.current = []; setTab('Dashboard'); setPage('Login'); }},
  ]);

  const screen = (() => {
    switch (page) {
      case 'Dashboard': return <DashboardScreen onBell={bell} onCourses={() => nav('Courses')} onSupport={() => nav('Support')} onIntegrations={() => nav('Integrations')} />;
      case 'Users': return <UsersScreen onBell={bell} onOpen={id => nav('User', id)} onSelect={id => nav('BulkSelect', id)} onInvite={() => nav('Invite')} />;
      case 'User': return <UserDetailScreen id={param} onBack={back} />;
      case 'BulkSelect': return <BulkSelectScreen initial={param} onBack={back} />;
      case 'Invite': return <InviteScreen onBack={back} />;
      case 'Courses': return <CoursesScreen onBell={bell} />;
      case 'Categories': return <CategoriesScreen onBack={back} />;
      case 'BulkEnrol': return <BulkEnrolScreen onBack={back} />;
      case 'Payments': return <PaymentsScreen onBell={bell} onPromos={() => nav('Promos')} />;
      case 'Promos': return <PromoCodesScreen onBack={back} />;
      case 'Cohorts': case 'AtRisk': case 'Reports': case 'Certificates': return <LearningScreen page={page} onBack={back} onMessage={cohort => nav('Announcement', cohort)} />;
      case 'Profile': return <ProfileScreen onBack={back} onLogout={logout} />;
      case 'More': return <MoreScreen onBell={bell} onOpen={p => nav(p)} onLogout={logout} />;
      case 'Role': return <InstructorRoleScreen onBack={back} />;
      case 'Audit': return <AuditLogScreen onBack={back} />;
      case 'Integrations': return <IntegrationsScreen onBack={back} onConfigure={id => nav('Configure', id)} />;
      case 'Configure': return <ConfigureIntegrationScreen id={param} onBack={back} />;
      case 'Support': return <SupportScreen onBack={back} onOpen={id => nav('Ticket', id)} />;
      case 'Ticket': return <TicketScreen id={param} onBack={back} />;
      case 'Announcement': return <AnnouncementScreen onBack={back} cohort={param || undefined} />;
      case 'Privacy': return <PrivacyScreen onBack={back} />;
      case 'Login': return <LoginScreen onSent={email => { setParam(email); history.current = []; setPage('Verify'); }} />;
      case 'Verify': return <VerifyScreen email={param} onBack={() => setPage('Login')} onVerified={() => nav('Dashboard')} />;
    }
  })();

  const showTabs = isTab(page);
  return <View style={[styles.app, {paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right}]}>
    <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
    <View style={styles.page}><ScreenTransition key={`${page}-${param}`}>{screen}</ScreenTransition></View>
    {showTabs && <TabBar items={tabs} active={page as Tab} onSelect={p => nav(p)} />}
    {/* The glass bar floats over the page, so the inset strip is only needed under the solid bar or a page's own buttons. */}
    <View style={{height: showTabs && glass ? 0 : insets.bottom, backgroundColor: showTabs ? colors.sand : colors.cream}} />
  </View>;
}

const styles = StyleSheet.create({
  app: {flex: 1, backgroundColor: colors.cream},
  page: {flex: 1},
});
