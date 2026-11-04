import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle} from 'react-native';
import {Sheet} from './Sheet';
import {PrimaryAction} from './Layout';
import {Icon, type IconName} from './Icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {haptic, useGlass, useReduceMotion} from '../theme/system';
import {GLASS_BAR_SPACE} from './Catalog';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};

/** Tab-page header from the admin designs: big title with a gold underline, a bell with an unread dot and the admin's initials. */
export function TabHeader({title, onBell, onProfile, unread = true}: {title: string; onBell?: () => void; onProfile?: () => void; unread?: boolean}) {
  return <View style={styles.header}>
    <View>
      <Text style={[styles.headerTitle, font]} accessibilityRole="header">{title}</Text>
      <View style={styles.underline} />
    </View>
    <View style={styles.headerRight}>
      <Pressable onPress={onBell} hitSlop={10} accessibilityRole="button" accessibilityLabel={unread ? 'Notifications, new' : 'Notifications'}>
        <Icon name="bell" size={22} color={colors.ink} />
        {unread && <View style={styles.bellDot} />}
      </Pressable>
      <Pressable onPress={onProfile} disabled={!onProfile} accessibilityRole="button" accessibilityLabel="Profile and settings"><Avatar initials="SN" size={30} /></Pressable>
    </View>
  </View>;
}

export function Avatar({initials, size = 40}: {initials: string; size?: number}) {
  return <View style={[styles.avatar, {width: size, height: size, borderRadius: size / 2}]}>
    <Text style={[styles.avatarText, font, {fontSize: size * 0.32, lineHeight: size * 0.32, textAlign: 'center'}]}>{initials}</Text>
  </View>;
}

export function SearchBox({value, onChangeText, placeholder}: {value: string; onChangeText: (v: string) => void; placeholder: string}) {
  return <View style={styles.search}>
    <Icon name="search" size={18} color={colors.muted} />
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.searchInput, font]} returnKeyType="search" clearButtonMode="while-editing" />
  </View>;
}

export function Chips<T extends string>({items, active, onSelect}: {items: readonly T[]; active: T; onSelect: (v: T) => void}) {
  return <View style={styles.chips} accessibilityRole="tablist">
    {items.map(item => {
      const on = item === active;
      return <Pressable key={item} onPress={() => { if (!on) haptic.select(); onSelect(item); }} style={[styles.chip, on && styles.chipOn]} accessibilityRole="tab" accessibilityState={{selected: on}}>
        <Text style={[styles.chipText, font, on && styles.chipTextOn]}>{item}</Text>
      </Pressable>;
    })}
  </View>;
}

export type Tone = 'blue' | 'green' | 'gold' | 'red' | 'grey';
const badgeTone: Record<Tone, {bg: keyof typeof colors; fg: keyof typeof colors}> = {
  blue: {bg: 'blue100', fg: 'blue700'},
  green: {bg: 'successSoft', fg: 'success'},
  gold: {bg: 'warningSoft', fg: 'warning'},
  red: {bg: 'dangerSoft', fg: 'danger'},
  grey: {bg: 'sand', fg: 'muted'},
};
export function Badge({label, tone}: {label: string; tone: Tone}) {
  const t = badgeTone[tone];
  return <View style={[styles.badge, {backgroundColor: colors[t.bg]}]}><Text style={[styles.badgeText, font, {color: colors[t.fg]}]}>{label}</Text></View>;
}

type RowProps = {title: string; detail?: string; icon?: IconName; initials?: string; badge?: {label: string; tone: Tone}; value?: string; chevron?: boolean; danger?: boolean; onPress?: () => void; onLongPress?: () => void; left?: React.ReactNode};
/** The list row used across admin: a soft blue icon or initials, two lines of text and a badge, amount or chevron. */
export function Row({title, detail, icon, initials, badge, value, chevron, danger, onPress, onLongPress, left}: RowProps) {
  return <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={350} disabled={!onPress} style={({pressed}) => [styles.row, pressed && styles.pressed]} accessibilityRole={onPress ? 'button' : undefined}>
    {left}
    {initials ? <Avatar initials={initials} size={40} /> : icon ? <View style={[styles.rowIcon, danger && styles.rowIconDanger]}><Icon name={icon} size={18} color={danger ? colors.danger : colors.blue700} /></View> : null}
    <View style={styles.rowCopy}>
      <Text style={[styles.rowTitle, font, danger && styles.danger]} numberOfLines={1}>{title}</Text>
      {!!detail && <Text style={[styles.rowDetail, font]} numberOfLines={1}>{detail}</Text>}
    </View>
    {!!value && <Text style={[styles.rowValue, font]}>{value}</Text>}
    {badge && <Badge {...badge} />}
    {chevron && <Icon name="next" size={18} color={colors.muted} />}
  </Pressable>;
}

