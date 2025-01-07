import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const PaymentsPage = () => {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // State for year and period
  const [year, setYear] = useState("2024");
  const [period, setPeriod] = useState("1");

  useEffect(() => {
    fetchPayments();
  }, [year, period]);

  const fetchPayments = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (!parsedUser?.token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `https://c1-student.vsu.edu.ph/api/payments?status=1&stud_id=23-1-00761&sy_period=${period}&sy_year=${year}`,
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
      const paymentsData = JSON.parse(responseText);

      if (!paymentsData || !Array.isArray(paymentsData.transactions)) {
        throw new Error("Invalid payments data structure");
      }

      setPayments(paymentsData);
      setError(null);
    } catch (error) {
      console.error("Error details:", error);
      let errorMessage = "Failed to load payments. ";

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading payments...</Text>
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

  // Calculate total fees, payments, and balance dynamically
  const totalFees = 6636.0; // Replace with dynamic calculation if available
  const totalPayments = payments.transactions.reduce(
    (sum, transaction) =>
      sum + transaction.or_details.reduce((acc, detail) => acc + detail.amount, 0),
    0
  );
  const balance = totalFees - totalPayments;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#6C63FF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSubtitle}>Main Campus</Text>
        <Text style={styles.headerSubtitle}>
          SY {year} - {parseInt(year) + 1} / {period === "1" ? "First" : "Second"} Semester
        </Text>
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

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>SUMMARY</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>FEES</Text>
          <Text style={styles.summaryLabel}>PAYMENTS</Text>
          <Text style={styles.summaryLabel}>BALANCE</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>₱ {totalFees.toFixed(2)}</Text>
          <Text style={styles.summaryValue}>₱ {totalPayments.toFixed(2)}</Text>
          <Text style={styles.summaryValue}>₱ {balance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payments History */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>PAYMENTS HISTORY</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>OR NO</Text>
          <Text style={styles.tableHeaderText}>PARTICULAR</Text>
          <Text style={styles.tableHeaderText}>FEE</Text>
          <Text style={styles.tableHeaderText}>DATE</Text>
        </View>
        {payments.transactions.map((transaction, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{transaction.or_number}</Text>
            <Text style={styles.tableCell}>
              {transaction.or_details[0].account.description}
            </Text>
            <Text style={styles.tableCell}>
              {transaction.or_details[0].amount_formatted}
            </Text>
            <Text style={styles.tableCell}>
              {new Date(transaction.or_date).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Accounts Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Accounts</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>PARTICULAR</Text>
          <Text style={styles.tableHeaderText}>FEE</Text>
        </View>
        {payments.transactions.map((transaction, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>
              {transaction.or_details[0].account.description}
            </Text>
            <Text style={styles.tableCell}>
              {transaction.or_details[0].amount_formatted}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          This app is not authorized by VSU. I built this as my personal project
          for quick checking of my grades, providing a more convenient alternative
          to using the official website. Please use this app responsibly.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1F2937",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingBottom: 8,
    marginTop: 10,
  },
  backText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#6C63FF",
    marginLeft: 8,
  },
  picker: {
    width: 150,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#1F2937",
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tableHeaderText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1F2937",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tableCell: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  footerContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#EF4444",
  },
});

export default PaymentsPage;