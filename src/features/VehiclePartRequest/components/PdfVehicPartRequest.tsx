import {
  Document,
  Font,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import ethioFont from "@/assets/ethioFont.ttf";
import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  IMAGE_BASE_URL,
} from "@/utils/apiConfig.ts";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp.ts";
import FooterPdf from "@/features/order/components/FotterPdf";
// Register Amharic font
Font.register({
  family: "ethio",
  src: ethioFont,
});
// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    position: "relative",
    paddingBottom: 120, // Space for footer
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
  },
  headerTextContainer: {
    flexDirection: "column",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "ethio",
  },
  section: {
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 5,
  },
  amharicFont: {
    fontFamily: "ethio",
    fontSize: 10,
    textAlign: "left",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  // --- Header Columns ---
  tableColHeaderNo: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColHeaderName: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColHeaderQty: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColHeaderLast: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  // --- Body Columns ---
  tableColNo: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColName: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColQty: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColLast: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  // --- Cells ---
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "ethio",
    textAlign: "left",
    paddingLeft: 2,
  },
  tableCell: {
    fontSize: 10,
    textAlign: "left",
    paddingLeft: 2,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    fontSize: 9,
  },
});
// Header component
const Header = ({ companyData }) => (
  <View style={styles.header}>
    <Image
      style={{ width: 80, height: 60 }}
      src={`${IMAGE_BASE_URL}${companyData?.logo}`}
    />
    <View style={styles.headerTextContainer}>
      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
        {companyData?.am_name || "የአካባቢ የአውቶሞቪል አባላት ክፍል"}
      </Text>
      <Text>{companyData?.en_name || "Local Vehicle Owners Section"}</Text>
    </View>
  </View>
);
// Footer component
const Footer = ({ companyData, data, isLastPage, totalItems }) => (
  <View style={styles.footer}>
    {totalItems <= 30 || isLastPage ? (
      <>
        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 100 }}>
          {/* Always show the Amharic text if the outer condition is true */}
          {/* <Text style={styles.amharicFont}>
            ከላይ የተዘረዘሩ ስራዎችን በትክክል መጠናቀቃቸውን አይቼ መረከቤን በፊርማዬ አረጋግጣለሁ።
          </Text> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: "3",
              marginBottom: "50",
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.amharicFont}>
                አስረካቢ ስም እና ፈርማ፦{" "}
                <Text style={[styles.amharicFont, { textDecoration: "underline" }]}>
                  {data?.asrekabi_name}
                </Text>
              </Text>
              <Text style={styles.amharicFont}>ቀን____________</Text>
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.amharicFont}>
                ተረካቢ ስምና ፈርማ፦{" "}
                <Text style={[styles.amharicFont, { textDecoration: "underline" }]}>
                  {data?.terekabi_name}
                </Text>
              </Text>
              <Text style={styles.amharicFont}>ቀን____________</Text>
            </View>
          </View>
          <View style={{ marginBottom: 10, marginTop: 5 }}>
            {/* Empty View for spacing */}
          </View>
        </View>
        <View style={{ marginTop: "30", backgroundColor: "red" }}>
          <FooterPdf fixed />
        </View>
      </>
    ) : (
      <View style={{ marginTop: "30", backgroundColor: "red" }}>
        {/* Empty View for spacing */}
        <FooterPdf fixed />
      </View>
    )}
  </View>
);
// Main PDF component
export const PdfVehicPartRequest = async (data) => {
  let companyData = null;
  try {
    const access_token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.COMPANY}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    companyData = response.data[0];
  } catch (error) {
    console.error("Error fetching company data:", error);
  }
  try {
    const items = data?.items || [];
    const totalPages = Math.ceil((items.length - 30) / 35) + 1;
    const renderPage = (content, pageNumber, isLastPage) => (
      <Page size="A4" style={styles.page}>
        {content}
        <Footer
          companyData={companyData}
          data={data}
          isLastPage={isLastPage}
          totalItems={items.length}
        />
      </Page>
    );
    const pages = [];
    for (let page = 0; page < totalPages; page++) {
      const startIndex = page === 0 ? 0 : 30 + (page - 1) * 35;
      const rowsPerPage = page === 0 ? 30 : 35;
      const endIndex = startIndex + rowsPerPage;
      const pageItems = items.slice(startIndex, endIndex);
      const isFirstPage = page === 0;
      const isLastPage = page === totalPages - 1;
      const currentPageNumber = page + 1;
      pages.push(
        renderPage(
          <>
            {isFirstPage && <Header companyData={companyData} />}
            {isFirstPage && (
              <View style={styles.section}>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 5,
                  }}
                >
                  <Text style={[styles.amharicFont]}>
                    የዕቃ ወጪ ማዘዣና ተሽከርካሪ ላይ የሚቀየሩ ዕቃዎች
                  </Text>
                  {/* <Text>
                    Bill of lading and items to be changed on the vehicle
                  </Text> */}
                </View>
                <View>
                  <View
                    style={[
                      styles.amharicFont,
                      { flexDirection: "row", justifyContent: "space-between" },
                    ]}
                  >
                    <Text>
                      ሞዴል/Model:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.vehicle_model || "N/A"}
                      </Text>
                    </Text>
                    <Text>
                      የሚገጥም የመካኒክ ስም/Mechanic Name:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.terekabi_name || "N/A"}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.amharicFont,
                      { flexDirection: "row", justifyContent: "space-between" },
                    ]}
                  >
                    <Text>
                      ሻንሲ ቁጥር/Classis No:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.vehicle_shanci_kutir || "N/A"}
                      </Text>
                    </Text>
                    <Text>
                      ስልክ/Phone No:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.customer_phone || "N/A"}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.amharicFont,
                      { flexDirection: "row", justifyContent: "space-between" },
                    ]}
                  >
                    <Text>
                      ሞተር ቁጥር/Eng No:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.vehicle_motor_kutir || "N/A"}
                      </Text>
                    </Text>
                    <Text>
                      ቲን ቁጥር/Tin No:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.customer_tin_number || "N/A"}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.amharicFont,
                      { flexDirection: "row", justifyContent: "space-between" },
                    ]}
                  >
                    <Text>
                      ታርጋ ቁጥር/Plate No:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.vehicle_targa_kutir || "N/A"}
                      </Text>
                    </Text>
                    <Text>
                      ቀን/Date:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {formatDateTypeStamp(data?.ken) || "N/A"}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View
              style={[
                styles.section,
                currentPageNumber > 1 && { marginTop: 10 },
              ]}
            >
              <View style={styles.table}>
                {/* Header Row */}
                <View style={styles.tableRow}>
                  <View style={styles.tableColHeaderNo}>
                    <Text style={styles.tableCellHeader}>ተ.ቁ</Text>
                  </View>
                  <View style={styles.tableColHeaderName}>
                    <Text style={styles.tableCellHeader}>የሚቀየሩ ዕቃ ዝርዝር</Text>
                  </View>
                  <View style={styles.tableColHeaderQty}>
                    <Text style={styles.tableCellHeader}>ብዛታ</Text>
                  </View>
                  <View style={styles.tableColHeaderLast}>
                    <Text style={styles.tableCellHeader}>የሚጠገኑ ዕቃ ዝርዝር</Text>
                  </View>
                </View>
                {/* Body Rows */}
                {pageItems.map((item, index) => (
                  <View style={styles.tableRow} key={startIndex + index}>
                    <View style={styles.tableColNo}>
                      <Text style={styles.tableCell}>
                        {startIndex + index + 1}
                      </Text>
                    </View>
                    <View style={styles.tableColName}>
                      <Text style={styles.tableCell}>{item.item_name} - {item.item_part_number}</Text>
                    </View>
                    <View style={styles.tableColQty}>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                    </View>
                    <View style={styles.tableColLast}>
                      <Text style={styles.tableCell}></Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>,
          currentPageNumber,
          isLastPage
        )
      );
    }
    const MyDocument = <Document>{pages}</Document>;
    const blob = await pdf(MyDocument).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }
};