/** Round add button floating above the tab bar (or above the Liquid Glass bar on iOS 26). */
export function Fab({onPress, label, style, overTabs}: {onPress: () => void; label: string; style?: StyleProp<ViewStyle>; overTabs?: boolean}) {
  const glass = useGlass();
  const {bottom} = useSafeAreaInsets();
  const t = useRef(new Animated.Value(0)).current;
  const still = useReduceMotion();
  useEffect(() => {
    if (still) { t.setValue(1); return; }
    Animated.spring(t, {toValue: 1, friction: 6, tension: 70, delay: 250, useNativeDriver: true}).start();
  }, [t, still]);
  return <Animated.View style={[styles.fabWrap, overTabs && glass && {bottom: GLASS_BAR_SPACE + bottom}, style, {transform: [{scale: t}]}]}>
    <Pressable onPress={onPress} onPressIn={haptic.tap} style={({pressed}) => [styles.fab, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={label}>
      <Icon name="plus" size={24} color={colors.onAccent} />
    </Pressable>
  </Animated.View>;
}

export function Field({label, multiline, ...input}: {label: string} & TextInputProps) {
  return <View style={styles.field}>
    <Text style={[styles.label, font]}>{label}</Text>
    <TextInput {...input} multiline={multiline} placeholderTextColor={colors.muted} style={[styles.input, font, multiline && styles.textarea]} />
  </View>;
}

/** Accessible choice sheet shared by dropdown fields on both mobile platforms. */
export function Select<T extends string>({label, value, options, onChange}: {label: string; value: T; options: readonly T[]; onChange: (v: T) => void}) {
  const [open, setOpen] = useState(false);
  return <View style={styles.field}>
    <Text style={[styles.label, font]}>{label}</Text>
    <Pressable onPress={() => setOpen(true)} style={[styles.input, styles.select]} accessibilityRole="button" accessibilityLabel={`${label}, ${value}`}>
      <Text style={[styles.selectText, font]}>{value}</Text><Icon name="down" size={18} color={colors.ink} />
    </Pressable>
    <Sheet visible={open} onClose={() => setOpen(false)}><Text style={adminStyles.section}>Choose {label.toLowerCase()}</Text><View accessibilityRole="radiogroup" style={{marginTop: 16}}>{options.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{checked: option === value}} onPress={() => { haptic.select(); onChange(option); }} style={[styles.input, {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8}, option === value && {borderColor: colors.blue700, backgroundColor: colors.blue50}]}><View style={{width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: option === value ? colors.blue700 : colors.muted, alignItems: 'center', justifyContent: 'center'}}>{option === value && <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue700}} />}</View><Text style={styles.selectText}>{option}</Text></Pressable>)}</View><PrimaryAction label="Done" onPress={() => setOpen(false)} /></Sheet>
  </View>;
}

export function Toggle({value, onChange, label}: {value: boolean; onChange: (v: boolean) => void; label: string}) {
  const t = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => { Animated.timing(t, {toValue: value ? 1 : 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false}).start(); }, [value, t]);
  return <Pressable onPress={() => { haptic.select(); onChange(!value); }} style={styles.toggleRow} accessibilityRole="switch" accessibilityState={{checked: value}} accessibilityLabel={label}>
    <Text style={[styles.toggleLabel, font]}>{label}</Text>
    <Animated.View style={[styles.track, {backgroundColor: t.interpolate({inputRange: [0, 1], outputRange: [colors.sandLine as string, colors.blue700 as string]})}]}>
      <Animated.View style={[styles.knob, {transform: [{translateX: t.interpolate({inputRange: [0, 1], outputRange: [2, 20]})}]}]} />
    </Animated.View>
  </Pressable>;
}

export function Checkbox({checked}: {checked: boolean}) {
  return <View style={[styles.box, checked && styles.boxOn]}>{checked && <Icon name="check" size={14} color={colors.onAccent} strokeWidth={2.4} />}</View>;
}

