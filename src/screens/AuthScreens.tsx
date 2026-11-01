import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputInstance} from 'react-native';
import {adminAuth, describe, type AdminUser} from '../api/auth';
import {TitleBar} from '../components/Layout';
import {Notice} from '../components/States';
import {haptic} from '../theme/system';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_SECONDS = 30;

export function LoginScreen({onSent}: {onSent: (email: string) => void}) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = EMAIL.test(email.trim());
  const emailError = touched && email.trim() && !valid ? 'Enter a full email address, like name@example.com' : undefined;

  const submit = async () => {
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await adminAuth.requestCode(email.trim());
      haptic.success();
      onSent(email.trim());
    } catch (e) {
      haptic.warning();
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  };

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Image source={require('../assets/brand/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="yizelearn" />
      <Text style={[styles.title, font]} accessibilityRole="header">Admin sign in</Text>
      <Text style={[styles.subtitle, font]}>We will email you a 6-digit code</Text>
      {!!error && <View style={styles.notice}><Notice tone="danger" title="We couldn't send the code" message={error} /></View>}
      <Text style={[styles.label, font]}>Email</Text>
      <TextInput value={email} onChangeText={v => { setEmail(v); setError(''); }} onBlur={() => setTouched(true)} onSubmitEditing={submit}
        placeholder="name@example.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="send" autoFocus
        style={[styles.input, font, !!emailError && styles.inputError]} accessibilityHint={emailError} />
      {!!emailError && <Text style={[styles.fieldError, font]}>{emailError}</Text>}
      <Primary label="Send code" onPress={submit} disabled={!valid} busy={busy} />
    </ScrollView>
  </KeyboardAvoidingView>;
}

export function VerifyScreen({email, onBack, onVerified}: {email: string; onBack: () => void; onVerified: (user: AdminUser) => void}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const input = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const verify = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const user = await adminAuth.verifyCode(email, value);
      haptic.success();
      onVerified(user);
    } catch (e) {
      haptic.warning();
      setError(describe(e));
      setCode('');
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    if (wait > 0) return;
    setError('');
    try { await adminAuth.requestCode(email); setWait(RESEND_SECONDS); } catch (e) { setError(describe(e)); }
  };

  return <View style={styles.screen}>
    <TitleBar title="" onBack={onBack} />
    <View style={styles.codeWrap}>
      <Text style={[styles.title, font]} accessibilityRole="header">Enter the code</Text>
      <Text style={[styles.subtitle, font]}>We sent a 6-digit code to{'\n'}<Text style={styles.email}>{email}</Text></Text>
      {!!error && <View style={styles.notice}><Notice tone="danger" title="That code didn't work" message={error} /></View>}
      <Pressable onPress={() => input.current?.focus()} style={styles.codeRow} accessibilityLabel="Enter the 6-digit code">
        {Array.from({length: 6}, (_, i) => <View key={i} style={[styles.codeBox, i === code.length && styles.codeBoxActive]}><Text style={[styles.codeDigit, font]}>{code[i] ?? ''}</Text></View>)}
        <TextInput ref={input} value={code} autoFocus maxLength={6} keyboardType="number-pad" autoComplete="sms-otp" textContentType="oneTimeCode"
          onChangeText={text => { const d = text.replace(/\D/g, '').slice(0, 6); setCode(d); if (d.length === 6) verify(d); }} style={styles.hidden} />
      </Pressable>
      {busy && <ActivityIndicator color={colors.blue700} style={styles.spinner} />}
      <Pressable onPress={resend} disabled={wait > 0} hitSlop={10} accessibilityRole="button" accessibilityState={{disabled: wait > 0}}>
        <Text style={[styles.resend, font, wait > 0 && styles.resendWait]}>{wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}</Text>
      </Pressable>
    </View>
  </View>;
}

function Primary({label, onPress, disabled, busy}: {label: string; onPress: () => void; disabled?: boolean; busy?: boolean}) {
  return <Pressable onPress={onPress} onPressIn={haptic.tap} disabled={busy} accessibilityRole="button" accessibilityState={{disabled: disabled || busy, busy}}
    style={({pressed}) => [styles.primary, (disabled || pressed) && styles.dim]}>
    {busy ? <ActivityIndicator color={colors.onAccent} /> : <Text style={[styles.primaryText, font]}>{label}</Text>}
  </Pressable>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.screen, paddingVertical: 32},
  logo: {width: 120, height: 48, alignSelf: 'center', marginBottom: 24},
  title: {fontSize: type.title, color: colors.ink, fontWeight: '800', textAlign: 'center'},
  subtitle: {fontSize: type.small, color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 21},
  email: {color: colors.ink, fontWeight: '700'},
  notice: {marginBottom: 16, alignSelf: 'stretch'},
  label: {fontSize: type.caption, color: colors.ink, fontWeight: '700', marginBottom: 8},
  input: {height: 56, borderRadius: radius.field, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, fontSize: type.body, color: colors.ink},
  inputError: {borderColor: colors.danger, borderWidth: 1.5, backgroundColor: colors.dangerSoft},
  fieldError: {fontSize: type.caption, color: colors.danger, marginTop: 6},
  primary: {height: spacing.button, borderRadius: radius.button, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center', marginTop: 20},
  primaryText: {fontSize: type.subheading, color: colors.onSky, fontWeight: '700'},
  dim: {opacity: 0.6},
  codeWrap: {flex: 1, alignItems: 'center', paddingHorizontal: spacing.screen, paddingTop: 24},
  codeRow: {flexDirection: 'row', gap: 8, marginTop: 8},
  codeBox: {width: 46, height: 56, borderRadius: 12, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  codeBoxActive: {borderColor: colors.blue700, borderWidth: 2},
  codeDigit: {fontSize: 22, color: colors.ink, fontWeight: '800'},
  hidden: {position: 'absolute', opacity: 0, width: 1, height: 1},
  spinner: {marginTop: 20},
  resend: {fontSize: type.small, color: colors.blue700, fontWeight: '700', marginTop: 24},
  resendWait: {color: colors.muted},
});
