import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  
  // Study Reminders
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakReminder, setStreakReminder] = useState(true);
  const [goalReminder, setGoalReminder] = useState(false);

  // Learning Updates
  const [newLessons, setNewLessons] = useState(true);
  const [practiceReady, setPracticeReady] = useState(true);
  const [achievementUnlocked, setAchievementUnlocked] = useState(true);

  // Progress Reports
  const [weeklyProgress, setWeeklyProgress] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(false);
  const [masteryMilestones, setMasteryMilestones] = useState(true);

  // Communication
  const [tips, setTips] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const NotificationToggle = ({ 
    icon, 
    title, 
    description, 
    value, 
    onValueChange,
    iconBg 
  }: { 
    icon: string, 
    title: string, 
    description: string, 
    value: boolean, 
    onValueChange: (value: boolean) => void,
    iconBg: string 
  }) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleLeft}>
        <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color="#091426" />
        </View>
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e3e5', true: '#b8b3ff' }}
        thumbColor={value ? '#4b41e1' : '#f2f4f6'}
        ios_backgroundColor="#e0e3e5"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4b41e1" />
          <Text style={styles.infoText}>
            Manage your notification preferences to stay updated on your learning progress
          </Text>
        </View>

        {/* Study Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Reminders</Text>
          <View style={styles.toggleList}>
            <NotificationToggle
              icon="alarm-outline"
              title="Daily Study Reminder"
              description="Get reminded to practice daily"
              value={dailyReminder}
              onValueChange={setDailyReminder}
              iconBg="rgba(75, 65, 225, 0.1)"
            />
            <NotificationToggle
              icon="flame-outline"
              title="Streak Reminder"
              description="Don't lose your learning streak"
              value={streakReminder}
              onValueChange={setStreakReminder}
              iconBg="rgba(255, 152, 0, 0.1)"
            />
            <NotificationToggle
              icon="flag-outline"
              title="Goal Reminder"
              description="Stay on track with your goals"
              value={goalReminder}
              onValueChange={setGoalReminder}
              iconBg="rgba(0, 164, 114, 0.1)"
            />
          </View>
        </View>

        {/* Learning Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Updates</Text>
          <View style={styles.toggleList}>
            <NotificationToggle
              icon="book-outline"
              title="New Lessons Available"
              description="Get notified about new content"
              value={newLessons}
              onValueChange={setNewLessons}
              iconBg="rgba(75, 65, 225, 0.1)"
            />
            <NotificationToggle
              icon="school-outline"
              title="Practice Ready"
              description="Time to practice your skills"
              value={practiceReady}
              onValueChange={setPracticeReady}
              iconBg="rgba(0, 164, 114, 0.1)"
            />
            <NotificationToggle
              icon="trophy-outline"
              title="Achievement Unlocked"
              description="Celebrate your accomplishments"
              value={achievementUnlocked}
              onValueChange={setAchievementUnlocked}
              iconBg="rgba(255, 193, 7, 0.2)"
            />
          </View>
        </View>

        {/* Progress Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Reports</Text>
          <View style={styles.toggleList}>
            <NotificationToggle
              icon="stats-chart-outline"
              title="Weekly Progress"
              description="Your weekly learning summary"
              value={weeklyProgress}
              onValueChange={setWeeklyProgress}
              iconBg="rgba(75, 65, 225, 0.1)"
            />
            <NotificationToggle
              icon="calendar-outline"
              title="Monthly Report"
              description="Detailed monthly insights"
              value={monthlyReport}
              onValueChange={setMonthlyReport}
              iconBg="rgba(0, 164, 114, 0.1)"
            />
            <NotificationToggle
              icon="star-outline"
              title="Mastery Milestones"
              description="When you reach mastery levels"
              value={masteryMilestones}
              onValueChange={setMasteryMilestones}
              iconBg="rgba(255, 193, 7, 0.2)"
            />
          </View>
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          <View style={styles.toggleList}>
            <NotificationToggle
              icon="bulb-outline"
              title="Learning Tips"
              description="Helpful tips and strategies"
              value={tips}
              onValueChange={setTips}
              iconBg="rgba(255, 152, 0, 0.1)"
            />
            <NotificationToggle
              icon="megaphone-outline"
              title="App Updates"
              description="New features and improvements"
              value={updates}
              onValueChange={setUpdates}
              iconBg="rgba(75, 65, 225, 0.1)"
            />
            <NotificationToggle
              icon="pricetag-outline"
              title="Promotions"
              description="Special offers and discounts"
              value={promotions}
              onValueChange={setPromotions}
              iconBg="rgba(0, 164, 114, 0.1)"
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.quietHoursCard}>
          <View style={styles.quietHoursHeader}>
            <Ionicons name="moon-outline" size={24} color="#4b41e1" />
            <Text style={styles.quietHoursTitle}>Quiet Hours</Text>
          </View>
          <Text style={styles.quietHoursDescription}>
            Mute notifications during specific hours
          </Text>
          <TouchableOpacity style={styles.quietHoursButton}>
            <Text style={styles.quietHoursButtonText}>Set Quiet Hours</Text>
            <Ionicons name="chevron-forward" size={20} color="#4b41e1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#e2dfff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#091426',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 12,
  },
  toggleList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#091426',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#75777d',
  },
  quietHoursCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  quietHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  quietHoursTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
  },
  quietHoursDescription: {
    fontSize: 14,
    color: '#75777d',
    marginBottom: 16,
  },
  quietHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e2dfff',
    padding: 16,
    borderRadius: 12,
  },
  quietHoursButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b41e1',
  },
});