/** Two equal buttons pinned to the bottom, like Bulk select and Ticket detail. */
export function ButtonPair({left, right}: {left: {label: string; onPress: () => void; disabled?: boolean}; right: {label: string; onPress: () => void; disabled?: boolean; danger?: boolean}}) {
  return <View style={styles.pair}>
    <Pressable onPress={left.onPress} onPressIn={haptic.tap} disabled={left.disabled} style={({pressed}) => [styles.pairButton, styles.pairOutline, (pressed || left.disabled) && styles.pressed]} accessibilityRole="button"><Text style={[styles.pairOutlineText, font]}>{left.label}</Text></Pressable>
    <Pressable onPress={right.onPress} onPressIn={haptic.tap} disabled={right.disabled} style={({pressed}) => [styles.pairButton, right.danger ? styles.pairDanger : styles.pairFill, (pressed || right.disabled) && styles.dim]} accessibilityRole="button" accessibilityState={{disabled: right.disabled}}><Text style={[styles.pairFillText, font]}>{right.label}</Text></Pressable>
  </View>;
}

export const adminStyles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {paddingHorizontal: spacing.screen, paddingBottom: 28},
  section: {fontSize: type.subheading, color: colors.ink, fontWeight: '800'},
  link: {fontSize: type.small, color: colors.blue700, fontWeight: '700'},
  footer: {paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 8},
});

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: 10, paddingBottom: 14},
  headerTitle: {fontSize: type.title, color: colors.ink, fontWeight: '800'},
  underline: {width: 22, height: 3, borderRadius: 2, backgroundColor: colors.marigold, marginTop: 4},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 14},
  bellDot: {position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.cream},
  avatar: {backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: colors.blue900, fontWeight: '800'},
  search: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16},
  searchInput: {flex: 1, fontSize: type.small, color: colors.ink, paddingVertical: 0},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 6},
  chip: {height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, justifyContent: 'center'},
  chipOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  chipText: {fontSize: type.caption, color: colors.ink, fontWeight: '700'},
  chipTextOn: {color: colors.onAccent},
  badge: {height: 24, paddingHorizontal: 10, borderRadius: radius.pill, justifyContent: 'center'},
  badgeText: {fontSize: 11, fontWeight: '800'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 8},
  pressed: {opacity: 0.7},
  rowIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  rowIconDanger: {backgroundColor: colors.dangerSoft},
  rowCopy: {flex: 1},
  rowTitle: {fontSize: type.label, color: colors.ink, fontWeight: '700'},
  rowDetail: {fontSize: type.caption, color: colors.muted, marginTop: 3},
  rowValue: {fontSize: type.label, color: colors.ink, fontWeight: '800'},
  danger: {color: colors.danger},
  fabWrap: {position: 'absolute', right: spacing.screen, bottom: 24},
  fab: {width: 56, height: 56, borderRadius: 28, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center', shadowColor: '#17335A', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: {width: 0, height: 6}, elevation: 6},
  field: {marginBottom: 16},
  label: {fontSize: type.caption, color: colors.ink, fontWeight: '700', marginBottom: 8},
  input: {minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 14, fontSize: type.small, color: colors.ink},
  textarea: {minHeight: 96, paddingTop: 14, textAlignVertical: 'top'},
  select: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  selectText: {fontSize: type.small, color: colors.ink},
  toggleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, borderBottomWidth: 1, borderBottomColor: colors.line},
  toggleLabel: {fontSize: type.small, color: colors.ink, flex: 1},
  track: {width: 46, height: 28, borderRadius: 14, justifyContent: 'center'},
  knob: {width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, shadowOffset: {width: 0, height: 1}, elevation: 2},
  box: {width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center'},
  boxOn: {backgroundColor: colors.blue700, borderColor: colors.blue700},
  pair: {flexDirection: 'row', gap: 12, paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 8},
  pairButton: {flex: 1, height: spacing.button - 4, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center'},
  pairOutline: {borderWidth: 1.5, borderColor: colors.blue700, backgroundColor: colors.white},
  pairOutlineText: {fontSize: type.label, color: colors.blue700, fontWeight: '700'},
  pairFill: {backgroundColor: colors.sky},
  pairDanger: {backgroundColor: colors.danger},
  pairFillText: {fontSize: type.label, color: colors.onAccent, fontWeight: '700'},
  dim: {opacity: 0.6},
});
