import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Font,
  Image,
} from "@react-pdf/renderer";
import ethioFont from "@/assets/ethioFont.ttf";
import RobotoRegular from "@/assets/roboto-regular-webfont.ttf";
import RobotoBold from "@/assets/roboto-bold-webfont.ttf";
import RobotoItalic from "@/assets/roboto-italic-webfont.ttf";
import { IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import FooterPdf from "@/features/order/components/FotterPdf";

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
});
Font.register({
  family: "ethio",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "450px",
    marginLeft: 6,
  },
  companyInfo: {
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyInfoPhone: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 6,
  },
  documentTitleTax: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "ethio",
    marginTop: 10,
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#000",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginTop: 3,
    marginVertical: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
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
    width: "25%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableColNew: {
    width: "25%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol3: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol5: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol6: {
    width: "20%",
    padding: 2,
  },
  serviceTitleRow: {
    width: "100%",
    minHeight: 25,
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#eeeeee",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerCellContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCellNumber: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "ethio",
  },
  headerCellLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 10.7,
    color: "#000",
    borderStyle: "solid",
    fontFamily: "ethio",
  },
  tableCellRight: {
    fontSize: 10.7,
    color: "#000",
    borderStyle: "solid",
    textAlign: "right",
  },
  summaryTable: {
    width: "34.1%",
    marginLeft: "30%",
    borderStyle: "solid",
    borderColor: "#000",
    marginTop: -7,
    borderTopWidth: 0,
  },
  summaryTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    alignItems: "center",
  },
  summaryTableCol1: {
    width: "60%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },
  summaryTableCol2: {
    width: "40%",
    padding: 2,
  },
  summarySection: {
    breakBefore: "auto",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#000",
    fontFamily: "ethio",
  },
  summaryValue: {
    fontSize: 10,
    color: "#000",
    fontWeight: "bold",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right",
  },
  vatValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right",
  },
  vatLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  amountInWords: {
    fontSize: 10,
    marginTop: 10,
    fontStyle: "italic",
    color: "#000",
  },
  validitySection: {
    marginTop: 20,
    fontSize: 10,
    color: "#000",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    width: 150,
    marginTop: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    color: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#000",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  watermark: {
    position: "absolute",
    top: "800%",
    left: "10%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.3,
    fontSize: 50,
    color: "#9ca3af",
    fontWeight: "bold",
    zIndex: -1,
    whiteSpace: "nowrap",
    width: "400",
  },
  image: {
    width: 80,
    height: 60,
  },
});

const Watermark = () => (
  <View style={styles.watermark}>
    <Text>ATTACHMENT</Text>
  </View>
);

