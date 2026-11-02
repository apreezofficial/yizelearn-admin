import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {adminStyles, Row, TabHeader} from '../components/Admin';
import {TabBarSpacer} from '../components/Catalog';
import {Icon, type IconName} from '../components/Icon';
import {Rise} from '../components/Motion';
import {signups, stats} from '../data/admin';
import {useAdmin} from '../data/store';
import Svg, {Circle, Defs, LinearGradient, Pattern, RadialGradient, Rect, Stop} from 'react-native-svg';
import {useReduceMotion} from '../theme/system';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};

type Props = {onBell: () => void; onCourses: () => void; onSupport: () => void; onIntegrations: () => void};

export function DashboardScreen({onBell, onCourses, onSupport, onIntegrations}: Props) {
  const {courses, integrations, tickets} = useAdmin();
  const inReview = courses.filter(c => c.status === 'In review').length;
  const openTickets = tickets.filter(t => t.open).length;
  const gatewayDown = integrations.some(i => !i.connected);
  return <View style={adminStyles.screen}>
    <TabHeader title="Dashboard" onBell={onBell} />
    <ScrollView contentContainerStyle={adminStyles.content} showsVerticalScrollIndicator={false}>
      <Rise><Hero /></Rise>
      <Rise delay={80} style={styles.tiles}>
        <Tile icon="laptop" label="Courses" value={stats.courses} note={`${stats.inReview} in review`} tone="green" onPress={onCourses} />
        <Tile icon="message" label="Open tickets" value={stats.tickets} note={`${stats.urgent} urgent`} tone="green" onPress={onSupport} />
      </Rise>
      <Rise delay={160}><SignupChart /></Rise>

      <Rise delay={240} style={styles.sectionRow}>
        <Text style={[adminStyles.section, font]}>Needs attention</Text>
        <Pressable onPress={onCourses} hitSlop={10} accessibilityRole="button"><Text style={[adminStyles.link, font]}>See all</Text></Pressable>
      </Rise>
      <Rise delay={300}>
        {inReview > 0 && <Row icon="laptop" title={`${inReview} ${inReview === 1 ? 'course' : 'courses'} in review`} detail="Oldest waiting 2 days" chevron onPress={onCourses} />}
        {gatewayDown && <Row icon="card" title="Payment gateway warning" detail="Check provider keys" chevron onPress={onIntegrations} />}
        {openTickets > 0 && <Row icon="message" title={`${openTickets} open support tickets`} detail="Reply within a day" chevron onPress={onSupport} />}
      </Rise>
      <TabBarSpacer />
    </ScrollView>
  </View>;
}

/** Count from 0 to `target` with an ease-out after `delay` ms; with Reduce Motion it shows the number at once. */
function useCountUp(target: number, still: boolean, duration = 1100, delay = 0) {
  const [value, setValue] = useState(still ? target : 0);
  useEffect(() => {
    if (still) { setValue(target); return; }
    let id: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      const start = Date.now();
      id = setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / duration);
        setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t === 1) clearInterval(id);
      }, 16);
    }, delay);
    return () => { clearTimeout(timer); clearInterval(id); };
  }, [target, still, duration, delay]);
  return value;
}

