import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  IMAGE_BASE_URL,
} from "@/utils/apiConfig.ts";
import ethioFont from "@/assets/ethioFont.ttf";

// Register Amharic font
Font.register({
  family: "ethio",
  src: ethioFont,
});

const Header = () => {
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const access_token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.COMPANY}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        const data = response.data[0];
        setCompanyData(data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  console.log(companyData);

  return (
    <View style={styles.header}>
      {companyData?.logo && (
        <Image
          style={styles.logo}
          src={`${IMAGE_BASE_URL}${companyData.logo}`}
        />
      )}
      <View style={styles.headerTextContainer}>
        <Text style={styles.amName}>
          {companyData?.am_name || "የአካባቢ የአውቶሞቪል አባላት ክፍል"}
        </Text>
        <Text style={styles.enName}>
          {companyData?.en_name || "Local Vehicle Owners Section"}
        </Text>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  logo: {
    width: 80,
    height: 60,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  amName: {
    fontSize: 12,
    fontFamily: "ethio",
    fontWeight: "bold",
  },
  enName: {
    fontSize: 10,
    fontFamily: "ethio",
  },
});
