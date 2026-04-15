import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { auth } from "../services/firebaseAuth";

const { width } = Dimensions.get("window");
const API_BASE_URL = "http://192.168.1.65:5000/api";

export default function UserDashboard() {
  // State variables
  const [refreshing, setRefreshing] = useState(false);
  const [bookingFormVisible, setBookingFormVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [serviceTypeModalVisible, setServiceTypeModalVisible] = useState(false);
  const [queueModalVisible, setQueueModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeBookingTab, setActiveBookingTab] = useState("upcoming");
  const [activeFooterTab, setActiveFooterTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [progressWidth, setProgressWidth] = useState(40);
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [userId, setUserId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    preferredTime: ""
  });
  
  // Data states
  const [userData, setUserData] = useState({ name: "", memberType: "Premium Member", theme: "light" });
  const [queueStatus, setQueueStatus] = useState({
    position: 0,
    estimatedTime: "0 mins",
    connectionId: "",
    serviceName: "",
    status: "processing",
    currentNumber: "A-000",
    totalWaiting: 0
  });
  const [bookingDetails, setBookingDetails] = useState({ upcoming: [], past: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [serviceArrangements, setServiceArrangements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const eventSourceRef = useRef(null);
  let cameraRef = useRef(null);

  // Available services
  const services = [
    { 
      id: "nic", 
      name: "NIC Card", 
      fullName: "National Identity Card",
      icon: "card-outline", 
      time: "15 mins", 
      price: "Rs. 500", 
      description: "Apply for new or replacement NIC",
      requirements: ["Birth Certificate", "Residence Proof", "Previous NIC (if replacement)"],
      fee: "Rs. 500",
      validity: "10 years",
      color: "#1E3A8A"
    },
    { 
      id: "passport", 
      name: "Passport", 
      fullName: "Sri Lankan Passport",
      icon: "airplane-outline", 
      time: "30-45 mins", 
      price: "Rs. 3,500 - 15,000", 
      description: "New passport application or renewal",
      requirements: ["NIC", "Birth Certificate", "Previous Passport (if renewal)", "Passport Photos", "Marriage Certificate"],
      fee: "Normal: Rs. 3,500 / Urgent: Rs. 15,000",
      validity: "10 years",
      color: "#3B82F6"
    },
    { 
      id: "license", 
      name: "Driving License", 
      fullName: "Driver's License",
      icon: "car-outline", 
      time: "20-30 mins", 
      price: "Rs. 1,000 - 2,500", 
      description: "Driver's license application or renewal",
      requirements: ["NIC", "Medical Certificate", "Previous License", "Passport Photos"],
      fee: "New: Rs. 2,500 / Renewal: Rs. 1,000",
      validity: "8 years",
      color: "#10B981"
    },
  ];

  const dateOptions = ["Today", "Tomorrow", "2026-04-15", "2026-04-16", "2026-04-17"];
  const timeOptions = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  // Create user in backend
  const createUserInBackend = async (firebaseUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
          memberType: "Standard Member",
          theme: "light",
          notifications: true
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
        setUserId(result.data.userId);
        return result.data.userId;
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
    return null;
  };

  // Fetch user data by email
  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error("No authenticated user found");
        Alert.alert("Session Expired", "Please login again");
        router.push("/login");
        return null;
      }
      
      const userEmail = currentUser.email;
      
      if (!userEmail) {
        console.error("User has no email");
        return null;
      }
      
      const response = await fetch(`${API_BASE_URL}/user/${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
        setUserId(result.data.userId);
        setIsDarkMode(result.data.theme === "dark");
        return result.data.userId;
      } else {
        return await createUserInBackend(currentUser);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
    return null;
  };

  // Fetch queue status
  const fetchQueueStatus = async (uid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/queue/${uid}`);
      const result = await response.json();
      if (result.success) {
        setQueueStatus(result.data);
        setProgressWidth((result.data.position / 10) * 100);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  };

  // Refresh queue
  const handleQueueRefresh = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/queue/refresh/${userId}`, { method: "POST" });
      const result = await response.json();
      if (result.success) {
        setQueueStatus(result.data);
        setProgressWidth((result.data.position / 10) * 100);
        setLastRefresh("Just now");
        Alert.alert("Queue Updated", `Current position: #${result.data.position.toString().padStart(2, "0")}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to refresh queue");
    }
    setQueueModalVisible(false);
  };

  // Fetch appointments
  const fetchAppointments = async (uid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${uid}`);
      const result = await response.json();
      if (result.success) {
        const appointments = result.data || [];
        
        const categorized = {
          upcoming: appointments.filter(apt => apt.status === 'upcoming' || apt.status === 'pending' || apt.status === 'confirmed'),
          past: appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
        };
        
        setBookingDetails(categorized);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setBookingDetails({ upcoming: [], past: [] });
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`);
      const result = await response.json();
      if (result.success) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  // Fetch service arrangements
  const fetchServiceArrangements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-arrangements`);
      const result = await response.json();
      if (result.success) {
        setServiceArrangements(result.data);
      }
    } catch (error) {
      console.error("Error fetching service arrangements:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (uid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${uid}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Navigate to service-specific booking UI
  const navigateToServiceBooking = (service) => {
    setSelectedService(service);
    setServiceTypeModalVisible(false);
    
    if (service.id === "nic") {
      router.push("/NIC_Bookings/nic-booking");
    } else if (service.id === "passport") {
      router.push("/Passport_Bookings/passport-booking");
    } else if (service.id === "license") {
      router.push("/License_Bookings/license-booking");
    } else {
      setBookingFormVisible(true);
    }
  };

  // Create appointment
  const handleCreateAppointment = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.preferredDate || !formData.preferredTime) {
      Alert.alert("Missing Info", "Please fill all required fields");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          service: selectedService.id,
          serviceName: selectedService.fullName,
          date: formData.preferredDate,
          time: formData.preferredTime,
          estimatedTime: selectedService.time,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: "upcoming"
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        Alert.alert("Success", `${selectedService.name} appointment booked successfully!`);
        setBookingFormVisible(false);
        setServiceTypeModalVisible(false);
        setSelectedService(null);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          preferredDate: "",
          preferredTime: ""
        });
        fetchAppointments(userId);
        fetchNotifications(userId);
      } else {
        Alert.alert("Error", result.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    }
  };

  // Handle QR Code
  const handleQRCode = async () => {
    if (hasCameraPermission) {
      setQrModalVisible(true);
    } else {
      Alert.alert("Permission Required", "Please grant camera permission to scan QR codes");
    }
  };

  // Handle bar code scanned
  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData(data);
    Alert.alert("QR Code Scanned", `Data: ${data}`);
    setQrModalVisible(false);
  };

  // Handle Nearby Facilities
  const handleNearbyFacilities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/nearby-facilities`);
      const result = await response.json();
      if (result.success && result.data.url) {
        Linking.openURL(result.data.url);
      } else {
        Linking.openURL("https://www.google.com/maps/search/government+offices+near+me");
      }
    } catch (error) {
      Linking.openURL("https://www.google.com/maps/search/government+offices+near+me");
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!userId) return;
    await fetch(`${API_BASE_URL}/notifications/${userId}/${notification.id}`, { method: "PUT" });
    setShowNotifications(false);
    fetchNotifications(userId);
    Alert.alert(notification.title, notification.message);
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (userId) {
      await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme ? "dark" : "light" })
      });
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    const uid = await fetchUserData();
    if (uid) {
      await Promise.all([
        fetchQueueStatus(uid),
        fetchAppointments(uid),
        fetchNotifications(uid),
      ]);
    }
    await Promise.all([
      fetchAnnouncements(),
      fetchServiceArrangements(),
    ]);
    setRefreshing(false);
  };

  // Get unread count
  const getUnreadCount = () => notifications.filter(n => !n.read).length;

  // Get theme colors
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        background: "#121212",
        cardBackground: "#1E1E1E",
        text: "#FFFFFF",
        textSecondary: "#A0A0A0",
        border: "#333333",
        headerBackground: "#1E1E1E",
      };
    }
    return {
      background: "#F8FAFC",
      cardBackground: "#FFFFFF",
      text: "#0F172A",
      textSecondary: "#64748B",
      border: "#E2E8F0",
      headerBackground: "#FFFFFF",
    };
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const uid = await fetchUserData();
      if (uid) {
        setUserId(uid);
        await Promise.all([
          fetchQueueStatus(uid),
          fetchAppointments(uid),
          fetchNotifications(uid),
        ]);
        
        try {
          if (eventSourceRef.current) eventSourceRef.current.close();
          eventSourceRef.current = new EventSource(`${API_BASE_URL}/queue/stream/${uid}`);
          eventSourceRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setQueueStatus(data);
            setProgressWidth((data.position / 10) * 100);
            setLastRefresh("Just now");
          };
          eventSourceRef.current.onerror = (error) => {
            console.log("EventSource error (non-critical):", error);
          };
        } catch (eventSourceError) {
          console.log("EventSource not supported:", eventSourceError);
        }
      }
      await Promise.all([
        fetchAnnouncements(),
        fetchServiceArrangements(),
      ]);
      setIsLoading(false);
    };
    
    init();
    
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const colors = getThemeColors();

  // Loading Screen
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.appTitle, { color: "#1E3A8A" }]}>Dashboard</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowNotifications(!showNotifications)}>
              <View style={styles.notificationIcon}>
                <Ionicons name="notifications-outline" size={22} color="#1E3A8A" />
                {getUnreadCount() > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>{getUnreadCount()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{userData.name?.charAt(0) || "U"}</Text>
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeLabel, { color: colors.textSecondary }]}>WELCOME BACK</Text>
          <Text style={[styles.userName, { color: colors.text }]}>Hi, {userData.name}</Text>
          <View style={styles.memberTag}>
            <Text style={styles.memberText}>{userData.memberType}</Text>
          </View>
        </View>
      </View>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <View style={[styles.notificationsDropdown, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.notificationsHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.notificationsTitle, { color: colors.text }]}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notificationsList}>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <TouchableOpacity 
                  key={notification.id} 
                  style={[styles.notificationItem, !notification.read && styles.unreadNotification, { borderBottomColor: colors.border }]}
                  onPress={() => handleNotificationClick(notification)}
                >
                  <View style={styles.notificationDot} />
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationText, { color: colors.text }]}>{notification.title}</Text>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noNotifications, { color: colors.textSecondary }]}>No notifications</Text>
            )}
          </ScrollView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E3A8A"]} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <FontAwesome5 name="clock" size={20} color="#1E3A8A" />
            <Text style={[styles.statCardNumber, { color: colors.text }]}>{queueStatus.totalWaiting || 0}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Waiting</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="checkmark-done-circle" size={20} color="#1E3A8A" />
            <Text style={[styles.statCardNumber, { color: colors.text }]}>{bookingDetails.past?.length || 0}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="star" size={20} color="#1E3A8A" />
            <Text style={[styles.statCardNumber, { color: colors.text }]}>98%</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Satisfaction</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.cardBackground }]} onPress={() => setServiceTypeModalVisible(true)}>
            <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.quickActionIcon}>
              <Ionicons name="calendar-outline" size={28} color="#1E3A8A" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Book</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.cardBackground }]} onPress={() => setDetailsModalVisible(true)}>
            <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.quickActionIcon}>
              <Ionicons name="document-text-outline" size={28} color="#1E3A8A" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.cardBackground }]} onPress={() => setQueueModalVisible(true)}>
            <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.quickActionIcon}>
              <Ionicons name="hourglass-outline" size={28} color="#1E3A8A" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.cardBackground }]} onPress={handleQRCode}>
            <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.quickActionIcon}>
              <Ionicons name="qr-code-outline" size={28} color="#1E3A8A" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Active Queue Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>ACTIVE QUEUE</Text>
            <TouchableOpacity onPress={() => setQueueModalVisible(true)}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.lastRefreshText, { color: colors.textSecondary }]}>Last updated: {lastRefresh}</Text>

          <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>CURRENTLY SERVING</Text>
              <View style={[styles.liveBadge, queueStatus.status === "completed" && styles.completedBadge]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{queueStatus.currentNumber || "A-000"}</Text>
              </View>
            </View>
            <Text style={styles.progressTitle}>{queueStatus.serviceName || "No Active Service"}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>YOUR POSITION</Text>
              </View>
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={14} color="#1E3A8A" />
                <Text style={styles.timeText}>#{queueStatus.position.toString().padStart(2, "0")}</Text>
              </View>
            </View>
            <View style={styles.connectionRow}>
              <Ionicons name="people-outline" size={16} color="#1E3A8A" />
              <Text style={styles.connectionText}>{queueStatus.totalWaiting || 0} people ahead</Text>
            </View>
          </LinearGradient>

          <View style={styles.queueProgress}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progressWidth))}%` }]} />
            </View>
            <Text style={[styles.queueHint, { color: colors.textSecondary }]}>
              {queueStatus.position > 0 ? `Approximately ${queueStatus.estimatedTime} waiting time` : "Your turn is next!"}
            </Text>
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Announcements</Text>
          {announcements.map(announcement => (
            <TouchableOpacity key={announcement.id} style={[styles.announcementCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.announcementIcon, { backgroundColor: `${announcement.color}15` }]}>
                <Ionicons name={announcement.icon} size={24} color={announcement.color} />
              </View>
              <View style={styles.announcementContent}>
                <Text style={[styles.announcementTitle, { color: colors.text }]}>{announcement.title}</Text>
                <Text style={[styles.announcementDesc, { color: colors.textSecondary }]}>{announcement.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Service Arrangements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Arrangements</Text>
          {serviceArrangements.map((item, index) => (
            <View key={index} style={[styles.serviceRow, { backgroundColor: colors.cardBackground }]}>
              <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.serviceIconContainer}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </LinearGradient>
              <View style={styles.serviceContent}>
                <Text style={[styles.serviceLabel, { color: item.color }]}>{item.title}</Text>
                <Text style={[styles.serviceText, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Nearby Facilities */}
        <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.nearbyCard}>
          <View style={styles.nearbyHeader}>
            <Text style={[styles.nearbyTitle, { color: colors.text }]}>Nearby Facilities</Text>
            <MaterialCommunityIcons name="office-building" size={28} color="#1E3A8A" />
          </View>
          <Text style={[styles.nearbyText, { color: colors.textSecondary }]}>Find government offices, service centers near you</Text>
          <TouchableOpacity style={styles.nearbyButton} onPress={handleNearbyFacilities}>
            <Text style={styles.nearbyButtonText}>Open Google Maps →</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveFooterTab("home")}>
          <Ionicons name={activeFooterTab === "home" ? "home" : "home-outline"} size={24} color={activeFooterTab === "home" ? "#1E3A8A" : "#94A3B8"} />
          <Text style={[styles.tabLabel, activeFooterTab === "home" && styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => { setActiveFooterTab("booking"); setServiceTypeModalVisible(true); }}>
          <Ionicons name={activeFooterTab === "booking" ? "calendar" : "calendar-outline"} size={24} color={activeFooterTab === "booking" ? "#1E3A8A" : "#94A3B8"} />
          <Text style={[styles.tabLabel, activeFooterTab === "booking" && styles.activeTabLabel]}>Booking</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveFooterTab("settings")}>
          <Ionicons name={activeFooterTab === "settings" ? "settings" : "settings-outline"} size={24} color={activeFooterTab === "settings" ? "#1E3A8A" : "#94A3B8"} />
          <Text style={[styles.tabLabel, activeFooterTab === "settings" && styles.activeTabLabel]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Service Type Modal */}
      <Modal visible={serviceTypeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Service</Text>
              <TouchableOpacity onPress={() => setServiceTypeModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceTypeItem, { backgroundColor: colors.background }]}
                  onPress={() => navigateToServiceBooking(service)}
                >
                  <LinearGradient 
                    colors={service.id === "license" ? ["#D1FAE5", "#A7F3D0"] : service.id === "passport" ? ["#E2E8F0", "#CBD5E1"] : ["#EFF6FF", "#DBEAFE"]} 
                    style={styles.serviceTypeIcon}
                  >
                    <Ionicons name={service.icon} size={28} color={service.id === "license" ? "#059669" : service.id === "passport" ? "#0F172A" : "#1E3A8A"} />
                  </LinearGradient>
                  <View style={styles.serviceTypeInfo}>
                    <Text style={[styles.serviceTypeName, { color: colors.text }]}>{service.name}</Text>
                    <Text style={[styles.serviceTypeDesc, { color: colors.textSecondary }]}>{service.description}</Text>
                    <View style={styles.serviceMetaRow}>
                      <View style={styles.serviceMeta}>
                        <Ionicons name="time-outline" size={12} color={service.color} />
                        <Text style={[styles.serviceMetaText, { color: service.color }]}>{service.time}</Text>
                      </View>
                      <View style={styles.serviceMeta}>
                        <Ionicons name="cash-outline" size={12} color={service.color} />
                        <Text style={[styles.serviceMetaText, { color: service.color }]}>{service.price}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Booking Form Modal */}
      <Modal visible={bookingFormVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Book {selectedService?.name}
              </Text>
              <TouchableOpacity onPress={() => setBookingFormVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <LinearGradient 
                colors={selectedService?.id === "license" ? ["#D1FAE5", "#A7F3D0"] : selectedService?.id === "passport" ? ["#E2E8F0", "#CBD5E1"] : ["#EFF6FF", "#DBEAFE"]} 
                style={styles.serviceInfoCard}
              >
                <View style={styles.serviceInfoHeader}>
                  <Ionicons name={selectedService?.icon} size={32} color={selectedService?.color} />
                  <Text style={[styles.serviceInfoTitle, { color: selectedService?.color }]}>
                    {selectedService?.fullName}
                  </Text>
                </View>
                <View style={styles.serviceInfoDetails}>
                  <View style={styles.serviceInfoRow}>
                    <Text style={styles.serviceInfoLabel}>Processing Time:</Text>
                    <Text style={[styles.serviceInfoValue, { color: selectedService?.color }]}>{selectedService?.time}</Text>
                  </View>
                  <View style={styles.serviceInfoRow}>
                    <Text style={styles.serviceInfoLabel}>Fee:</Text>
                    <Text style={[styles.serviceInfoValue, { color: selectedService?.color }]}>{selectedService?.fee}</Text>
                  </View>
                  <View style={styles.serviceInfoRow}>
                    <Text style={styles.serviceInfoLabel}>Validity:</Text>
                    <Text style={[styles.serviceInfoValue, { color: selectedService?.color }]}>{selectedService?.validity}</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={[styles.requirementsSection, selectedService?.id === "license" && { backgroundColor: "#ECFDF5" }]}>
                <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                  Required Documents:
                </Text>
                {selectedService?.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Ionicons name="checkmark-circle" size={16} color={selectedService?.color} />
                    <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                      {req}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.formLabel, { color: colors.text }]}>Full Name *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
              
              <Text style={[styles.formLabel, { color: colors.text }]}>Email *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />
              
              <Text style={[styles.formLabel, { color: colors.text }]}>Phone Number *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              
              <Text style={[styles.formLabel, { color: colors.text }]}>Address</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your address"
                placeholderTextColor={colors.textSecondary}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
              />
              
              <Text style={[styles.formLabel, { color: colors.text }]}>Preferred Date *</Text>
              <View style={styles.optionsGrid}>
                {dateOptions.map(date => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.optionChip, 
                      formData.preferredDate === date && styles.optionChipSelected, 
                      { backgroundColor: colors.background },
                      selectedService?.id === "license" && formData.preferredDate === date && { backgroundColor: "#059669" },
                      selectedService?.id === "passport" && formData.preferredDate === date && { backgroundColor: "#0F172A" }
                    ]}
                    onPress={() => setFormData({ ...formData, preferredDate: date })}
                  >
                    <Text style={[
                      styles.optionChipText, 
                      formData.preferredDate === date && styles.optionChipTextSelected, 
                      { color: colors.text }
                    ]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.formLabel, { color: colors.text }]}>Preferred Time *</Text>
              <View style={styles.optionsGrid}>
                {timeOptions.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.optionChip, 
                      formData.preferredTime === time && styles.optionChipSelected, 
                      { backgroundColor: colors.background },
                      selectedService?.id === "license" && formData.preferredTime === time && { backgroundColor: "#059669" },
                      selectedService?.id === "passport" && formData.preferredTime === time && { backgroundColor: "#0F172A" }
                    ]}
                    onPress={() => setFormData({ ...formData, preferredTime: time })}
                  >
                    <Text style={[
                      styles.optionChipText, 
                      formData.preferredTime === time && styles.optionChipTextSelected, 
                      { color: colors.text }
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleCreateAppointment}>
              <LinearGradient 
                colors={selectedService?.id === "license" ? ["#059669", "#10B981"] : selectedService?.id === "passport" ? ["#0F172A", "#1E3A8A"] : ["#1E3A8A", "#3B82F6"]} 
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>Confirm Appointment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal visible={qrModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.qrModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Scan QR Code</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "pdf417", "aztec", "code128", "code39", "code93", "codabar", "datamatrix", "ean13", "ean8", "itf14", "upc_a", "upc_e"],
                }}
              />
            </View>
            <Text style={[styles.qrHint, { color: colors.textSecondary }]}>Position the QR code within the frame</Text>
          </View>
        </View>
      </Modal>

      {/* Queue Modal */}
      <Modal visible={queueModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="refresh-circle" size={56} color="#1E3A8A" />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Queue Status</Text>
            <View style={[styles.queueCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.queueCardTitle, { color: colors.text }]}>{queueStatus.serviceName || "No Active Service"}</Text>
              <Text style={[styles.queueCardPosition, { color: "#1E3A8A" }]}>Your Position: #{queueStatus.position.toString().padStart(2, "0")}</Text>
              <Text style={[styles.queueCardTime, { color: colors.textSecondary }]}>Currently Serving: {queueStatus.currentNumber || "A-000"}</Text>
              <Text style={[styles.queueCardConnection, { color: colors.textSecondary }]}>People Ahead: {queueStatus.totalWaiting || 0}</Text>
              <View style={styles.queueProgress}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progressWidth))}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setQueueModalVisible(false)}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirm]} onPress={handleQueueRefresh}>
                <Text style={styles.modalConfirmText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Details Modal */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>My Bookings</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.tabBar}>
              <TouchableOpacity style={[styles.tab, activeBookingTab === "upcoming" && styles.activeTab]} onPress={() => setActiveBookingTab("upcoming")}>
                <Text style={[styles.tabText, activeBookingTab === "upcoming" && styles.activeTabText]}>Upcoming ({bookingDetails.upcoming?.length || 0})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeBookingTab === "past" && styles.activeTab]} onPress={() => setActiveBookingTab("past")}>
                <Text style={[styles.tabText, activeBookingTab === "past" && styles.activeTabText]}>Past ({bookingDetails.past?.length || 0})</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bookingList}>
              {(activeBookingTab === "upcoming" ? (bookingDetails.upcoming || []) : (bookingDetails.past || [])).map(booking => (
                <View key={booking.id} style={[styles.bookingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.bookingIcon}>
                    <Ionicons 
                      name={booking.service === "license" ? "car" : booking.service === "passport" ? "airplane" : "calendar"} 
                      size={20} 
                      color={booking.service === "license" ? "#059669" : booking.service === "passport" ? "#0F172A" : "#1E3A8A"} 
                    />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={[styles.bookingService, { color: colors.text }]}>{booking.serviceName || booking.service}</Text>
                    <Text style={[styles.bookingDateTime, { color: colors.textSecondary }]}>{booking.date} at {booking.time}</Text>
                  </View>
                  <View style={[styles.bookingStatus, booking.status === "confirmed" && styles.statusConfirmed]}>
                    <Text style={styles.bookingStatusText}>{booking.status || "Pending"}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={activeFooterTab === "settings"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity onPress={() => setActiveFooterTab("home")}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={24} color="#1E3A8A" />
                <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#767577", true: "#1E3A8A" }}
                thumbColor={isDarkMode ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color="#1E3A8A" />
                <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
              </View>
              <Switch
                value={userData.notifications}
                onValueChange={async (value) => {
                  if (userId) {
                    await fetch(`${API_BASE_URL}/user/${userId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ notifications: value })
                    });
                    setUserData({ ...userData, notifications: value });
                  }
                }}
                trackColor={{ false: "#767577", true: "#1E3A8A" }}
                thumbColor={userData.notifications ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={24} color="#1E3A8A" />
                <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert("Language", "English (Default)")}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>English</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={24} color="#1E3A8A" />
                <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert("Privacy Policy", "Your data is secure with us.")}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={24} color="#1E3A8A" />
                <Text style={[styles.settingText, { color: colors.text }]}>Terms of Service</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert("Terms of Service", "Terms and conditions apply.")}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={24} color="#1E3A8A" />
                <Text style={[styles.settingText, { color: colors.text }]}>About</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert("About", "Digital Concierge v2.0\nGovernment Services Portal")}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={async () => {
                Alert.alert(
                  "Logout",
                  "Are you sure you want to logout?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Logout", 
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await auth.signOut();
                          router.push("/login");
                        } catch (error) {
                          Alert.alert("Error", "Failed to logout");
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, marginTop: 16 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  appTitle: { fontSize: 24, fontWeight: "700" },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 12 },
  notificationIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", position: "relative" },
  notificationBadge: { position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#EF4444", justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  notificationCount: { fontSize: 10, fontWeight: "600", color: "#FFFFFF" },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  avatarSmallText: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  welcomeContainer: { marginTop: 4 },
  welcomeLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 1, marginBottom: 4 },
  userName: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  memberTag: { backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start" },
  memberText: { fontSize: 10, fontWeight: "600", color: "#1E3A8A" },
  notificationsDropdown: { position: "absolute", top: 100, right: 20, left: 20, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, zIndex: 1000, maxHeight: 400 },
  notificationsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  notificationsTitle: { fontSize: 16, fontWeight: "700" },
  notificationsList: { maxHeight: 350 },
  notificationItem: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1 },
  unreadNotification: { backgroundColor: "#EFF6FF" },
  notificationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1E3A8A", marginRight: 12 },
  notificationContent: { flex: 1 },
  notificationText: { fontSize: 13, marginBottom: 2 },
  notificationTime: { fontSize: 10 },
  noNotifications: { textAlign: "center", padding: 20 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 80, paddingTop: 20 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24, marginTop: 10 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statCardNumber: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  statCardLabel: { fontSize: 11, marginTop: 4 },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  quickActionItem: { flex: 1, minWidth: (width - 52) / 2, borderRadius: 16, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  quickActionText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  refreshText: { fontSize: 12, fontWeight: "500", color: "#1E3A8A" },
  lastRefreshText: { fontSize: 10, marginBottom: 12 },
  progressCard: { borderRadius: 20, padding: 18, shadowColor: "#1E3A8A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  progressLabel: { fontSize: 11, fontWeight: "600", color: "#1E3A8A", letterSpacing: 0.8 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#DC2626", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, gap: 4 },
  completedBadge: { backgroundColor: "#10B981" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  liveText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  progressTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  badge: { backgroundColor: "#1E3A8A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
  timeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  timeText: { fontSize: 12, fontWeight: "500", color: "#1E3A8A" },
  connectionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  connectionText: { fontSize: 12, fontWeight: "500", color: "#1E3A8A" },
  queueProgress: { marginTop: 12 },
  progressBarBg: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#1E3A8A", borderRadius: 3 },
  queueHint: { fontSize: 10, marginTop: 8, textAlign: "center" },
  announcementCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  announcementIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 14 },
  announcementContent: { flex: 1 },
  announcementTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  announcementDesc: { fontSize: 12 },
  serviceRow: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  serviceIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 14 },
  serviceContent: { flex: 1 },
  serviceLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 },
  serviceText: { fontSize: 13, lineHeight: 18 },
  nearbyCard: { borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  nearbyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  nearbyTitle: { fontSize: 18, fontWeight: "700" },
  nearbyText: { fontSize: 14, marginBottom: 16 },
  nearbyButton: { backgroundColor: "#EFF6FF", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, alignSelf: "flex-start" },
  nearbyButtonText: { fontSize: 14, fontWeight: "600", color: "#1E3A8A" },
  bottomTabBar: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 20, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0 },
  tabItem: { flex: 1, alignItems: "center", gap: 4 },
  tabLabel: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  activeTabLabel: { color: "#1E3A8A", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { borderRadius: 24, padding: 24, width: "85%", alignItems: "center" },
  largeModal: { width: "90%", maxHeight: "85%", alignItems: "stretch" },
  qrModal: { width: "90%", alignItems: "stretch" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%", marginTop: 16 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  modalCancel: { backgroundColor: "#F1F5F9" },
  modalCancelText: { color: "#64748B", fontWeight: "600" },
  modalConfirm: { backgroundColor: "#1E3A8A" },
  modalConfirmText: { color: "#FFFFFF", fontWeight: "600" },
  serviceTypeItem: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 10 },
  serviceTypeIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 14 },
  serviceTypeInfo: { flex: 1 },
  serviceTypeName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  serviceTypeDesc: { fontSize: 12, marginBottom: 6 },
  serviceMetaRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  serviceMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  serviceMetaText: { fontSize: 10, fontWeight: "500" },
  serviceInfoCard: { borderRadius: 12, padding: 16, marginBottom: 16 },
  serviceInfoHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  serviceInfoTitle: { fontSize: 16, fontWeight: "700", flex: 1 },
  serviceInfoDetails: { gap: 8 },
  serviceInfoRow: { flexDirection: "row", justifyContent: "space-between" },
  serviceInfoLabel: { fontSize: 12, color: "#64748B" },
  serviceInfoValue: { fontSize: 12, fontWeight: "600" },
  requirementsSection: { backgroundColor: "#F0FDF4", borderRadius: 12, padding: 12, marginBottom: 16 },
  requirementsTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  requirementItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  requirementText: { fontSize: 12 },
  formContainer: { maxHeight: 500 },
  formLabel: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 8 },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 8 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  optionChipSelected: { backgroundColor: "#1E3A8A", borderColor: "#1E3A8A" },
  optionChipText: { fontSize: 13 },
  optionChipTextSelected: { color: "#FFFFFF" },
  nextButton: { marginTop: 20, borderRadius: 12, overflow: "hidden" },
  nextButtonGradient: { paddingVertical: 14, alignItems: "center" },
  nextButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  cameraContainer: { height: 400, borderRadius: 12, overflow: "hidden", marginBottom: 16 },
  camera: { flex: 1 },
  qrHint: { textAlign: "center", fontSize: 12, marginTop: 8 },
  queueCard: { borderRadius: 16, padding: 16, marginVertical: 16, width: "100%" },
  queueCardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  queueCardPosition: { fontSize: 20, fontWeight: "700", marginBottom: 4, textAlign: "center" },
  queueCardTime: { fontSize: 14, marginBottom: 4, textAlign: "center" },
  queueCardConnection: { fontSize: 12, marginBottom: 12, textAlign: "center" },
  tabBar: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: "500", color: "#64748B" },
  activeTabText: { color: "#1E3A8A", fontWeight: "600" },
  bookingList: { maxHeight: 400 },
  bookingItem: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 10 },
  bookingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  bookingInfo: { flex: 1 },
  bookingService: { fontSize: 14, fontWeight: "600" },
  bookingDateTime: { fontSize: 12, marginTop: 2 },
  bookingStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#FEF3C7" },
  statusConfirmed: { backgroundColor: "#D1FAE5" },
  bookingStatusText: { fontSize: 10, fontWeight: "600", color: "#92400E" },
  cancelButton: { marginTop: 16, paddingVertical: 12, alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12 },
  cancelButtonText: { fontSize: 14, fontWeight: "500", color: "#64748B" },
  settingItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { fontSize: 16, fontWeight: "500" },
  settingValue: { fontSize: 14 },
  logoutButton: { marginTop: 24, paddingVertical: 14, backgroundColor: "#EF4444", borderRadius: 12, alignItems: "center" },
  logoutButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});