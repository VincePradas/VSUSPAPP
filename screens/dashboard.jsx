import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = new Animated.Value(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("settings");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      } else {
        setError("No data found in local storage.");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error loading data from local storage.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("settings");
    navigation.replace("Login");
  };

  const ScheduleCard = ({ code, title, time, lecturer }) => (
    <TouchableOpacity style={styles.scheduleCard}>
      <View>
        <Text style={styles.courseCode}>{code}</Text>
        <Text style={styles.courseTitle}>{title}</Text>
        <Text style={styles.courseTime}>{time}</Text>
        <View style={styles.lecturerContainer}>
          <Text style={styles.lecturerText}>{lecturer}</Text>
          <Icon name="document-outline" size={20} color="#4A90E2" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickLinkButton = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.quickLink} onPress={onPress}>
      <Icon name={icon} size={24} color="#4A90E2" />
      <Text style={styles.quickLinkText}>{label}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No user data available.</Text>
      </View>
    );
  }

  const menuHeight = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMenu}>
            <Icon name="menu-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Menu */}
      <Animated.View style={[styles.menuContainer, { height: menuHeight }]}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.menuItemText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Notification */}
      <Text style={styles.notificationText}>
        Current Term: {userData.user.sy.active_year}{" "}
        {userData.user.sy.active_period}
      </Text>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <Text style={styles.welcomeText}>
            Welcome, {userData.user.student.firstname}
          </Text>
          <Text style={styles.infoText}>
            Student ID: {userData.user.student.stud_id}
          </Text>
          <Text style={styles.infoText}>
            Program: {userData.user.student.major.code}
          </Text>
          <Text style={styles.infoText}>
            Year Level: {userData.user.student.previous_year}
          </Text>
          <Text style={styles.infoText}>
            Status: {userData.user.student.is_regular ? "Regular" : "Irregular"}
          </Text>
          {userData.user.student.deficiency && (
            <Text style={styles.deficiencyText}>
              Note: {userData.user.student.deficiency}
            </Text>
          )}
        </View>
        <Image
          source={require("../assets/avatar.png")}
          style={styles.profileImage}
        />
      </View>

      {/* Schedule Section */}
      <Text style={styles.sectionTitle}>Schedule</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScheduleCard
          code="CSci 15"
          title="Subject Placeholder"
          time="M 10:00AM - 1:00PM"
          lecturer={userData.user.student.adviser.complete_name}
        />
        <ScheduleCard
          code="CSci 13 Lecture"
          title="Subject Placeholder"
          time="Th 8:00AM - 10:00AM"
          lecturer={userData.user.student.adviser.complete_name}
        />
      </ScrollView>

      {/* Quick Links Section */}
      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinksContainer}>
        <QuickLinkButton
          icon="wallet-outline"
          label="Payment"
          onPress={() => navigation.navigate("Payments")}
        />
        <QuickLinkButton
          icon="calendar-outline"
          label="Class"
          onPress={() => {}}
        />
        <QuickLinkButton
          icon="document-text-outline"
          label="Enrollment"
          onPress={() => {}}
        />
        <QuickLinkButton
          icon="library-outline"
          label="Grades"
          onPress={() => navigation.navigate("Grades")}
        />
      </View>

      {/* Upcoming Events Section */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>Enrollment Period</Text>
        <Text style={styles.eventSubtitle}>
          {userData.user.sy.active_period}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 44,
    paddingBottom: 16,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#FF4444",
    marginLeft: 8,
  },
  notificationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: "#b9bbb6",
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  deficiencyText: {
    fontSize: 14,
    color: "#FF4444",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 16,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 16,
    marginLeft: 2,
    borderRadius: 12,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  courseTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  courseTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  lecturerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  lecturerText: {
    fontSize: 14,
    color: "#666",
  },
  quickLinksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
  },
  quickLink: {
    width: "23%",
    aspectRatio: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quickLinkText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
});

export default DashboardScreen;
