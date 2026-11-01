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
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords.ts";
import { IMAGE_BASE_URL, API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.ts";
import toast from "react-hot-toast";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import axios from "axios";
import RobotoRegular from "@/assets/roboto-regular-webfont.ttf";
import RobotoBold from "@/assets/roboto-bold-webfont.ttf";
import RobotoItalic from "@/assets/roboto-italic-webfont.ttf";
import ethioFont from "@/assets/ethioFont.ttf";
import FooterPdf from "@/features/order/components/FotterPdf";

// Register fonts for PDF
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
  header1: {
    marginTop: 5,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "5",
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
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
    justifyContent: "space-between",
    marginBottom: 3,
    paddingTop: 5,
    paddingRight: 5,
    paddingLeft: 5,
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
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 5,
    paddingRight: 5,
    paddingLeft: 5,
    paddingBottom: 5,
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
    width: "400",
  },
});

const Watermark = () => (
  <View style={styles.watermark}>
    <Text>ATTACHMENT</Text>
  </View>
);

const CustomerPurchaseDoc = ({ expenseData, companyData, customer }: any) => {
  console.log(customer)


  const paymentStatus = expenseData?.payment_status?.toLowerCase() == "pending"

  console.log(paymentStatus)


  const products = expenseData?.products || [];
  const expenseDate = expenseData?.credit_date;
  const itemsPerFirstPage = paymentStatus ? 16 : 20;
  const itemsPerPage = paymentStatus ? 30 : 35;
  const itemChunks: any[] = [];

  if (products.length > 0) {
    itemChunks.push(products.slice(0, itemsPerFirstPage));
    const remainingItems = products.slice(itemsPerFirstPage);
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

  const formatDate = (dateString: string) => {
    const options = { year: "numeric" as const, month: "numeric" as const, day: "numeric" as const };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showWatermark = expenseData.vat !== "0.00" && expenseData.payment_status?.toLowerCase() !== "pending";

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
        <Page
          key={chunkIndex}
          size="A4"
          style={{
            fontSize: "8px",
            paddingTop: chunkIndex > 0 ? 30 : 0,
            paddingBottom: 40
          }}
        >
          {chunkIndex === 0 && (
            <>
              <View
                style={[
                  styles.header,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginBottom: 0,
                    paddingBottom: 0
                  },
                ]}
              >
                <Image
                  style={{ width: 80, height: 50 }}
                  src={`${IMAGE_BASE_URL}${companyData?.logo}`}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                    marginTop: -10,
                  }}
                >
                  {showWatermark && products.length <= 10 && <Watermark />}
                  <Text
                    style={{
                      fontFamily: "ethio",
                      marginLeft: 6,
                      fontSize: 10,
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {companyData?.am_name}
                  </Text>
                  <Text style={styles.companyName}>
                    {companyData?.en_name || ""}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.companyInfoPhone}>
                      {companyData?.phone1} {" / "} {companyData?.phone2}
                    </Text>
                  </View>
                </View>
              </View>
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
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  {showWatermark ? "Attachment Cash Invoice" : "Credit Invoice"}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginTop: 10,
                  width: "100%",
                  gap: 4,
                  paddingLeft: 15,
                  paddingRight: 15,
                }}
              >
                <View style={{ width: "47%" }}>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      textDecoration: "underline",
                    }}
                  >{`ከ፦ ${companyData?.owner_am_name || "አበበ ኡቴኖ"}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    {`From፦ ${companyData?.owner_en_name || "Abebe Uteno"}`}
                  </Text>
                  <Text
                    style={{ fontFamily: "ethio", fontSize: 10 }}
                  >{`አድራሻ:- ${companyData?.region ?? ""} ዞን:-${companyData?.zone ?? ""
                    } ከተማ:-${companyData?.city ?? ""} ክ/ከተማ:- ${companyData?.sub_city ?? ""
                    }`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Addr.Reg Zone City Subcity
                  </Text>
                  <Text
                    style={{ fontFamily: "ethio", fontSize: 10 }}
                  >{`የታክስ መለያ ቁጥር፦ ${companyData?.tin_number ?? ""}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Supplier tin No
                  </Text>
                  <Text
                    style={{ fontFamily: "ethio", fontSize: 10 }}
                  >{`የሻጭ ተ.አ.ታ.ቁ፦ ${companyData?.vat_number ?? ""}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Supplier Vat No
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    የተመዘገበበት ቀን ___________
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Date of Reg
                  </Text>
                </View>
                <View>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>{`ለ፦ ${customer?.organization ?? ""
                    }`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    To
                  </Text>
                  <Text
                    style={{ fontFamily: "ethio", fontSize: 10 }}
                  >{`የተ.አ.ታ.ቁ፦ ${customer?.vat_number ?? ""}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Customer Vat No
                  </Text>
                  <Text
                    style={{ fontFamily: "ethio", fontSize: 10 }}
                  >{`የግብር ከፋይ ታክስ መ/ቁ፦ ${customer?.tin_number ?? ""}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Customer Tin No
                  </Text>
                  <Text
                    style={{ fontFamily: "ethio", fontSize: 10 }}
                  >{`የፊዝካል ደ.ቁ፦ ${customer?.customer_fs ?? ""}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Fs No
                  </Text>
                </View>
              </View>
            </>
          )}
          <View style={styles.tableContainer}>
            {showWatermark && products.length > 10 && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "20%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.3,
                  fontSize: 50,
                  color: "#aaaaaa",
                  fontWeight: "bold",
                  zIndex: -1,
                  width: "400",
                }}
              >
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

              {chunk.map((item, index) => {
                return (
                  <View key={index} style={[styles.tableRow]}>
                    <View style={styles.tableCol1}>
                      <Text style={styles.tableCell}>
                        {index +
                          1 +
                          (chunkIndex > 0
                            ? itemsPerFirstPage +
                            (chunkIndex - 1) * itemsPerPage
                            : 0)}
                      </Text>
                    </View>
                    <View style={styles.tableCol2}>
                      <Text style={styles.tableCell}>
                        {item.product_name ?? "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>
                        {item.part_number || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{item.unit}</Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.unit_price)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.quantity * item.unit_price)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          {chunkIndex === itemChunks.length - 1 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 10,
                  maxWidth: "98.3%",
                  alignContent: "flex-start"
                }}
              >
                <View style={{ gap: 5 }}>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      marginLeft: 10,
                      maxWidth: 240
                    }}
                  >
                    Amount in Words:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {" "}
                      {convertToWordsWithCurrency(expenseData.total)}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    Other memo or reason for refund____________
                  </Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    Buyer's signture______ Seller's signture______
                  </Text>
                </View>
                <View style={styles.summaryTable}>
                  <View style={styles.summarySection}>
                    <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                      <View style={styles.summaryTableCol1}>
                        <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                      </View>
                      <View style={styles.summaryTableCol2}>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(expenseData.sub_total || expenseData.total)}{" "}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                      <View style={styles.summaryTableCol1}>
                        <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                      </View>
                      <View style={styles.summaryTableCol2}>
                        <Text style={styles.vatValue}>
                          {formatCurrency(expenseData.vat || 0)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.summaryTableRow}>
                      <View style={styles.summaryTableCol1}>
                        <Text style={styles.summaryLabel}>ጠቅላላ ዋጋ ተእታ ጨምሮ</Text>
                        <Text style={styles.summaryLabel}>Selling Price(Inc.VAT):</Text>
                      </View>
                      <View style={styles.summaryTableCol2}>
                        <Text style={styles.totalValue}>
                          {formatCurrency(expenseData.total)}
                        </Text>
                      </View>
                    </View>
                    {expenseData.payment_status?.toLowerCase() !== "paid" && (
                      <>
                        <View style={styles.summaryTableRow}>
                          <View style={styles.summaryTableCol1}>
                            <Text style={styles.summaryLabel}>የተከፈለ ሂሳብ</Text>
                            <Text style={styles.summaryLabel}>Paid Amount:</Text>
                          </View>
                          <View style={styles.summaryTableCol2}>
                            <Text style={styles.totalValue}>
                              {formatCurrency(expenseData.paid_amount)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.summaryTableRow}>
                          <View style={styles.summaryTableCol1}>
                            <Text style={styles.summaryLabel}>ቀሪ ሂሳብ</Text>
                            <Text style={styles.summaryLabel}>Remaning Amount:</Text>
                          </View>
                          <View style={styles.summaryTableCol2}>
                            <Text style={styles.totalValue}>
                              {formatCurrency(expenseData.unpaid_amount)}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </>
          )}
          <FooterPdf fixed />
        </Page>
      ))}
    </Document>
  );
};