/** Navy banner, same as the web dashboard: gradient with a sky glow and dot grid, glossy bubbles on a slow orbit, growth and a user split. */
function Hero() {
  const still = useReduceMotion();
  const users = useCountUp(stats.users, still, 1200);
  const week = useCountUp(stats.usersThisWeek, still, 900, 400);
  const split = [
    {label: 'Students', value: useCountUp(stats.students, still, 1200, 200)},
    {label: 'Instructors', value: useCountUp(stats.instructors, still, 1000, 300)},
    {label: 'Admins', value: useCountUp(stats.admins, still, 800, 400)},
  ];
  const growth = Math.round(((stats.usersThisWeek - stats.usersLastWeek) / stats.usersLastWeek) * 100);
  const drift = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(still ? 1 : 0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (still) { pop.setValue(1); return; }
    Animated.spring(pop, {toValue: 1, friction: 5, tension: 60, useNativeDriver: true}).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(drift, {toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
      Animated.timing(drift, {toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
    ]));
    const orbit = Animated.loop(Animated.timing(spin, {toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true}));
    loop.start(); orbit.start();
    return () => { loop.stop(); orbit.stop(); };
  }, [still, drift, pop, spin]);
  const float = (px: number) => ({transform: [{translateY: drift.interpolate({inputRange: [0, 1], outputRange: [0, px]})}, {scale: pop}]});
  return <View style={styles.hero} accessible accessibilityLabel={`Total users ${stats.users.toLocaleString()}, ${stats.usersThisWeek} new this week, up ${growth}% on last week`}>
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#1F4A82" /><Stop offset="0.55" stopColor="#17335A" /><Stop offset="1" stopColor="#112744" /></LinearGradient>
        <RadialGradient id="glow" cx="0.92" cy="0.05" r="0.55"><Stop offset="0" stopColor="#74A7E3" stopOpacity="0.45" /><Stop offset="1" stopColor="#74A7E3" stopOpacity="0" /></RadialGradient>
        <Pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><Circle cx="2" cy="2" r="1" fill="#FFFFFF" fillOpacity="0.13" /></Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bg)" />
      <Rect x="50%" width="50%" height="100%" fill="url(#dots)" />
      <Rect width="100%" height="100%" fill="url(#glow)" />
    </Svg>
    <Animated.View style={[styles.ring, {transform: [{rotate: spin.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']})}, {scale: pop}]}]} />
    <Animated.View style={[styles.bigBubble, float(6)]}><Svg width="100%" height="100%"><Defs><RadialGradient id="b1" cx="0.3" cy="0.3" r="0.7"><Stop offset="0" stopColor="#3D7BC6" /><Stop offset="1" stopColor="#24508F" /></RadialGradient></Defs><Circle cx="50%" cy="50%" r="50%" fill="url(#b1)" /></Svg></Animated.View>
    <Animated.View style={[styles.blueBubble, float(-5)]}><Svg width="100%" height="100%"><Defs><RadialGradient id="b2" cx="0.3" cy="0.3" r="0.7"><Stop offset="0" stopColor="#8DB6EA" /><Stop offset="1" stopColor="#4F8BCD" /></RadialGradient></Defs><Circle cx="50%" cy="50%" r="50%" fill="url(#b2)" /></Svg></Animated.View>
    <Animated.View style={[styles.goldDot, float(4)]} />

    <View style={styles.heroLabelRow}>
      <View style={styles.heroIcon}><Icon name="users" size={14} color="#FEF9F2" /></View>
      <Text style={[styles.heroLabel, font]}>Total users</Text>
    </View>
    <Text style={[styles.heroValue, font]}>{users.toLocaleString()}</Text>
    <View style={styles.heroMeta}>
      <Animated.View style={[styles.heroPill, {transform: [{scale: pop}]}]}><Text style={[styles.heroPillText, font]}>+{week} this week</Text></Animated.View>
      <Text style={[styles.vs, font]}>{growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% vs last week</Text>
    </View>
    <View style={styles.split}>
      {split.map((x, i) => <View key={x.label} style={[styles.splitItem, i > 0 && styles.splitDivider]}>
        <Text style={[styles.splitValue, font]}>{x.value.toLocaleString()}</Text>
        <Text style={[styles.splitLabel, font]}>{x.label}</Text>
      </View>)}
    </View>
  </View>;
}

function Tile({icon, label, value, note, onPress}: {icon: IconName; label: string; value: number; note: string; tone: 'green'; onPress: () => void}) {
  return <Pressable onPress={onPress} style={({pressed}) => [styles.tile, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`${label}, ${value}, ${note}`}>
    <View style={styles.tileTop}><View style={styles.tileIcon}><Icon name={icon} size={16} color={colors.blue700} /></View><Text style={[styles.tileLabel, font]}>{label}</Text></View>
    <View style={styles.tileBottom}><Text style={[styles.tileValue, font]}>{value}</Text><Text style={[styles.tileNote, font]}>{note}</Text></View>
  </Pressable>;
}

function SignupChart() {
  const max = Math.max(...signups.map(s => s.v));
  const peak = signups.findIndex(s => s.v === max);
  const grow = useRef(signups.map(() => new Animated.Value(0))).current;
  const still = useReduceMotion();
  useEffect(() => {
    if (still) { grow.forEach(g => g.setValue(1)); return; }
    Animated.stagger(60, grow.map(g => Animated.spring(g, {toValue: 1, friction: 7, tension: 60, useNativeDriver: true}))).start();
  }, [grow, still]);
  return <View style={styles.chart} accessible accessibilityLabel={`Sign-ups over 7 days, highest ${max} on day ${peak + 1}`}>
    <View style={styles.chartHead}><Text style={[styles.chartTitle, font]}>Sign-ups</Text><Text style={[styles.chartMeta, font]}>7 days</Text></View>
    <View style={styles.bars}>
      {signups.map((s, i) => <View key={i} style={styles.barCol}>
        {i === peak && <View style={styles.peak}><Text style={[styles.peakText, font]}>{s.v}</Text></View>}
        <Animated.View style={[styles.bar, {height: 20 + (s.v / max) * 34}, i === peak && styles.barPeak, {transform: [{scaleY: grow[i]}]}]} />
        <Text style={[styles.barDay, font]}>{s.d}</Text>
      </View>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  // The banner keeps its navy in dark mode too, so it uses fixed colours rather than theme tokens.
  hero: {borderRadius: 20, padding: 18, paddingBottom: 16, overflow: 'hidden', minHeight: 172, shadowColor: '#17335A', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: {width: 0, height: 10}, elevation: 6},
  ring: {position: 'absolute', right: 2, top: 0, width: 106, height: 106, borderRadius: 53, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.18)'},
  bigBubble: {position: 'absolute', right: 15, top: 13, width: 76, height: 76, borderRadius: 38, overflow: 'hidden'},
  blueBubble: {position: 'absolute', right: 10, top: 92, width: 24, height: 24, borderRadius: 12, overflow: 'hidden'},
  goldDot: {position: 'absolute', right: 100, top: 22, width: 10, height: 10, borderRadius: 5, backgroundColor: '#F0B74A', shadowColor: '#F0B74A', shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: {width: 0, height: 0}},
  heroLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  heroIcon: {width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.12)', alignItems: 'center', justifyContent: 'center'},
  heroLabel: {fontSize: type.caption, color: 'rgba(254, 249, 242, 0.85)', fontWeight: '600'},
  heroValue: {fontSize: 38, color: '#FEF9F2', fontWeight: '800', letterSpacing: -0.6, marginTop: 8, fontVariant: ['tabular-nums']},
  heroMeta: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4},
  heroPill: {backgroundColor: '#F0B74A', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4},
  heroPillText: {fontSize: 11, color: '#17335A', fontWeight: '800', fontVariant: ['tabular-nums']},
  vs: {fontSize: 11, color: '#9FD8BE', fontWeight: '700'},
  split: {flexDirection: 'row', marginTop: 16, maxWidth: 300},
  splitItem: {flex: 1, paddingRight: 10},
  splitDivider: {paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: 'rgba(255, 255, 255, 0.14)'},
  splitValue: {fontSize: 15, color: '#FEF9F2', fontWeight: '800', fontVariant: ['tabular-nums']},
  splitLabel: {fontSize: 10, color: 'rgba(254, 249, 242, 0.7)', marginTop: 1},
  tiles: {flexDirection: 'row', gap: 10, marginTop: 10},
  tile: {flex: 1, borderRadius: radius.card, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, padding: 12, gap: 10},
  pressed: {opacity: 0.75},
  tileTop: {flexDirection: 'row', alignItems: 'center', gap: 8},
  tileIcon: {width: 28, height: 28, borderRadius: 14, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  tileLabel: {fontSize: 12, color: colors.muted},
  tileBottom: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'},
  tileValue: {fontSize: type.heading, color: colors.ink, fontWeight: '800'},
  tileNote: {fontSize: 11, color: colors.success, fontWeight: '700', marginBottom: 3},
  chart: {borderRadius: radius.card, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, padding: 12, marginTop: 10},
  chartHead: {flexDirection: 'row', justifyContent: 'space-between'},
  chartTitle: {fontSize: type.caption, color: colors.ink, fontWeight: '700'},
  chartMeta: {fontSize: 11, color: colors.muted},
  bars: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 96, marginTop: 6, paddingHorizontal: 4},
  barCol: {alignItems: 'center', width: 30},
  bar: {width: 26, borderRadius: 4, backgroundColor: colors.blue100, transformOrigin: 'bottom'},
  barPeak: {backgroundColor: colors.marigold},
  barDay: {fontSize: 10, color: colors.muted, marginTop: 6},
  peak: {backgroundColor: colors.blue900, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4},
  peakText: {fontSize: 10, color: '#FEF9F2', fontWeight: '800'},
  sectionRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.section - 6, marginBottom: 4},
});
