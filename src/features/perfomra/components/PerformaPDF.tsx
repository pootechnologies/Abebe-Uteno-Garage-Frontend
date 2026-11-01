import React from "react";
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
import {
  formatCurrency,
  calculateSubtotal,
  calculateVAT,
  calculateTotal,
} from "@/utils/performaUtils";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import ethioFont from "@/assets/ethioFont.ttf";
import RobotoRegular from "@/assets/roboto-regular-webfont.ttf";
import RobotoBold from "@/assets/roboto-bold-webfont.ttf";
import RobotoItalic from "@/assets/roboto-italic-webfont.ttf";
import { IMAGE_BASE_URL } from "@/utils/apiConfig";
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
Font.register({ family: "ethio", src: ethioFont });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "340px",
    marginLeft: 6,
  },
  companyInfo: {
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyInfoPhone: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 7,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1f2937",
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 12,
    marginBottom: 3,
    fontFamily: "ethio",
  },
  customerNameEthio: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
    fontFamily: "ethio",
    textDecoration: "underline",
  },
  date: {
    fontSize: 10,
    color: "#4b5563",
    alignSelf: "flex-end",
    marginBottom: 5,
    fontFamily: "ethio",
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  table: {
    display: "table",
    width: "95%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginTop: 10,
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
  tableColPartNumber: {
    width: "25%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol3: {
    width: "8%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "10%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol5: {
    width: "15%",
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
    fontSize: 8,
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
  summarySection: {
    paddingLeft: 15,
    paddingRight: 15,
    breakBefore: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "bold",
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
    marginTop: 5,
    paddingTop: 5,
    gap: 10,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
    fontFamily: "ethio",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right",
  },
  summaryTable: {
    width: "34.1%",
    marginLeft: "30%",
    borderStyle: "solid",
    borderColor: "#000",
    marginTop: -7,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
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
    alignItems: "flex-end",
  },
  amountInWords: {
    fontSize: 8,
    marginTop: 10,
    fontStyle: "italic",
    color: "#4b5563",
  },
  validitySection: {
    fontSize: 10,
    color: "#000",
    marginTop: 10,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  signatureLine1: {
    fontFamily: "ethio",
    fontSize: 10,
    fontWeight: "normal",
    color: "#000",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 150,
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
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  customFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 7,
    color: "#000",
    padding: 10,
  },
});

interface PerformaPDFProps {
  data: Array<{
    product: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    part_number: string;
  }>;
  customer: { name: string };
  companyData: {
    name: string;
    am_name: string;
    phone1: string;
    phone2: string;
    tin_number: string;
    logo: string;
  };
  receipt: string;
  performaIdFourDigit: number;
}

export const PerformaPDF: React.FC<PerformaPDFProps> = ({
  data,
  customer,
  companyData,
  receipt,
  performaIdFourDigit,
}) => {
  console.log(customer);
  const itemsPerFirstPage = 25;
  const itemsPerPage = 32;
  const itemChunks: Array<Array<(typeof data)[0]>> = [];
  if (data.length > 0) {
    itemChunks.push(data.slice(0, itemsPerFirstPage));
    const remainingItems = data.slice(itemsPerFirstPage);
    let currentChunk: Array<(typeof data)[0]> = [];
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
  }

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
        <Page
          key={chunkIndex}
          size="A4"
          style={[styles.page, chunkIndex > 0 ? { paddingTop: 30, paddingBottom: 40 } : { paddingBottom: 40 }]}
          wrap
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
                    paddingBottom: 0,
                  },
                ]}
              >
                <Image
                  style={{ width: 80, height: 80 }}
                  src={`${IMAGE_BASE_URL}${companyData?.logo}`}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "ethio",
                      marginLeft: 5,
                      fontSize: 11,
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
                    ቀን:{" "}
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                    Date
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 2, gap: 4 }}>
                    <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                      No:{" "}
                      <Text style={{ color: "red" }}>
                        {performaIdFourDigit ? performaIdFourDigit : ""}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 15,
                }}
              >
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 10,
                    marginLeft: 20,
                    fontWeight: "bold",
                  }}
                >
                  Tin No:{" "}
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      marginLeft: 20,
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                  >
                    {companyData?.tin_number ? companyData?.tin_number : ""}
                  </Text>
                </Text>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "ethio",
                      textDecoration: "underline",
                      fontSize: 15,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginLeft: "150px",
                    }}
                  >
                    የዋጋ ማቅረቢያ
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      textAlign: "center",
                      textDecoration: "underline",
                      marginLeft: "150px",
                    }}
                  >
                    Performa
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 10,
                    fontWeight: "bold",
                    marginLeft: 35,
                  }}
                >
                  ለ፦
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      fontWeight: "bold",
                      marginLeft: 2,
                      textDecoration: "underline",
                    }}
                  >
                    {" "}
                    {customer ? customer : ""}
                  </Text>
                </Text>
                <Text
                  style={{
                    marginLeft: 34,
                    fontSize: 10,
                  }}
                >
                  To
                </Text>
              </View>
            </>
          )}
          <View style={styles.tableContainer} breakBefore="avoid">
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
                <View style={styles.tableColPartNumber}>
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
                <View style={styles.tableCol4}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ብዛት</Text>
                    <Text style={styles.headerCellLabel}>Qty</Text>
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
                <View key={index} style={styles.tableRow} wrap={false}>
                  <View style={styles.tableCol1}>
                    <Text style={styles.tableCell}>
                      {index +
                        1 +
                        (chunkIndex > 0
                          ? itemsPerFirstPage + (chunkIndex - 1) * itemsPerPage
                          : 0)}
                    </Text>
                  </View>
                  <View style={styles.tableCol2}>
                    <Text style={styles.tableCell}>{item.product}</Text>
                  </View>
                  <View style={styles.tableColPartNumber}>
                    <Text style={styles.tableCell}>{item.part_number}</Text>
                  </View>
                  <View style={styles.tableCol3}>
                    <Text style={styles.tableCell}>{item.unit}</Text>
                  </View>
                  <View style={styles.tableCol4}>
                    <Text style={styles.tableCell}>{item.quantity}</Text>
                  </View>
                  <View style={styles.tableCol5}>
                    <Text style={styles.tableCellRight}>
                      {formatCurrency(item.unitPrice)}
                    </Text>
                  </View>
                  <View style={styles.tableCol6}>
                    <Text style={styles.tableCellRight}>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {chunkIndex === itemChunks.length - 1 && (
            <View style={styles.summarySection} breakBefore="avoid">
              <View
                style={{
                  flexDirection: "column",
                  fontSize: 8,
                  maxWidth: 230,
                }}
              >
                <Text style={{ fontFamily: "ethio" }}>የገንዘብ መጠን በፊደል</Text>
                <Text>
                  Amount in Words:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {convertToWordsWithCurrency(
                      calculateTotal(data, receipt),
                    )}{" "}
                  </Text>
                </Text>
              </View>
              <View style={styles.summaryTable}>
                <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                  <View style={styles.summaryTableCol1}>
                    <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                  </View>
                  <View style={styles.summaryTableCol2}>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(calculateSubtotal(data))}
                    </Text>
                  </View>
                </View>
                {receipt !== "No Receipt" && (
                  <View style={[styles.summaryTableRow, { borderBottomWidth: 1 }]}>
                    <View style={styles.summaryTableCol1}>
                      <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                    </View>
                    <View style={styles.summaryTableCol2}>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(calculateVAT(data))}
                      </Text>
                    </View>
                  </View>
                )}
                {receipt !== "No Receipt" && (
                  <View style={styles.summaryTableRow}>
                    <View style={styles.summaryTableCol1}>
                      <Text style={styles.summaryLabel}>ጠቅላላ ዋጋ ተ.እ.ታ ጨምሮ</Text>
                      <Text style={styles.summaryLabel}>Selling Price</Text>
                    </View>
                    <View style={styles.summaryTableCol2}>
                      <Text style={styles.totalValue}>
                        {formatCurrency(calculateTotal(data, receipt))}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
          {chunkIndex === itemChunks.length - 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingLeft: 13,
                paddingRight: 13,
              }}
            >
              <View style={styles.validitySection} breakBefore="avoid">
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: "bold",
                    fontFamily: "ethio",
                    color: "#000",
                  }}
                >
                  ይህ ዋጋ ማቅረቢያ የሚያገለግለው ለ______________ ቀን ብቻ ነው።
                </Text>
                <Text>
                  The validity of this performa invoice is for ______________
                  days only.
                </Text>
              </View>
              <View style={styles.signatureSection} breakBefore="avoid">
                <View>
                  <Text style={styles.signatureLine1}>ፊርማ ______________</Text>
                  <Text style={styles.signatureText}>Signature</Text>
                </View>
              </View>
            </View>
          )}
          <FooterPdf fixed />
        </Page>
      ))}
    </Document>
  );
};