const JobcardReceiptPDF = ({
  company,
  customer,
  vehicle,
  jobcard_details,
  assignments,
  part_request,
  totals,
}) => {

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const showWatermark = totals?.vat !== "0.00" && totals?.payment_status?.toLowerCase() !== "pending";
  const items = part_request?.items ?? [];
  const paymentStatus = totals?.payment_status?.toLowerCase() === "pending";
  const itemsPerFirstPage = paymentStatus ? 14 : 24;
  const itemsPerPage = paymentStatus ? 28 : 35;
  const itemChunks: any[] = [];

  if (items.length > 0) {
    itemChunks.push(items.slice(0, itemsPerFirstPage));
    const remainingItems = items.slice(itemsPerFirstPage);
    let currentChunk: any[] = [];
    remainingItems.forEach((item: any) => {
      currentChunk.push(item);
      if (currentChunk.length >= itemsPerPage) {
        itemChunks.push(currentChunk);
        currentChunk = [];
      }
    });
    if (currentChunk.length > 0) {
      itemChunks.push(currentChunk);
    }
  }

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
      <Page
        key={chunkIndex}
        size="A4"
        style={{
          ...styles.page,
          fontSize: "8px",
          paddingTop: chunkIndex > 0 ? 30 : 0,
          paddingBottom: 40,
        }}
      >
        {chunkIndex === 0 && (
        <>
        {/* Header */}
        <View style={[styles.header, { flexDirection: "row", alignItems: "center", paddingLeft: 10, paddingRight: 10, marginBottom: 0, paddingBottom: 0 }]}>
          <Image style={{ width: 80, height: 50 }} src={`${IMAGE_BASE_URL}${company?.logo}`} />
          <View style={{ flexDirection: "column", alignItems: "flex-start", width: "80%", marginTop: -10 }}>
            {showWatermark && items.length <= 10 && <Watermark />}
            <Text style={{ fontFamily: "ethio", marginLeft: 6, fontSize: 10, fontWeight: "bold", color: "#000" }}>
              {company?.am_name}
            </Text>
            <Text style={styles.companyName}>{company?.en_name || ""}</Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.companyInfoPhone}>
                {company?.phone1} {" / "} {company?.phone2}
              </Text>
            </View>
          </View>
        </View>

        {/* Date */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginRight: 19 }}>
          <View style={{ flexDirection: "column", justifyContent: "flex-end", gap: 1 }}>
            <Text style={{ fontFamily: "ethio", fontSize: 10, textDecoration: "underline" }}>
              ቀን: {formatDate(jobcard_details?.service_date)}
            </Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Date</Text>
          </View>
        </View>

        {/* Document Title */}
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Text style={{ textAlign: "center", fontSize: 13, fontWeight: "bold", textDecoration: "underline" }}>
            {showWatermark ? "Attachment Cash Invoice" : totals?.payment_status?.toLowerCase() === "pending" ? "Credit Invoice" : "Cash Invoice"}
          </Text>
        </View>

        {/* Company and Customer Info */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, width: "100%", gap: 4, paddingLeft: 15, paddingRight: 15 }}>
          <View style={{ width: "47%" }}>
            <Text style={{ fontFamily: "ethio", fontSize: 10, textDecoration: "underline" }}>
              ከ፦ {company?.owner_am_name ?? "አቶ አበበ ኡቴኖ"}
            </Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>From፦ {company?.owner_en_name ?? ""}</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
              አድራሻ:- {company?.region ?? ""} ዞን:- {company?.zone ?? ""} ከተማ:- {company?.city ?? ""} ክ/ከተማ:- {company?.sub_city ?? ""}
            </Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Addr.Reg Zone City Subcity</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>የታክስ መለያ ቁጥር፦ {company?.tin_number ?? ""}</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Supplier tin No</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>የሻጭ ተ.አ.ታ.ቁ፦ {company?.vat_number ?? ""}</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Supplier Vat No</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>የተመዘገበበት ቀን ___________</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Date of Reg</Text>
          </View>
          <View>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>ለ፦ {customer?.organization_name ?? ""}</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>To</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>የተ.አ.ታ.ቁ፦ {customer?.vat_number ?? ""}</Text>
            {/* <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Customer Vat No</Text> */}
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>የግብር ከፋይ ታክስ መ/ቁ፦ {customer?.customer_tin ?? ""}</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Customer Tin No</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>የፊዝካል ደ.ቁ፦ {customer?.customer_fs ?? ""}</Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10 }}>Fs No</Text>
          </View>
        </View>

        </>
        )}

        {/* Items Table */}
        <View style={styles.tableContainer}>
          {showWatermark && items.length > 10 && (
            <View style={{ position: "absolute", top: "50%", left: "20%", transform: "translate(-50%, -50%) rotate(-45deg)", opacity: 0.3, fontSize: 50, color: "#9ca3af", fontWeight: "bold", zIndex: -1, whiteSpace: "nowrap", width: "400" }}>
              <Text>ATTACHMENT</Text>
            </View>
          )}
          <View style={styles.table}>
            {chunkIndex === 0 && (
            <View style={styles.tableHeader}>
              <View style={styles.tableCol1}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>ተ.ቁ</Text>
                  <Text style={styles.headerCellLabel}>No</Text>
                </View>
              </View>
              <View style={styles.tableCol2}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>የእቃው አይነት</Text>
                  <Text style={styles.headerCellLabel}>Description</Text>
                </View>
              </View>
              <View style={styles.tableColNew}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>የክፍል ቁጥር</Text>
                  <Text style={styles.headerCellLabel}>Part Number</Text>
                </View>
              </View>
              <View style={styles.tableCol3}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>መለኪያ</Text>
                  <Text style={styles.headerCellLabel}>Unit</Text>
                </View>
              </View>
              <View style={styles.tableCol3}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>ብዛት</Text>
                  <Text style={styles.headerCellLabel}>Quantity</Text>
                </View>
              </View>
              <View style={styles.tableCol5}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>የአንድ ዋጋ</Text>
                  <Text style={styles.headerCellLabel}>Unit Price</Text>
                </View>
              </View>
              <View style={styles.tableCol6}>
                <View style={styles.headerCellContent}>
                  <Text style={styles.headerCellNumber}>ጠቅላላ ዋጋ</Text>
                  <Text style={styles.headerCellLabel}>Total Price</Text>
                </View>
              </View>
            </View>
            )}
            {chunk.map((item, index) => (

              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol1}>
                  <Text style={styles.tableCell}>{index + 1 + (chunkIndex > 0 ? itemsPerFirstPage + (chunkIndex - 1) * itemsPerPage : 0)}</Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.tableCell}>
                    {item.product_name ?? "N/A"}
                  </Text>
                </View>
                <View style={styles.tableColNew}>
                  <Text style={styles.tableCell}>{item.part_number ?? "N/A"}</Text>
                </View>
                <View style={styles.tableCol3}>
                  <Text style={styles.tableCell}>-</Text>
                </View>
                <View style={styles.tableCol3}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.tableCol4}>
                  <Text style={styles.tableCellRight}>
                    {formatCurrency(item.unit_price ?? 0)}
                  </Text>
                </View>
                <View style={styles.tableCol5}>
                  <Text style={styles.tableCellRight}>
                    {formatCurrency(item.price ?? (item.unit_price ?? 0) * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}
            {chunkIndex === itemChunks.length - 1 && (
              <View style={styles.tableRow}>
                <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", padding: 2 }}>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    የአገልግሎት ክፍያ
                  </Text>
                  <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
                    {formatCurrency((totals?.service_packages_total > 0
                      ? totals?.service_packages_total
                      : totals?.services_total
                    ) ?? 0)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {chunkIndex === itemChunks.length - 1 && (
        <>
        {/* Summary Section */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, maxWidth: "98.3%", alignContent: "flex-start" }}>
          <View style={{ gap: 5 }}>
            <Text style={{ fontFamily: "ethio", fontSize: 10, marginLeft: 10, maxWidth: 240 }}>
              Amount in Words: <Text style={{ fontWeight: "bold" }}> {convertToWordsWithCurrency(totals?.total_amount)}</Text>
            </Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10, marginTop: 2, marginLeft: 10 }}>
              የክፍያ ሁኔታ  በካሽ   በቼክ     ቼክ ቁጥር
            </Text>
            <Text style={{ fontFamily: "ethio", fontSize: 10, marginTop: 2, marginLeft: 10 }}>
              Cash of Payment Cash [ ]  Check [ ] Check No
            </Text>
          </View>

          <View style={styles.summaryTable}>
            <View style={styles.summarySection}>
              <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                <View style={styles.summaryTableCol1}>
                  <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                </View>
                <View style={styles.summaryTableCol2}>
                  <Text style={styles.summaryValue}>{formatCurrency(totals?.combined_subtotal ?? 0)}</Text>
                </View>
              </View>
              {showWatermark && (
                <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                  <View style={styles.summaryTableCol1}>
                    <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                  </View>
                  <View style={styles.summaryTableCol2}>
                    <Text style={styles.vatValue}>{formatCurrency(totals?.vat ?? 0)}</Text>
                  </View>
                </View>
              )}
              {showWatermark && (
                <View style={styles.summaryTableRow}>
                  <View style={styles.summaryTableCol1}>
                    <Text style={styles.summaryLabel}>ጠቅላላ ዋጋ ተ.እ.ታ ጨምሮ</Text>
                    <Text style={styles.summaryLabel}>Selling Price(Inc.VAT):</Text>
                  </View>
                  <View style={styles.summaryTableCol2}>
                    <Text style={styles.totalValue}>{formatCurrency(totals?.total_amount ?? 0)}</Text>
                  </View>
                </View>
              )}
              {totals?.payment_status?.toLowerCase() !== "paid" && (
                <>
                  <View style={styles.summaryTableRow}>
                    <View style={styles.summaryTableCol1}>
                      <Text style={styles.summaryLabel}>የተከፈለ ሂሳብ</Text>
                      <Text style={styles.summaryLabel}>Paid Amount:</Text>
                    </View>
                    <View style={styles.summaryTableCol2}>
                      <Text style={styles.totalValue}>
                        {formatCurrency(totals?.paid_amount ?? 0)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.summaryTableRow}>
                    <View style={styles.summaryTableCol1}>
                      <Text style={styles.summaryLabel}>ቀሪ ሂሳብ</Text>
                      <Text style={styles.summaryLabel}>Remaining Amount:</Text>
                    </View>
                    <View style={styles.summaryTableCol2}>
                      <Text style={styles.totalValue}>
                        {formatCurrency(totals?.unpaid_amount ?? 0)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", marginLeft: 10, marginTop: -5 }}>
          <Text style={styles.summaryLabel}>የገንዘብ ተቀባይ ፊርማ:___________</Text>
          <Text style={styles.summaryLabel}>Received by Sign.</Text>
        </View>
        </>
        )}
        {/* Footer */}
        {/* <View>
          <Text>Powered By Po'o Technologies</Text>
        </View> */}

        <FooterPdf fixed />
      </Page>
      ))}
    </Document>
  );
};

export default JobcardReceiptPDF;
