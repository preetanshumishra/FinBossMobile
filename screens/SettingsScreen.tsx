import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { useThemeStore } from '../src/stores/themeStore';
import { getColors } from '../src/styles/colors';
import { authService } from '../src';

export const SettingsScreen = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const colors = useMemo(() => getColors(theme), [theme]);
  const styles = getStyles(colors);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            setLoading(true);
            await logout();
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your current password',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Next',
          onPress: async (currentPassword: string | undefined) => {
            if (!currentPassword) {
              Alert.alert('Error', 'Current password is required');
              return;
            }

            Alert.prompt(
              'Change Password',
              'Enter your new password (min 8 characters)',
              [
                {
                  text: 'Cancel',
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: 'Change',
                  onPress: async (newPassword: string | undefined) => {
                    if (!newPassword || newPassword.length < 8) {
                      Alert.alert('Error', 'Password must be at least 8 characters');
                      return;
                    }

                    try {
                      setLoading(true);
                      await authService.changePassword({
                        currentPassword,
                        newPassword,
                      });
                      Alert.alert('Success', 'Password changed successfully');
                    } catch (err) {
                      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to change password');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ],
      'secure-text'
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <MaterialIcons name="account-circle" size={48} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <MaterialIcons name={theme === 'light' ? 'light-mode' : 'dark-mode'} size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                {theme === 'light' ? 'Off' : 'On'}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={theme === 'dark' ? colors.surface : colors.disabled}
          />
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={handleChangePassword} disabled={loading}>
          <View style={styles.settingContent}>
            <MaterialIcons name="lock" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Change Password</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Update your account password</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.border} />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={[styles.aboutItem, styles.aboutItemBorder]}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>1</Text>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout} disabled={loading}>
          <View style={styles.settingContent}>
            <MaterialIcons name="logout" size={24} color={colors.error} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
              <Text style={styles.settingDesc}>Sign out of your account</Text>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 12,
  },
  dangerSection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  dangerTitle: {
    color: colors.error,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  logoutText: {
    color: colors.error,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  aboutItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  aboutValue: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  footer: {
    height: 20,
  },
});
