import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {adminStyles, Row, TabHeader} from '../components/Admin';
import {TabBarSpacer} from '../components/Catalog';
import {Icon, type IconName} from '../components/Icon';
import {Rise} from '../components/Motion';
import {signups, stats} from '../data/admin';
import {useAdmin} from '../data/store';
import {useReduceMotion} from '../theme/system';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};

type Props = {onBell: () => void; onCourses: () => void; onSupport: () => void; onIntegrations: () => void};

export function DashboardScreen({onBell, onCourses, onSupport, onIntegrations}: Props) {
  const {courses, integrations} = useAdmin();
  const inReview = courses.filter(c => c.status === 'In review').length;
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

/** Compact summary from the mobile admin reference. */
function Hero() {
  const still = useReduceMotion();
  const users = useCountUp(stats.users, still);
  return <View style={styles.hero} accessible accessibilityLabel={`Total users ${stats.users}, ${stats.usersThisWeek} new this week`}>
    <View style={styles.bigBubble} /><View style={styles.blueBubble} /><View style={styles.goldDot} />
    <Text style={styles.heroLabel}>Total users</Text>
    <Text style={styles.heroValue}>{users.toLocaleString()}</Text>
    <View style={styles.heroPill}><Text style={styles.heroPillText}>+{stats.usersThisWeek} this week</Text></View>
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
  hero: {borderRadius: 20, padding: 16, overflow: 'hidden', minHeight: 132, backgroundColor: '#19365D'},
  bigBubble: {position: 'absolute', right: 15, top: 13, width: 76, height: 76, borderRadius: 38, backgroundColor: '#28558B'},
  blueBubble: {position: 'absolute', right: 12, top: 74, width: 34, height: 34, borderRadius: 17, backgroundColor: '#2F6DB5'},
  goldDot: {position: 'absolute', right: 70, top: 100, width: 10, height: 10, borderRadius: 5, backgroundColor: '#F0B74A', shadowColor: '#F0B74A', shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: {width: 0, height: 0}},
  heroLabel: {fontSize: type.caption, color: 'rgba(254, 249, 242, 0.85)', fontWeight: '600'},
  heroValue: {fontSize: 38, color: '#FEF9F2', fontWeight: '800', letterSpacing: -0.6, marginTop: 8, fontVariant: ['tabular-nums']},
  heroPill: {alignSelf: 'flex-start', marginTop: 6, backgroundColor: '#F0B74A', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4},
  heroPillText: {fontSize: 11, color: '#17335A', fontWeight: '800', fontVariant: ['tabular-nums']},
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
