import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../constants/useTheme";

const queueStats = [
  { label: "Active Queues", value: "12", accent: "primary" },
  { label: "Pending Tickets", value: "48", accent: "secondary" },
  { label: "Completed Today", value: "126", accent: "tertiary" },
];

const quickActions = [
  "View Queue",
  "Upload Ticket",
  "Check Status",
  "Announcements",
];

const recentItems = [
  { title: "Front Desk Queue", detail: "3 people waiting" },
  { title: "Online Requests", detail: "11 new submissions" },
  { title: "Verification Desk", detail: "2 tickets under review" },
];

export default function DashboardScreen() {
  const COLORS = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: COLORS.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <Text style={[styles.kicker, { color: COLORS.primary }]}>
          SmartQueue
        </Text>
        <Text style={[styles.title, { color: COLORS.text }]}>Dashboard</Text>
        <Text style={[styles.subtitle, { color: COLORS.gray }]}>
          Simple overview of queue activity and key shortcuts.
        </Text>
      </View>

      <View style={styles.statsRow}>
        {queueStats.map((item) => (
          <View
            key={item.label}
            style={[
              styles.statCard,
              { backgroundColor: COLORS.card, borderColor: COLORS.border },
            ]}
          >
            <Text style={[styles.statValue, { color: COLORS.text }]}>
              {item.value}
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.gray }]}>
              {item.label}
            </Text>
            <View
              style={[
                styles.statAccent,
                { backgroundColor: COLORS[item.accent] },
              ]}
            />
          </View>
        ))}
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: COLORS.card, borderColor: COLORS.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((item) => (
            <View
              key={item}
              style={[
                styles.actionTile,
                {
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                },
              ]}
            >
              <Text style={[styles.actionText, { color: COLORS.text }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: COLORS.card, borderColor: COLORS.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Recent Activity
        </Text>
        <View style={styles.activityList}>
          {recentItems.map((item) => (
            <View
              key={item.title}
              style={[
                styles.activityItem,
                { borderBottomColor: COLORS.border },
              ]}
            >
              <View>
                <Text style={[styles.activityTitle, { color: COLORS.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.activityDetail, { color: COLORS.gray }]}>
                  {item.detail}
                </Text>
              </View>
              <View
                style={[
                  styles.activityDot,
                  { backgroundColor: COLORS.primary },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  headerCard: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  kicker: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 128,
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  statAccent: {
    width: 42,
    height: 6,
    borderRadius: 999,
    marginTop: 14,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionTile: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    minHeight: 84,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  activityDetail: {
    fontSize: 13,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginLeft: 16,
  },
});
