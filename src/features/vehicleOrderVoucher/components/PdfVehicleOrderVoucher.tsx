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
// Register Amharic font
Font.register({
  family: "ethio",
  src: ethioFont,
});
// Base64 icons (12x12)
const phoneIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTE5IDE2Ljk5OGwtMi45OTktM2MtLjMzNC0uMzM0LS44MzMtLjQ5OS0xLjMxNi0uNDk5LS4zNzQgMC0uNzM5LjEwOS0xLjA0OC4zMzZsLTEuNjAxIDEuMTc3Yy0yLjYzOC0xLjUxNi00Ljc2NC0zLjY0My02LjI4MS02LjI4MWwxLjE3Ny0xLjYwMWMuMzQ2LS41LjM5NS0xLjEyNC4xMzItMS42NzhMMTQuOTk4IDUgMTYuOTk4IDNsMS4wMDEgMS4wMDJjLjQ2Ny40NjcuNzI5IDEuMDk0LjcyOSAxLjczMSAwIC40ODMtLjE2Ni45ODItLjUwMSAxLjMxNkwxNi45OTggOWMuMzM0LjMzNC41MDEuODI2LjUwMSAxLjMxNiAwIC40ODMtLjE2Ni45ODEtLjUwMSAxLjMxNmwtMi45OTkgM2MtLjMzNC4zMzQtLjgyNi41MDEtMS4zMTYuNTAxLS40ODMgMC0uOTgyLS4xNjYtMS4zMTYtLjUwMXoiLz48L3N2Zz4=";
const mailIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIgNGgyMGEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJIMmEyIDIgMCAwIDEtMi0ydi0xNGEyIDIgMCAwIDEgMi0yem0wIDJoMjB2MS4yN0wxMiAxMi45IDEyIDEwLjI3TDJtMCAwaDIwdi0xLjI3TDEyIDExLjkxTDIgNi4yM1oiLz48L3N2Zz4=";
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
        {companyData?.am_name ||
          "አበበ ኡቴኖ ሞኤንኮ ወኪል ዓመታዊ የተሸከርካሪ ምርመራ ጣቢያ እና ጋርዥ"}
      </Text>
      <Text>
        {companyData?.en_name ||
          "Abebe Uteno MOENCO Sub Dealer Annual Vehicle Inspection Center and Garage"}
      </Text>
    </View>
  </View>
);
// Footer component
const Footer = ({ companyData, data, isLastPage, totalItems }) => (
  <View style={styles.footer}>
    {totalItems <= 30 || isLastPage ? (
      <>
        <View
          style={{
            marginLeft: 10,
            marginRight: 10,
            marginTop: 100,
          }}
        >
          {totalItems <= 30 && (
            <Text style={styles.amharicFont}>
              ከላይ የተዘረዘሩ ስራዎችን በትክክል መጠናቀቃቸውን አይቼ መረከቤን በፊርማዬ አረጋግጣለሁ።
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: "3",
              marginBottom: "10",
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.amharicFont}>
                አስረካቢ ስምና ፈርማ: {data?.asrekabi_name || "N/A"}
              </Text>
              <Text style={styles.amharicFont}>ቀን____________</Text>
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.amharicFont}>
                ተረካቢ የሹፌር ስምና ፈርማ: {data?.terekabi_name || "N/A"}
              </Text>
              <Text style={styles.amharicFont}>ቀን____________</Text>
            </View>
          </View>
          {(totalItems <= 30 || isLastPage) && (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.amharicFont}>
                ደረጃውን በጠበቀ ዕቃ ተሽከርካሪዎችን በማስጥርገንና ተገቢዉን ዓመታዊ ምርመራ በወቅቱ በማደረግ
                የትራፊክ አደጋን በጋራ እንከላከል።
              </Text>
              <View
                style={{
                  height: 2, // Thickness of underline
                  backgroundColor: "black",
                  marginTop: 2,
                  width: "100%",
                }}
              />
            </View>
          )}
        </View>
      </>
    ) : (
      <View style={{ alignItems: "center" }}>
        <Text
          style={[
            styles.amharicFont,
            {
              textAlign: "center",
            },
          ]}
        >
          ደረጃውን በጠበቀ ዕቃ ተሽከርካሪዎችን በማስጥርገንና ተገቢዉን ዓመታዊ ምርመራ በወቅቱ በማደረግ የትራፊክ አደጋን
          በጋራ እንከላከል።
        </Text>

        {/* Custom underline */}
        <View
          style={{
            height: 2, // underline thickness
            backgroundColor: "black",
            marginTop: 2,
            width: "100%",
          }}
        />
      </View>
    )}
    <View>
      <View
        style={{
          flexDirection: "row",
          maxWidth: "50%",
          gap: 20,
          margin: "auto",
        }}
      >
        <Text style={{ fontSize: "10" }}>{companyData?.phone1}</Text>
        <Text style={{ fontSize: "10" }}>{companyData?.phone2}</Text>
        <Text style={{ fontSize: "10" }}>86</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          maxWidth: "50%",
          margin: "auto",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: "10", fontFamily: "ethio" }}>
          {companyData?.city}
        </Text>
        <Text style={{ fontSize: "10" }}>{companyData?.country}</Text>
      </View>
    </View>
  </View>
);
// Main PDF component
export const PdfVehicleOrderVoucher = async (data) => {
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
    // Calculate total pages: first page has 30 rows, subsequent pages have 40 rows
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
      const startIndex = page === 0 ? 0 : 30 + (page - 1) * 35; // First page starts at 0, second at 30, third at 70, etc.
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
                  <Text
                    style={[
                      styles.amharicFont,
                      { textDecoration: "underline" },
                    ]}
                  >
                    የተሽከርካሪ ሥራ ትዕዛዝ መቀበያ / Vehicle Order Voucher
                  </Text>
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
                      የባለ ንብረት ስም/Customer Name:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.customer_name || "N/A"}
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
                      ሻንሲ/Classis No:{" "}
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
                        {data?.vehicle_motor_kutir || "N/A"}
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
                      ሞተር/Eng No:{" "}
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
                      የግ/ክ/መ/ቁ/Tin No:{" "}
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
                      ታርጋ ቁጥር/Plate No:{" "}
                      <Text
                        style={[
                          styles.amharicFont,
                          { textDecoration: "underline" },
                        ]}
                      >
                        {data?.customer_tin_number || "N/A"}
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
                {/* Rows for the current page */}
                {pageItems.map((item, index) => (
                  <View style={styles.tableRow} key={startIndex + index}>
                    <View style={styles.tableColNo}>
                      <Text style={styles.tableCell}>
                        {startIndex + index + 1}
                      </Text>
                    </View>
                    <View style={styles.tableColName}>
                      <Text style={styles.tableCell}>{item.item_name}</Text>
                    </View>
                    <View style={styles.tableColQty}>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                    </View>
                    <View style={styles.tableColLast}>
                      <Text style={styles.tableCell}>{item.fixed_parts}</Text>
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
