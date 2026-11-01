import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords.ts";
import { IMAGE_BASE_URL } from "@/utils/apiConfig.ts";

import RobotoRegular from "@/assets/roboto-regular-webfont.ttf";
import RobotoBold from "@/assets/roboto-bold-webfont.ttf";
import RobotoItalic from "@/assets/roboto-italic-webfont.ttf";
import ethioFont from "@/assets/ethioFont.ttf";
import FooterPdf from "./FotterPdf";

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
    // width:"199px",
    marginLeft: "30%",
    borderStyle: "solid",
    borderColor: "#000",
    marginTop: -7,
    borderTopWidth: 0,
    // borderWidth: 1
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
  receipt: {
    width: "80mm",
    fontSize: 8,
    fontFamily: "Roboto",
    border: "1px solid black",
    padding: 10,
  },
  headerText: {
    fontSize: 8,
  },
  headerBold: {
    fontSize: 8,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  itemHeader: {
    fontWeight: "bold",
    marginTop: 2,
  },
  dashedBorder: {
    borderTop: "1px dashed #000",
    margin: "4px 0",
  },
  footerText: {
    fontSize: 6,
    fontWeight: "bold",
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

export const MyDoc = ({
  order,
  products: _products,
  companyData,
  receiptData,
  orderFourDegit: _orderFourDegit,
}: any) => {
  const customer = receiptData?.customer;
  const hasReceipt = order?.receipt === "Receipt";
  const itemsPerFirstPage = hasReceipt ? 17 : 24;
  const itemsPerPage = 35;
  const itemChunks: any[] = [];
  if (order.items.length > 0) {
    itemChunks.push(order.items.slice(0, itemsPerFirstPage));
    const remainingItems = order.items.slice(itemsPerFirstPage);
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

  const showWatermark = order.vat !== "0.00" && order.payment_status?.toLowerCase() !== "pending";

  console.log(order)
  // console.log(receiptData)
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
                  {showWatermark && order.items.length <= 10 && <Watermark />}
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
                    ቀን: {formatDate(order.order_date)}
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Date
                  </Text>
                </View>
              </View>
              {/* {hasReceipt && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 2,
                    gap: 4,
                    marginRight: 31,
                  }}
                >
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>No:</Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      color: "red",
                      marginRight: 7,
                    }}
                  >
                    {orderFourDegit ? orderFourDegit : " "}
                  </Text>
                </View>
              )} */}
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
                  >{`ከ፦ ${companyData?.owner_am_name ?? ""}`}</Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    {`From፦ ${companyData?.owner_en_name ?? ""}`}
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
            {showWatermark && order.items.length > 10 && (
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
                  {/* New Column for Part Number */}
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
                        {item.product ?? "N/A"}
                      </Text>
                    </View>
                    {/* New Cell for Part Number */}
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>
                        {/* {item.part_number || item?.part_number || " "} */}
                        {item?.part_number && item.part_number !== "undefined" ? item.part_number : " "}
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
                        {formatCurrency(item.product_price)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.price)}
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
                      {convertToWordsWithCurrency(order.total_amount)}
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
                          {formatCurrency(order.sub_total)}{" "}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                      <View style={styles.summaryTableCol1}>
                        <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                      </View>
                      <View style={styles.summaryTableCol2}>
                        <Text style={styles.vatValue}>
                          {formatCurrency(order.vat)}
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
                          {formatCurrency(order.total_amount)}
                        </Text>
                      </View>
                    </View>
                    {order.payment_status?.toLowerCase() !== "paid" && (
                      <>
                        <View style={styles.summaryTableRow}>
                          <View style={styles.summaryTableCol1}>
                            <Text style={styles.summaryLabel}>የተከፈለ ሂሳብ</Text>
                            <Text style={styles.summaryLabel}>Paid Amount:</Text>
                          </View>
                          <View style={styles.summaryTableCol2}>
                            <Text style={styles.totalValue}>
                              {formatCurrency(order.paid_amount)}
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
                              {formatCurrency(order.unpaid_amount)}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </>
          )}p
          <FooterPdf fixed />
        </Page>
      ))}
    </Document>
  );
};

export const ReceiptPosPDF = ({ receiptData }: any) => {
  const { items, company, customer, order_details } = receiptData;
  const subTotal = order_details?.sub_total || 0;
  const taxAmount = order_details?.vat || 0;
  const totalAmount = order_details?.total_amount || 0;
  const hasNoReceipt = items.some((item: any) => item.receipt === "No Receipt");
  return (
    <Document>
      <Page size="A4" style={{ maxWidth: "80mm", fontSize: "8px" }}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyInfo}>Tin No: {company.tin_number}</Text>
          <Text style={styles.companyInfo}>Phone 1: {company.phone}</Text>
          <Text style={styles.companyInfo}>Phone 2: {company.phone}</Text>
          <Text style={styles.companyInfo}>
            City: {company.city}, {company.country}
          </Text>
        </View>
        <View style={styles.header1}>
          <Text style={styles.headerBold}>CASH INVOICE</Text>
          <Text style={styles.headerText}>CUSTOMER NAME: {customer.name}</Text>
          <Text style={styles.headerText}>
            BUYER TIN: {customer.tin_number}
          </Text>
        </View>
        <View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemHeader, { flex: 2, textAlign: "left" }]}>
              DESCRIPTION
            </Text>
            <Text
              style={[styles.itemHeader, { flex: 0.5, textAlign: "center" }]}
            >
              QTY
            </Text>
            <Text style={[styles.itemHeader, { flex: 1, textAlign: "right" }]}>
              PRICE
            </Text>
            <Text style={[styles.itemHeader, { flex: 1, textAlign: "right" }]}>
              AMOUNT
            </Text>
          </View>
          <View style={styles.dashedBorder} />
          {items.map((item: any, index) => (
            <View key={index} style={styles.itemRow}>
              <Text
                style={{
                  flex: 2,
                  textAlign: "left",
                  maxWidth: "38mm",
                }}
              >
                {item.product_name}
              </Text>
              <Text style={{ flex: 0.5, textAlign: "center" }}>
                {item.quantity}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  maxWidth: "22mm",
                }}
              >
                {formatCurrency(item.product_price)}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  maxWidth: "22mm",
                }}
              >
                {formatCurrency(item.price)}
              </Text>
            </View>
          ))}
          <View style={styles.dashedBorder} />
          <View style={styles.itemRow}>
            <Text style={{ textAlign: "left" }}>SUB TOTAL</Text>
            <Text style={{ textAlign: "right", fontWeight: "bold" }}>
              {formatCurrency(subTotal)}
            </Text>
          </View>
          {!hasNoReceipt && (
            <View style={styles.itemRow}>
              <Text style={{ textAlign: "left" }}>VAT (15.00%)</Text>
              <Text style={{ textAlign: "right" }}>
                {formatCurrency(taxAmount)}
              </Text>
            </View>
          )}
          <View style={styles.itemRow}>
            <Text style={{ textAlign: "left", fontWeight: "bold" }}>TOTAL</Text>
            <Text style={{ textAlign: "right", fontWeight: "bold" }}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered By Po'o Technologies</Text>
        </View>
      </Page>
    </Document>
  );
};

export const PDFModal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export const ReceiptPos = ({ receiptData }: any) => {
  return (
    <PDFViewer width="100%" height="600">
      <ReceiptPosPDF receiptData={receiptData} />
    </PDFViewer>
  );
};
