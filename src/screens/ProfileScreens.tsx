import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { adminStyles, Field, Row, Toggle } from '../components/Admin';
import { BottomButton, TitleBar } from '../components/Layout';

export function ProfileScreen({
  onBack,
  onLogout,
}: {
  onBack: () => void;
  onLogout: () => void;
}) {
  const [section, setSection] = useState('');
  const [name, setName] = useState('Sunday Nwachukwu');
  const [email, setEmail] = useState('admin@yizelearn.com');
  const [alerts, setAlerts] = useState({
    courses: true,
    payments: true,
    support: true,
  });
  return (
    <View style={adminStyles.screen}>
      <TitleBar
        title={section || 'Profile and settings'}
        onBack={section ? () => setSection('') : onBack}
      />
      <ScrollView contentContainerStyle={adminStyles.content}>
        {!section && (
          <>
            <Row
              icon="user"
              title="Profile"
              detail="Name, photo, email"
              chevron
              onPress={() => setSection('Profile')}
            />
            <Row
              icon="bell"
              title="Notification settings"
              detail="Choose alerts"
              chevron
              onPress={() => setSection('Notification settings')}
            />
            <Row
              icon="lock"
              title="Security and password"
              detail="Sign-in and devices"
              chevron
              onPress={() => setSection('Security and password')}
            />
            <Row
              icon="laptop"
              title="Help centre"
              detail="Guides and support"
              chevron
              onPress={() => setSection('Help centre')}
            />
          </>
        )}
        {section === 'Profile' && (
          <>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}
        {section === 'Notification settings' && (
          <>
            {Object.entries(alerts).map(([key, value]) => (
              <Toggle
                key={key}
                label={`${key[0].toUpperCase()}${key.slice(1)} alerts`}
                value={value}
                onChange={v => setAlerts(x => ({ ...x, [key]: v }))}
              />
            ))}
          </>
        )}
        {section === 'Security and password' && (
          <>
            <Row
              icon="lock"
              title="Email verification"
              detail="Sign-in uses a code sent to your email"
            />
            <Row icon="logout" title="Log out" danger onPress={onLogout} />
          </>
        )}
        {section === 'Help centre' && (
          <>
            <Row
              icon="users"
              title="Manage users"
              detail="Tap a user to change their role or reset access."
            />
            <Row
              icon="laptop"
              title="Review courses"
              detail="Tap a course to approve, feature or unpublish it."
            />
            <Row
              icon="message"
              title="Support tickets"
              detail="Open More → Support to reply to learners."
            />
          </>
        )}
      </ScrollView>
      {(section === 'Profile' || section === 'Notification settings') && (
        <BottomButton
          label="Save changes"
          disabled={
            section === 'Profile' &&
            (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          }
          onPress={() =>
            Alert.alert(
              'Saved in this preview',
              'Account settings will sync when the admin API is connected.',
            )
          }
        />
      )}
    </View>
  );
}
