import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  Image,
} from "@react-pdf/renderer";
import toast from "react-hot-toast";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import axios from "axios";
import {
  API_BASE_URL,
  IMAGE_BASE_URL,
  API_ENDPOINTS,
} from "@/utils/apiConfig.ts";
import ethioFont from "@/assets/ethioFont.ttf";

// Register Amharic font with explicit weight variants to avoid broken rendering
Font.register({
  family: "ethio",
  fonts: [
    { src: ethioFont, fontWeight: "normal" },
    { src: ethioFont, fontWeight: "bold" },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
  },
  header: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: "column",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "ethio",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  amharicFont: {
    fontFamily: "ethio",
    fontSize: 10,
    textAlign: "left",
  },
  table: {
    display: "table",
    width: "95%",
    borderWidth: 1,
    marginTop: 10,
    marginVertical: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCol1: {
    width: "8%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol2: {
    width: "35%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableColPartNumber: {
    width: "35%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "10%",
    padding: 2,
  },
  tableCellHeader: {
    fontSize: 10,
    fontFamily: "ethio",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    fontFamily: "ethio",
  },
});

// Header component
const Header = ({ companyData }) => (
  <View style={styles.header}>
    <Image
      style={{ width: 80, height: 60 }}
      source={{ uri: `${IMAGE_BASE_URL}${companyData?.logo}` }}
    />
    <View style={styles.headerTextContainer}>
      <Text style={{ fontSize: 10 }}>
        አበበ ኡቴኖ የሞኤንኮ ወኪል ሶዶ
      </Text>
      <Text>
        Abebe Uteno MOENCO Sub Dealer Sodo
      </Text>
      <Text>
        የመኪና መለዋወጫ ቀላልና ከባድ የአካልና የሞተር ጥገና ጋራዥ
      </Text>
      <Text style={styles.companyInfoPhone}>
      {companyData?.phone1} {" / "} {companyData?.phone2}
    </Text>
  </View>
  </View >
);

// Function to format date
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Function to generate and open the PDF in a new tab
export const openPurchasePdf = async (expenseId) => {
  try {

    const access_token = localStorage.getItem("token");
    const companyResponse = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.COMPANY}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const companyData = companyResponse.data[0];

    const expenseResponse = await axiosInstanceOld.get(
      `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`
    );
    const expenseData = expenseResponse.data;
    const products = expenseData?.products || [];
    const expenseDate = expenseData?.purchase_date;



    // Chunking logic
    const itemsPerFirstPage = 32;
    // Increased subsequent items count slightly since the header is removed on page 2+
    const itemsPerPage = 38;
    const itemChunks = [];
    if (products.length > 0) {
      itemChunks.push(products.slice(0, itemsPerFirstPage));
      const remainingItems = products.slice(itemsPerFirstPage);
      let currentChunk = [];
      remainingItems.forEach((item) => {
        currentChunk.push(item);
        if (currentChunk.length >= itemsPerPage) {
          itemChunks.push(currentChunk);
          currentChunk = [];
        }
      });
      if (currentChunk.length > 0) {
        itemChunks.push(currentChunk);
      }
    } else {
      itemChunks.push([]);
    }

    const MyDocument = (
      <Document>
        {itemChunks.map((chunk, chunkIndex) => (
          <Page key={chunkIndex} size="A4" style={styles.page}>
            {chunkIndex === 0 && <Header companyData={companyData} />}

            <View style={styles.section}>
              {chunkIndex === 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginRight: 19,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "ethio",
                          fontSize: 10,
                          textDecoration: "underline",
                        }}
                      >
                        ቀን: {formatDate(expenseDate)}
                      </Text>
                      <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                        Date
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 7,
                      fontWeight: "bold"
                    }}
                  >
                    <Text
                      style={[
                        styles.amharicFont,
                        { textDecoration: "underline" },
                      ]}
                    >
                      PURCHASE REQUEST
                    </Text>
                  </View>
                </>
              )}
              {/* Products table */}
              {/* Products table */}
              <View style={[styles.table, { marginTop: chunkIndex === 0 ? 10 : 0 }]}>
                {/* Table Header ONLY rendered on the first page */}
                {chunkIndex === 0 && (
                  <View style={styles.tableRow}>
                    <View style={styles.tableCol1}>
                      <Text style={styles.tableCellHeader}>ተ.ቁ</Text>
                      <Text style={styles.tableCellHeader}>No</Text>
                    </View>

                    <View style={styles.tableCol2}>
                      <Text style={styles.tableCellHeader}>የእቃው አይነት</Text>
                      <Text style={styles.tableCellHeader}>Product Name</Text>
                    </View>

                    <View style={styles.tableColPartNumber}>
                      <Text style={styles.tableCellHeader}>የክፍል ቁጥር</Text>
                      <Text style={styles.tableCellHeader}>Part Number</Text>
                    </View>

                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellHeader}>ብዛት</Text>
                      <Text style={styles.tableCellHeader}>Quantity</Text>
                    </View>
                  </View>
                )}

                {/* Table Rows */}
                {chunk.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <View style={styles.tableCol1}>
                      <Text style={[styles.tableCell, { fontSize: 10 }]}>
                        {index +
                          1 +
                          (chunkIndex > 0
                            ? itemsPerFirstPage +
                            (chunkIndex - 1) * itemsPerPage
                            : 0)}
                      </Text>
                    </View>
                    <View style={styles.tableCol2}>
                      <Text style={[styles.tableCell, { fontSize: 10 }]}>
                        {item.product_name}
                      </Text>
                    </View>
                    <View style={styles.tableColPartNumber}>
                      <Text style={[styles.tableCell, { fontSize: 10 }]}>
                        {item.part_number}
                      </Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={[styles.tableCell, { fontSize: 10 }]}>
                        {item.quantity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Page>
        ))}
      </Document>
    );

    const blob = await pdf(MyDocument).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
}; 