import {
  Document,
  Page,
  StyleSheet,
  Svg,
  Path,
  Text,
  View,
  Font,
  Image,
} from "@react-pdf/renderer";
import ethioFont from "@/assets/ethioFont.ttf";
import { Table, TD, TR } from "@ag-media/react-pdf-table";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import Header from "@/features/products/components/pdf/Header";
import { IMAGE_BASE_URL } from "@/utils/apiConfig";
import FooterPdf from "@/features/order/components/FotterPdf";

Font.register({
  family: "NotoSansEthiopic",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 10,
    border: "1px solid black",
  },
  header: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    // border: "1px solid black",
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    border: "1px solid black",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  headerTextContainer: {
    flexDirection: "column",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "NotoSansEthiopic",
  },
  amharicFont: {
    fontFamily: "NotoSansEthiopic",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "left",
  },
  section: {
    marginTop: 10,
  },
});

interface PdfDocumentProps {
  vehicleAcceptance: any;
  companyData: any;
}

const PdfDocument = ({ vehicleAcceptance, companyData }: PdfDocumentProps) => {


  // const Header = ({ companyData }) => (
  //   <View style={styles.headerTextContainer}>
  //     <View style={{ marginRight: 10 }}>
  //       {companyData?.logo && (
  //         <Image
  //           style={styles.image}
  //           source={{ uri: `${IMAGE_BASE_URL}${companyData.logo}` }}
  //         />
  //       )}
  //     </View>
  //     <View style={styles.companyDetails}>
  //       <Text style={styles.companyName}>
  //         {companyData?.am_name ?? "የአካባቢ የአውቶሞቪል አባላት ክፍል"}
  //       </Text>
  //       <Text style={styles.companyText}>
  //         {companyData?.en_name ?? "Local Vehicle Owners Section"}
  //       </Text>
  //     </View>
  //   </View>
  // );




  const Header = () => (
    <View style={styles.header}>
      {companyData?.logo && (
        <Image
          style={{ width: 80, height: 60 }}
          src={`${IMAGE_BASE_URL}${companyData.logo}`}
        />
      )}
      <View style={styles.headerTextContainer}>
        <Text style={styles.amName}>{companyData?.am_name || ""}</Text>
        <Text style={styles.enName}>{companyData?.en_name || ""}</Text>
      </View>
    </View>
  );

  // const Footer = () => (
  //   <View
  //     style={{
  //       position: "absolute",
  //       bottom: 50,
  //       left: 10,
  //       right: 10,
  //       fontSize: 9,
  //     }}
  //   >
  //     <View
  //       style={{
  //         marginLeft: 10,
  //         marginRight: 10,
  //         marginTop: 100,
  //       }}
  //     >
  //       <View style={{ alignItems: "center" }}>
  //         <Text
  //           style={{
  //             fontFamily: "NotoSansEthiopic",
  //             fontSize: 9,
  //             textAlign: "center",
  //           }}
  //         >
  //           ደረጃውን በጠበቀ ዕቃ ተሽከርካሪዎችን በማስጥርገንና ተገቢዉን ዓመታዊ ምርመራ በወቅቱ በማደረግ የትራፊክ
  //           አደጋን በጋራ እንከላከል።
  //         </Text>
  //         <View
  //           style={{
  //             height: 2,
  //             backgroundColor: "black",
  //             marginTop: 2,
  //             width: "100%",
  //           }}
  //         />
  //       </View>
  //     </View>
  //     <View>
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           maxWidth: "50%",
  //           gap: 20,
  //           margin: "auto",
  //         }}
  //       >
  //         <Text style={{ fontSize: 9 }}>0909090909</Text>
  //         <Text style={{ fontSize: 9 }}>0909090909</Text>
  //         <Text style={{ fontSize: 9 }}>86</Text>
  //       </View>
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           alignItems: "center",
  //           maxWidth: "50%",
  //           margin: "auto",
  //           gap: 10,
  //         }}
  //       >
  //         <Text
  //           style={{
  //             fontSize: 9,
  //             fontFamily: "NotoSansEthiopic",
  //           }}
  //         >
  //           Wolaita Sodo
  //         </Text>
  //         <Text style={{ fontSize: 9 }}>Ethiopia</Text>
  //       </View>
  //     </View>
  //   </View>
  // );

  const CheckIcon = () => (
    <View>
      <Svg width="10" height="10" viewBox="0 0 24 24">
        <Path
          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
          fill="green"
        />
      </Svg>
    </View>
  );

  const CrossIcon = () => (
    <View>
      <Svg width="10" height="10" viewBox="0 0 24 24">
        <Path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          fill="red"
        />
      </Svg>
    </View>
  );

  const getCheckOrCross = (obj: any, prop: string) => {
    if (!obj || typeof obj !== "object") return null;
    if (prop === "have") {
      if (obj.have === true) {
        return <CheckIcon />;
      }
    } else if (prop === "dont_have") {
      if (obj.dont_have === true) {
        return <CheckIcon />;
      }
    }
    return null;
  };

  const getBrokenStatus = (obj: any) => {
    if (!obj || typeof obj !== "object") return null;
    if (obj.broken === true) return <CheckIcon />;
    return null;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={styles.amharicFont}>የተሽከርካሬ መረከቢያ</Text>
            <Text style={[styles.amharicFont, { textDecoration: "underline" }]}>
              Vehicle Acceptance
            </Text>
          </View>
        </View>
        <View>
          <View
            style={[
              styles.amharicFont,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            <Text>ሞዴል/Model {vehicleAcceptance?.vehicle_model || "N/A"}</Text>
            <Text>
              የድርጅት ስም/Organization Name{" "}
              {vehicleAcceptance?.customer_name || "N/A"}
            </Text>
          </View>
          <View
            style={[
              styles.amharicFont,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            <Text>
              ሻንሲ/Classis No {vehicleAcceptance?.vehicle_shanci_kutir || " "}
            </Text>
            <Text>
              ስልክ/Phone No {vehicleAcceptance?.customer_phone || " "}
            </Text>
          </View>
          <View
            style={[
              styles.amharicFont,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            <Text>
              ሞተር/Eng No {vehicleAcceptance?.vehicle_motor_kutir || " "}
            </Text>
            <Text>
              የግ/ክ/መ/ቁ/Tin No {vehicleAcceptance?.customer_tin_number || " "}
            </Text>
          </View>
          <View
            style={[
              styles.amharicFont,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            <Text>
              ታርጋ ቁጥር/Plate No {vehicleAcceptance?.vehicle_targa_kutir || ""}
            </Text>
            <Text>
              ቀን/Date {formatDateTypeStamp(vehicleAcceptance?.ken) || " "}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Table>
            <TR>
              <TD
                weighting={0.176}
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                1. የሞተር ክፍል /ክዳን
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                አለ
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                የለም
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                የተበላሸ
              </TD>
              <TD
                weighting={0.176}
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                2. የውጭ አካል
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                የግራ
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                የቀኝ
              </TD>
              <TD
                weighting={0.176}
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                3. የውስጥ ክፍል
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                አለ
              </TD>
              <TD
                style={{
                  ...styles.amharicFont,
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                የለም
              </TD>
              <TD style={styles.amharicFont}>የተበላሸ</TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፍሬን ዘይት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fren_zeyt, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fren_zeyt, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_fren_zeyt)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ፈርፍንጎ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ferfango?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ferfango?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ትራስ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.tiras, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.tiras, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.tiras)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የመሪ ዘይት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_meri_zeyt, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_meri_zeyt, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_meri_zeyt)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፊት መብራት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ye_fit_mebrat?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ye_fit_mebrat?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                መተርኮሻ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.meterkosha, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.meterkosha, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.meterkosha)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የሞተር ዘይት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_motor_zeyt, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_motor_zeyt, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_motor_zeyt)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ፍሬቻ መብራት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.frecha_mebrat?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.frecha_mebrat?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የወለል ምንጣፍ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_welel_mintaf, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_welel_mintaf, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_welel_mintaf)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የራዲያተር
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_radiator, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_radiator, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_radiator)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ማቆሚያ መብራት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.makomiya_mebrat?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.makomiya_mebrat?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የወንበር ልብስ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wember_libs, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wember_libs, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_wember_libs)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ባትሪ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.battery, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.battery, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.battery)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ንፋስ መከላከያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.nifas_mekelakeya?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.nifas_mekelakeya?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ስፔክዮ የውስጥ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_spekiyo, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_spekiyo, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_wist_spekiyo)}
              </TD>
            </TR>

            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ዝናብ መጥረጊያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.zinab_metregya, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.zinab_metregya, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.zinab_metregya)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የዝናብ መጥረጊያ የብሎን ክዳን
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ye_zinab_metregiya_ye_bilon_kidan?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ye_zinab_metregiya_ye_bilon_kidan?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                መብራት የውስጥ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_mebrat, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_mebrat, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_wist_mebrat)}
              </TD>
            </TR>

            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ስፔክዮ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.spekiyo?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.spekiyo?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ቴፕ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.tep, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.tep, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.tep)}
              </TD>
            </TR>

            <TR>
              <TD weighting={0.176}
                style={{
                  ...styles.amharicFont,
                  // flexDirection: "row",
                  // justifyContent: "center"
                }}> 2.1 የውጭ አካል
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የበር እጄታ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ye_ber_ijeta?.left ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {vehicleAcceptance?.ye_ber_ijeta?.right ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                እሳት አደጋ መከላከያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.isat_adega_mekelakeya, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.isat_adega_mekelakeya, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.isat_adega_mekelakeya)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ማስከሪያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.maskerya, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.maskerya, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.maskerya)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                መብራት ማብሪያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.mebrat_mabriya, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.mebrat_mabriya, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.mebrat_mabriya)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                አንቴና
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.antenna, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.antenna, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.antenna)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ዝናብ መጥረጊያ መብራት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.zinab_metregiya_mebrat, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.zinab_metregiya_mebrat, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.zinab_metregiya_mebrat)}
              </TD>
            </TR>   
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፊት ታርጋ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_targa, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_targa, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_fit_targa)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.3566} style={styles.amharicFont}>
                <Table style={{ height: "100%" }}>
                  <TR>
                    <TD weighting={0.4948}>ነዳጅ</TD>
                    <TD>
                      {vehicleAcceptance?.nedaj ? vehicleAcceptance?.nedaj : ""}
                    </TD>
                  </TR>
                </Table>
              </TD>


            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የኃላ ታርጋ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_targa, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_targa, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_huala_targa)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፀሀይ መከላከያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_tsehay_mekelakeya, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_tsehay_mekelakeya, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_tsehay_mekelakeya)}
              </TD>
            </TR>



            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ጭቃ መከላከያ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ika_mekelakeya, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ika_mekelakeya, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ika_mekelakeya)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የመስታወት ማውጫ ማውረጃ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_mestewat_mawcha_mawreja, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_mestewat_mawcha_mawreja, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_mestewat_mawcha_mawreja)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የሰልቫትዬ ክዳን
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_sivat_kidan, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_sivat_kidan, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_sivat_kidan)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፊት የኮፈን አሞርዝራተር
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_ye_kofen_amorzrater, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_ye_kofen_amorzrater, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_fit_ye_kofen_amorzrater)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የኃላ መብራት ብርጭቆ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_mebrat_birchiko, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_mebrat_birchiko, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_huala_mebrat_birchiko)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የሁዋላ የኮፈን አሞርዝራተር
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_ye_kofen_amorzrater, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_ye_kofen_amorzrater, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_huala_ye_kofen_amorzrater)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የበር ጎሚኒ የመስታወት ላስቲክ ፍሬም
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_ber_gomini_mestawat_lstic_frame, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_ber_gomini_mestawat_lstic_frame, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_ber_gomini_mestawat_lstic_frame)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                ክላክስ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.klaks, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.klaks, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.klaks)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፊት ፓራውልት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_prawlit, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_prawlit, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_fit_prawlit)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የውስጥ ዳሽ ቦርድ ኪስ ቁልፍ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_dashboard_kis_kulf, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_dashboard_kis_kulf, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_wist_dashboard_kis_kulf)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ቡርጅነሪ ብሎን
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.birjineri_bilon, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.birjineri_bilon, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.birjineri_bilon)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የኮፈን ጎሚኒ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_kofen_gomini, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_kofen_gomini, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_kofen_gomini)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የሁዋላ ፍራውልት አንፀባራቂ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_prawlit_antsebaraki, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_prawlit_antsebaraki, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_huala_prawlit_antsebaraki)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>
                የውሃ መርጫ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wuha_mercha, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wuha_mercha, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_wuha_mercha)}
              </TD>
            </TR>   <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የፊት እግር ፍሬን ሎክ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_igir_fren_lock, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_fit_igir_fren_lock, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_fit_igir_fren_lock)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

                የውስጥ በር መክፈቻ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

                {getCheckOrCross(vehicleAcceptance?.ye_wist_ber_mekfecha, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_wist_ber_mekfecha, "dont_have")}

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

                {getBrokenStatus(vehicleAcceptance?.ye_wist_ber_mekfecha)}
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የሁዋላ ጎማ ልብስ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_goma_libs, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_huala_goma_libs, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_huala_goma_libs)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >


              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ፎርቶመጋላ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.fortomegala, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.fortomegala, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.fortomegala)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >


              </TD>
            </TR>

            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                እስኮርት ጎማ መፍቻ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.eskort_goma_mefcha, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.eskort_goma_mefcha, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.eskort_goma_mefcha)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                {" "}
              </TD>

              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
               
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                4. ውጫዊ ሁኔታ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
               
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የግንባር መስታወት
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_ginbar_mestewat, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_ginbar_mestewat, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_ginbar_mestewat)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                አንፀባራቂ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.antsebaraki, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.antsebaraki, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.antsebaraki)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>

            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ክሪክ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.kirk, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.kirk, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.kirk)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                ጎማ መፍቻ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.goma_mefcha, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.goma_mefcha, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.goma_mefcha)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                እስኮርት ጎማ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.eskort_goma, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.eskort_goma, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.eskort_goma)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>

            <TR>
              <TD weighting={0.176} style={styles.amharicFont}>
                የቸርኬ ጌጥ
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_cherke_get, "have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getCheckOrCross(vehicleAcceptance?.ye_cherke_get, "dont_have")}
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {getBrokenStatus(vehicleAcceptance?.ye_cherke_get)}
              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >

              </TD>
              <TD weighting={0.176} style={styles.amharicFont}>


              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
              <TD
                style={{
                  textAlign: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              </TD>
            </TR>
            <TR>
              <TD weighting={0.352} style={styles.amharicFont}>
                <Table style={{ height: "100%" }}>
                  <TR>
                    <TD weighting={0.4961}>ጎማ </TD>
                    <TD>
                      {vehicleAcceptance?.goma ? vehicleAcceptance?.goma : ""}
                    </TD>
                  </TR>
                </Table>
              </TD>
              <TD ></TD>

            </TR>

            <TR>
              <TD weighting={0.352} style={styles.amharicFont}>
                <Table style={{ height: "100%" }}>
                  <TR>
                    <TD weighting={0.496}>ኮለኔት </TD>
                    <TD>
                      {vehicleAcceptance?.kolenet ? vehicleAcceptance?.kolenet : ""}
                    </TD>
                  </TR>
                </Table>
              </TD>
              <TD ></TD>

            </TR>

          </Table>
          <View
            style={{
              width: "90%",
              margin: "auto",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <View>
              <Text style={styles.amharicFont}>
                አስረካቢ ስም {vehicleAcceptance?.asrekabi_name}
              </Text>
              <Text style={styles.amharicFont}>ፊርማ_______</Text>
              <Text style={styles.amharicFont}>ቀን_______</Text>
              <Text style={styles.amharicFont}>
                ማሳሰቢያ:- የተለወጡ ዕቃዎች ተመላሽ መሆናን ያረጋግጡ።
              </Text>
            </View>
            <View>
              <Text style={styles.amharicFont}>
                የተረካቢ ስም {vehicleAcceptance?.terekabi_name}
              </Text>
              <Text style={styles.amharicFont}>ፊርማ_______</Text>
              <Text style={styles.amharicFont}>ቀን_______</Text>
              <Text style={styles.amharicFont}>
                የሚወጣበት ቀን {vehicleAcceptance?.ye_miwetabet_ken}
              </Text>
            </View>
          </View>
        </View>
        <FooterPdf fixed />
      </Page>
    </Document>
  );
};

export default PdfDocument;
