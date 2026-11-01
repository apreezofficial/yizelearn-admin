import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
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

/** Navy card with the user count ticking up and the bubbles drifting, as on the Dashboard design. */
function Hero() {
  const [shown, setShown] = useState(0);
  const still = useReduceMotion();
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (still) { setShown(stats.users); return; }
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 900);
      setShown(Math.round(stats.users * (1 - Math.pow(1 - t, 3))));
      if (t === 1) clearInterval(id);
    }, 16);
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(drift, {toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
      Animated.timing(drift, {toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
    ]));
    loop.start();
    return () => { clearInterval(id); loop.stop(); };
  }, [still, drift]);
  const move = (px: number) => ({transform: [{translateY: drift.interpolate({inputRange: [0, 1], outputRange: [0, px]})}]});
  return <View style={styles.hero} accessible accessibilityLabel={`Total users ${stats.users.toLocaleString()}, ${stats.usersThisWeek} new this week`}>
    <Animated.View style={[styles.bigBubble, move(6)]} />
    <Animated.View style={[styles.blueBubble, move(-5)]} />
    <Animated.View style={[styles.goldDot, move(4)]} />
    <Text style={[styles.heroLabel, font]}>Total users</Text>
    <Text style={[styles.heroValue, font]}>{shown.toLocaleString()}</Text>
    <View style={styles.heroPill}><Text style={[styles.heroPillText, font]}>+{stats.usersThisWeek} this week</Text></View>
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
  hero: {height: 116, borderRadius: radius.card, backgroundColor: colors.blue900, padding: 16, overflow: 'hidden'},
  bigBubble: {position: 'absolute', right: 8, top: 0, width: 72, height: 72, borderRadius: 36, backgroundColor: colors.navy},
  blueBubble: {position: 'absolute', right: 6, bottom: 18, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.blue600},
  goldDot: {position: 'absolute', right: 52, bottom: 16, width: 11, height: 11, borderRadius: 6, backgroundColor: colors.marigold},
  heroLabel: {fontSize: type.caption, color: '#FEF9F2', opacity: 0.85},
  heroValue: {fontSize: 32, color: '#FEF9F2', fontWeight: '800', marginTop: 4, fontVariant: ['tabular-nums']},
  heroPill: {alignSelf: 'flex-start', backgroundColor: colors.marigold, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6},
  heroPillText: {fontSize: 11, color: '#17335A', fontWeight: '800'},
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
