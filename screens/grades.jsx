import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons"; 

const GradesTab = () => {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  
  const [year, setYear] = useState("2024");
  const [period, setPeriod] = useState("1");

  useEffect(() => {
    fetchGrades();
  }, [year, period]); 

  const fetchGrades = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (!parsedUser?.token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `https://c1-student.vsu.edu.ph/api/students/grades?sy_year=${year}&sy_period=${period}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${parsedUser.token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      const gradesData = JSON.parse(responseText);

      if (!gradesData || !Array.isArray(gradesData.grades)) {
        throw new Error("Invalid grades data structure");
      }

      setGrades(gradesData.grades);
      setError(null);
    } catch (error) {
      console.error("Error details:", error);
      let errorMessage = "Failed to load grades. ";

      if (error.message.includes("No authentication token found")) {
        errorMessage += "Please log in again.";
      } else if (error.message.includes("Network request failed")) {
        errorMessage += "Please check your internet connection.";
      } else if (error.message.includes("Invalid response format")) {
        errorMessage += "Server returned invalid data.";
      } else {
        errorMessage += "Please try again later.";
      }

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading grades...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#6C63FF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Grades</Text>
                  <Text style={styles.headerSubtitle}>Main Campus</Text>
        <Text style={styles.headerSubtitle}>
          SY {year} - {parseInt(year) + 1} / {period === "1" ? "First" : "Second"} Semester
        </Text>
        </View>
      </View>

      {/* Dropdowns for Year and Period */}
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={year}
          onValueChange={(itemValue) => setYear(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="2023" value="2023" />
          <Picker.Item label="2024" value="2024" />
        </Picker>
        <Picker
          selectedValue={period}
          onValueChange={(itemValue) => setPeriod(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="First Semester" value="1" />
          <Picker.Item label="Second Semester" value="2" />
        </Picker>
      </View>

      {/* Grades Table */}
      {grades && grades.length > 0 ? (
        <ScrollView style={styles.tableWrapper}>
          <ScrollView
            style={styles.tableContainer}
            horizontal={true}
            showsHorizontalScrollIndicator={true}
          >
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.column, styles.subjectColumn]}>
                  <Text style={styles.tableHeaderText}>Subject</Text>
                </View>
                <View style={[styles.column, styles.instructorColumn]}>
                  <Text style={styles.tableHeaderText}>Instructor</Text>
                </View>
                <View style={[styles.column, styles.smallColumn]}>
                  <Text style={styles.tableHeaderText}>Units</Text>
                </View>
                <View style={[styles.column, styles.gradeColumn]}>
                  <Text style={styles.tableHeaderText}>Midterm</Text>
                </View>
                <View style={[styles.column, styles.gradeColumn]}>
                  <Text style={styles.tableHeaderText}>Final</Text>
                </View>
                <View style={[styles.column, styles.gradeColumn]}>
                  <Text style={styles.tableHeaderText}>Completion</Text>
                </View>
              </View>

              {/* Table Content */}
              <ScrollView style={styles.tableContent}>
                {grades.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    ]}
                  >
                    <View style={[styles.column, styles.subjectColumn]}>
                      <Text style={styles.subjectText}>
                        {item.offer.subject.description}
                      </Text>
                      <Text style={styles.subjectCode}>
                        {item.offer.subject.subject_no}
                      </Text>
                    </View>
                    <View style={[styles.column, styles.instructorColumn]}>
                      <Text style={styles.tableCell}>
                        {item.offer.staff.fullname}
                      </Text>
                    </View>
                    <View style={[styles.column, styles.smallColumn]}>
                      <Text style={styles.tableCell}>
                        {item.offer.subject.units}
                      </Text>
                    </View>
                    <View style={[styles.column, styles.gradeColumn]}>
                      <Text
                        style={[
                          styles.gradeCell,
                          item.grade.midterm
                            ? styles.gradePresent
                            : styles.gradeNA,
                        ]}
                      >
                        {item.grade.midterm || "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.column, styles.gradeColumn]}>
                      <Text
                        style={[
                          styles.gradeCell,
                          item.grade.final
                            ? styles.gradePresent
                            : styles.gradeNA,
                        ]}
                      >
                        {item.grade.final || "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.column, styles.gradeColumn]}>
                      <Text
                        style={[
                          styles.gradeCell,
                          item.grade.completion
                            ? styles.gradePresent
                            : styles.gradeNA,
                        ]}
                      >
                        {item.grade.completion || "N/A"}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </ScrollView>
      ) : (
        <View style={styles.noGradesContainer}>
          <Text style={styles.noGradesText}>
            {grades === null
              ? "Unable to load grades"
              : "No grades available for this semester"}
          </Text>
        </View>
      )}
      <Text style={styles.modalText}>
        This app is not authorized by VSU. I built this as my personal project
        for quick checking of my grades, providing a more convenient alternative
        to using the official website. Please use this app responsibly.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 10,
  },
  backText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#6C63FF", 
    marginLeft: 8,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  picker: {
    width: 150,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  tableWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
  },
  tableHeaderText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  column: {
    padding: 16,
    justifyContent: "center",
  },
  subjectColumn: {
    width: 240,
  },
  instructorColumn: {
    width: 200,
  },
  smallColumn: {
    width: 80,
    alignItems: "center",
  },
  gradeColumn: {
    width: 120,
    alignItems: "center",
  },
  tableContent: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    minHeight: 72,
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#F9FAFB",
  },
  subjectText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#6B7280",
  },
  tableCell: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  gradeCell: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  gradePresent: {
    backgroundColor: "#EFF6FF",
    color: "#1E40AF",
    borderRadius: 4,
  },
  gradeNA: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    borderRadius: 4,
  },
  noGradesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  noGradesText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default GradesTab;