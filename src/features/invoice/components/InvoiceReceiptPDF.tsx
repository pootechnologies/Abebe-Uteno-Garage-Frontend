import React from "react";
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
import { IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";

// Register NotoSansEthiopic font
Font.register({
  family: "NotoSansEthiopic",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansEthiopic",
    fontSize: 10,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
    marginBottom: 10,
  },
  companyDetails: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
  },
  companyName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  companyText: {
    fontSize: 14,
    color: "#555",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoBox: {
    width: "48%",
    backgroundColor: "#fafafa",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  infoBoxTitle: {
    fontSize: 10,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
    paddingBottom: 3,
    color: "#444",
  },
  infoText: {
    fontSize: 10,
    marginVertical: 2,
    color: "#444",
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: -7,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f2f2f2",
    padding: 6,
    flex: 1,
    fontWeight: "bold",
  },
  tableCol: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 6,
    flex: 1,
  },
  highlightRow: {
    backgroundColor: "#fafafa",
  },
  totals: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalsText: {
    fontSize: 10,
    marginVertical: 2,
  },
  totalsBold: {
    fontSize: 10,
    fontWeight: "bold",
    marginVertical: 2,
  },
  totalsBig: {
    fontSize: 11,
    fontWeight: "bold",
    marginVertical: 2,
  },
  sectionTitle: {
    fontSize: 11,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
    paddingBottom: 3,
    color: "#444",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#777",
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  footerText: {
    marginVertical: 2,
  },
  image: {
    width: 80,
    height: 60,
  },
});

// Header component
const Header = ({ companyData }) => (
  <View style={styles.header}>
    <View style={{ marginRight: 10 }}>
      {companyData?.logo && (
        <Image
          style={styles.image}
          source={{ uri: `${IMAGE_BASE_URL}${companyData.logo}` }}
        />
      )}
    </View>
    <View style={styles.companyDetails}>
      <Text style={styles.companyName}>
        {companyData?.am_name ?? "የአካባቢ የአውቶሞቪል አባላት ክፍል"}
      </Text>
      <Text style={styles.companyText}>
        {companyData?.en_name ?? "Local Vehicle Owners Section"}
      </Text>
    </View>
  </View>
);

const InvoiceReceiptPDF = ({
  company,
  customer,
  vehicle,
  jobcard_details,
  assignments,
  part_request,
  totals,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Header companyData={company} />
          {/* Job card */}

          {/* Jobcard Details */}
          <View style={{ marginBottom: 10 }}>
            <Text
              style={[
                styles.sectionTitle,
                { textAlign: "center", fontSize: 14 },
              ]}
            >
              ደረሰኝ/Invoice
            </Text>
          </View>
          {/* Customer & Vehicle Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>የተጠቃሚ መረጃ</Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ስም:</Text>{" "}
                {customer?.name ?? "—"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ስልክ:</Text>{" "}
                {customer?.phone ?? "—"}
              </Text>
              <Text style={styles.infoText}>
                <Text>TIN ቁጥር:</Text> {customer?.tin_number ?? "—"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ድርጅት:</Text>{" "}
                {customer?.organization ?? "—"}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>የመኪና መረጃ</Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ሞዴል:</Text>{" "}
                {vehicle?.model ?? "—"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ማስተዋልያ ቁጥር:</Text>{" "}
                {vehicle?.license_plate ?? "—"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ሞተር ቁጥር:</Text>{" "}
                {vehicle?.motor_kutir ?? "—"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>ሻንሺ ቁጥር:</Text>{" "}
                {vehicle?.shanci_kutir ?? "—"}
              </Text>
            </View>
          </View>
          {/* Jobcard Details */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>የስራ ካርድ መረጃ</Text>
            <View style={styles.table}>
              {[
                ["የስራ ካርድ መለያ ቁጥር", jobcard_details?.jobcard_id ?? "—"],
                [
                  "የአገልግሎት ቀን",
                  jobcard_details?.service_date
                    ? formatDateTypeStamp(jobcard_details.service_date)
                    : "—",
                ],
                ["ሁኔታ", jobcard_details?.status ?? "—"],
                [
                  "ኦዶሜተር አቃጣ",
                  jobcard_details?.odometer_reading?.toLocaleString() ?? "—",
                ],
                ["አገልግሎት አስተዋፅኦ", jobcard_details?.user ?? "—"],
                ["ጠቅላላ ዋጋ", `${jobcard_details?.total_cost ?? 0} ብር`],
              ].map(([label, value], idx) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.tableColHeader}>{label}</Text>
                  <Text style={styles.tableCol}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Assigned Services */}
          {/* <View style={{ marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>የተሰጠ አገልግሎት</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {["ሠራተኛ", "የአገልግሎት ፓኬጅ", "አገልግሎት", "ሁኔታ", "ዋጋ (ብር)"].map(
                  (header, idx) => (
                    <Text style={styles.tableColHeader} key={idx}>
                      {header}
                    </Text>
                  )
                )}
              </View>
              {assignments?.map((assignment, aIdx) =>
                (assignment.assigned_services ?? []).map((service, sIdx) => (
                  <View style={styles.tableRow} key={`${aIdx}-${sIdx}`}>
                    <Text style={styles.tableCol}>
                      {assignment?.worker ?? "—"}
                    </Text>
                    <Text style={styles.tableCol}>
                      {assignment?.service_package ?? "—"}
                    </Text>
                    <Text style={styles.tableCol}>
                      {service?.service_name ?? "—"}
                    </Text>
                    <Text style={styles.tableCol}>
                      {service?.status ?? "—"}
                    </Text>
                    <Text style={styles.tableCol}>
                      {assignment?.service_package_cost ?? "—"}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View> */}
          {/* Part Request */}
          {part_request && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>የእቃ ጥያቄ</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  {/* {["ምርት", "የአንድ ዋጋ (ብር)", "ብዛት", "ጠቅላላ ዋጋ (ብር)"].map( */}
                  {["ምርት", "ብዛት"].map((header, idx) => (
                    <Text style={styles.tableColHeader} key={idx}>
                      {header}
                    </Text>
                  ))}
                </View>
                {(part_request.items ?? []).map((item, idx) => (
                  <View style={styles.tableRow} key={idx}>
                    <Text style={styles.tableCol}>
                      {item.product_name ?? "—"}
                    </Text>
                    {/* <Text style={styles.tableCol}>{item.unit_price ?? 0}</Text> */}
                    <Text style={styles.tableCol}>{item.quantity ?? 0}</Text>
                    {/* <Text style={styles.tableCol}>{item.price ?? 0}</Text> */}
                  </View>
                ))}
              </View>
              {/* <View style={styles.totals}>
                <Text style={styles.totalsBold}>
                  ጠቅላላ የእቃ ዋጋ: {part_request.total_amount ?? 0} ብር
                </Text>
              </View> */}
            </View>
          )}
          {/* Totals Summary */}
          <View style={{ marginTop: 5 }}>
            <Text style={styles.sectionTitle}>ጠቅላላ ዝርዝር</Text>
            <View style={styles.totals}>
              {/* <Text style={styles.totalsText}>
                የፓኬጅ ጠቅላላ ዋጋ: {totals?.service_packages_total ?? 0} ብር
              </Text>
              <Text style={styles.totalsText}>
                የቅጂ ጠቅላላ ዋጋ: {totals?.parts_total ?? 0} ብር
              </Text> */}
              <Text style={styles.totalsBold}>
                ጠቅላላ አጠቃላይ: {totals?.combined_subtotal ?? 0} ብር
              </Text>
              <Text style={styles.totalsText}>
                VAT (15%): {totals?.vat?.toFixed(2) ?? 0} ብር
              </Text>
              <Text style={styles.totalsBig}>
                ጠቅላላ ዋጋ: {totals?.total_amount ?? 0} ብር
              </Text>
            </View>
          </View>
          {/* Footer */}
          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>አመሰግናለሁ አገልግሎታችንን ለመጠቀም!</Text>
            <Text style={styles.footerText}>
              በቀን: {new Date().toLocaleDateString()}
            </Text>
          </View> */}
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceReceiptPDF;