// Function to generate and open the PDF in a new tab with customer data
export const openCustomerPurchasePdf = async (expenseId, customerParam) => {
  try {
    // Fetch receipt data from new endpoint
    const receiptResponse = await axiosInstanceOld.get(
      `${API_ENDPOINTS.CREDIT_CREDITS}${expenseId}/receipt/`
    );
    const receiptData = receiptResponse.data;

    // Map company data from receipt
    const phones = (receiptData.company.phone?.split(/[\/\s,]+/) || []).filter(p => p.trim());
    const companyData = {
      ...receiptData.company,
      phone1: phones[0] || "",
      phone2: phones[1] || "",
      owner_am_name: "",
      owner_en_name: "",
    };

    // Map customer data from receipt
    const customer = {
      ...receiptData.customer,
      customer_fs: "",
    };

    // Map expense/credit data from receipt
    const expenseData = {
      ...receiptData.credit_details,
      credit_date: receiptData.credit_details.date,
      total: receiptData.credit_details.total_amount,
      sub_total: receiptData.credit_details.sub_total,
      vat: receiptData.credit_details.vat,
      payment_status: receiptData.credit_details.payment_status,
      paid_amount: receiptData.credit_details.paid_amount,
      unpaid_amount: receiptData.credit_details.unpaid_amount,
      products: receiptData.items,
    };

    const MyDocument = (
      <CustomerPurchaseDoc
        expenseData={expenseData}
        companyData={companyData}
        customer={customer}
      />
    );

    const blob = await pdf(MyDocument).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
};
