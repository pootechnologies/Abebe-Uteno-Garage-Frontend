import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords.ts";
import { IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import ethioFont from "@/assets/ethioFont.ttf";
import RobotoRegular from "@/assets/roboto-regular-webfont.ttf";
import RobotoBold from "@/assets/roboto-bold-webfont.ttf";
import RobotoItalic from "@/assets/roboto-italic-webfont.ttf";
import FooterPdf from "@/features/order/components/FotterPdf";
import serviceProducts from "../../../serviceproducts.json"

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: RobotoRegular,
      fontWeight: "normal",
    },
    {
      src: RobotoBold,
      fontWeight: "bold",
    },
    {
      src: RobotoItalic,
      fontWeight: "normal",
      fontStyle: "italic",
    },
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
  },

  header: {
    marginBottom: 20,
    paddingBottom: 10,
    marginTop: 30,
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
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },

  tableCol2: {
    width: "25%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },

  serviceChargeDescription: {
    width: "57%",
  },

  tableColPartNumber: {
    width: "25%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },

  tableCol3: {
    width: "8%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },

  tableCol4: {
    width: "10%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },

  tableCol5: {
    width: "15%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
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
    textAlign: "left",
    fontFamily: "ethio",
  },

  tableCellRight: {
    fontSize: 10.7,
    color: "#000",
    borderStyle: "solid",
    textAlign: "right",
  },

  serviceTitleRow: {
    width: "100%",
    minHeight: 25,
    borderBottomWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },

  summarySection: {
    paddingLeft: 15,
    paddingRight: 15,
    breakBefore: "avoid",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  amountInWords: {
    fontSize: 10,
    marginTop: 10,
    fontStyle: "italic",
    color: "#4b7563",
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
    borderTopColor: "#9ca3af",
    width: 150,
  },

  signatureText: {
    fontSize: 8,
    textAlign: "center",
    color: "#000",
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
});

interface PdfPerformaProps {
  data: any[];
  carShanci: any;
  customer: string;
  companyData: any;
  receipt: string;
  fourDegitId: number | null;
  performaServiceCharge?: any;
  AllPaymentData?: any;
}

type MergedTableRow =
  | {
    type: "product";
    item: any;
    originalIndex: number;
  }
  | {
    type: "service";
    item: any;
    originalIndex: number;
  };

const ManagePerformaPdf: React.FC<PdfPerformaProps> = ({
  data,
  carShanci,
  customer,
  companyData,
  receipt,
  fourDegitId,
  performaServiceCharge,
  AllPaymentData,
}) => {
  const targa_kutir = carShanci?.targa_kutir
    ? carShanci?.targa_kutir
    : "";

  const itemsPerFirstPage =
    Number(performaServiceCharge) > 0
      ? 18
      : 22;

  const itemsPerPage =
    Number(performaServiceCharge) > 0
      ? 28
      : 30;

  const itemChunks: any[][] = [];

  const priceData = data?.map(
    (p) => p.product_service_charge
  );

  const product_service_Percharge =
    priceData[0];

  console.log(AllPaymentData);

  const performaSubTotal =
    AllPaymentData?.sub_total;

  const performaVat =
    AllPaymentData?.vat;

  const performaTotal =
    AllPaymentData?.total_amount;

  console.log(
    "PerformaServiceCharge: ",
    performaServiceCharge
  );

  console.log(
    "Product Service PerCharge",
    product_service_Percharge
  );

  if (data) {
    itemChunks.push(
      data.slice(
        0,
        itemsPerFirstPage
      )
    );

    const remainingItems =
      data.slice(
        itemsPerFirstPage
      );

    let currentChunk: any[] = [];

    remainingItems.forEach(
      (item) => {
        currentChunk.push(item);

        if (
          currentChunk.length >=
          itemsPerPage
        ) {
          itemChunks.push(
            currentChunk
          );

          currentChunk = [];
        }
      }
    );

    if (
      currentChunk.length > 0
    ) {
      itemChunks.push(
        currentChunk
      );
    }
  }

  const isMergedServiceTable =
    Number(
      product_service_Percharge
    ) > 0 &&
    Number(
      performaServiceCharge
    ) < 1;

  const mergedServiceChargeTotal =
    data?.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item?.product_service_charge
        ) *
        Number(
          item?.quantity
        ),
      0
    ) || 0;

  const serviceProductDescriptions = serviceProducts.map(
    (item: any) => item.description
  );

  const mergedTableRows: MergedTableRow[] = isMergedServiceTable
    ? [
      ...data
        .filter((item) => {
          const name = String(item.product_name || "")
            .trim()
            .toLowerCase();

          return !serviceProductDescriptions.some(
            (description) => name === description.toLowerCase()
          );
        })
        .map((item) => ({
          type: "product" as const,
          item,
          originalIndex: data.indexOf(item),
        })),

      ...data.map((item, index) => ({
        type: "service" as const,
        item,
        originalIndex: index,
      })),
    ]
    : [];

  const mergedChunks:
    MergedTableRow[][] = [];

  if (
    isMergedServiceTable
  ) {
    const normalRows =
      mergedTableRows.filter(
        (row) =>
          row.type ===
          "product"
      );

    const serviceRows =
      mergedTableRows.filter(
        (row) =>
          row.type ===
          "service"
      );

    let normalIndex = 0;
    let serviceIndex = 0;
    let pageIndex = 0;
    let serviceSectionStarted =
      false;

    while (
      normalIndex <
      normalRows.length ||
      serviceIndex <
      serviceRows.length
    ) {
      const pageCapacity =
        pageIndex === 0
          ? itemsPerFirstPage
          : itemsPerPage;

      const chunk:
        MergedTableRow[] = [];

      if (
        !serviceSectionStarted
      ) {
        const remainingNormalRows =
          normalRows.length -
          normalIndex;

        if (
          remainingNormalRows >=
          pageCapacity
        ) {
          const normalPageRows =
            normalRows.slice(
              normalIndex,
              normalIndex +
              pageCapacity
            );

          chunk.push(
            ...normalPageRows
          );

          normalIndex +=
            normalPageRows.length;
        } else {
          const normalPageRows =
            normalRows.slice(
              normalIndex
            );

          chunk.push(
            ...normalPageRows
          );

          normalIndex =
            normalRows.length;

          if (
            serviceRows.length >
            serviceIndex
          ) {
            const remainingCapacity =
              pageCapacity -
              chunk.length;

            const serviceTitleUnits =
              1;

            if (
              remainingCapacity >
              serviceTitleUnits
            ) {
              serviceSectionStarted =
                true;

              const serviceRowsCapacity =
                remainingCapacity -
                serviceTitleUnits;

              const servicePageRows =
                serviceRows.slice(
                  serviceIndex,
                  serviceIndex +
                  serviceRowsCapacity
                );

              chunk.push(
                ...servicePageRows
              );

              serviceIndex +=
                servicePageRows.length;
            }
          }
        }
      } else {
        const serviceRowsCapacity =
          pageCapacity;

        const servicePageRows =
          serviceRows.slice(
            serviceIndex,
            serviceIndex +
            serviceRowsCapacity
          );

        chunk.push(
          ...servicePageRows
        );

        serviceIndex +=
          servicePageRows.length;
      }

      if (
        chunk.length > 0
      ) {
        mergedChunks.push(
          chunk
        );
      }

      pageIndex++;
    }
  }

  const calculateSubtotal = (
    items: any[]
  ) => {
    return items.reduce(
      (
        acc,
        item
      ) =>
        acc +
        item.quantity *
        item.unit_price,
      0
    );
  };

  const calculateVAT = (
    items: any[]
  ) => {
    return (
      calculateSubtotal(
        items
      ) * 0.15
    );
  };

  const calculateTotal = (
    items: any[]
  ) => {
    return receipt ===
      "No Receipt"
      ? calculateSubtotal(
        items
      )
      : calculateSubtotal(
        items
      ) +
      calculateVAT(
        items
      );
  };

  const formatCurrency = (
    amount: number
  ) => {
    return amount
      ?.toFixed(2)
      ?.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
      );
  };

  const isServiceChargesZero =
    (Number(
      product_service_Percharge
    ) === 0 ||
      !product_service_Percharge) &&
    (Number(
      performaServiceCharge
    ) === 0 ||
      !performaServiceCharge);

  const renderHeader = () => (
    <>
      <View
        style={[
          styles.header,
          {
            flexDirection:
              "row",
            alignItems:
              "center",
            paddingLeft: 10,
            paddingRight: 10,
            marginBottom: 0,
            paddingBottom: 0,
            marginTop: 0,
          },
        ]}
      >
        <Image
          style={{
            width: 80,
            height: 80,
          }}
          src={`${IMAGE_BASE_URL}${companyData?.logo}`}
        />

        <View
          style={{
            flexDirection:
              "column",
            alignItems:
              "flex-start",
            width: "80%",
          }}
        >
          <Text
            style={{
              fontFamily:
                "ethio",
              marginLeft: 5,
              fontSize: 11,
            }}
          >
            አበበ ኡቴኖ የሞኤንኮ ወኪል ሶዶ
          </Text>

          <Text
            style={
              styles.companyName
            }
          >
            Abebe Uteno MOENCO Sub Dealer Sodo
          </Text>

          <Text
            style={{
              fontFamily:
                "ethio",
              marginLeft: 5,
              fontSize: 11,
            }}
          >
            የመኪና መለዋወጫ ቀላልና ከባድ የአካልና የሞተር ጥገና ጋራዥ
          </Text>

          <View
            style={{
              flexDirection:
                "row",
            }}
          >
            <Text
              style={
                styles.companyInfoPhone
              }
            >
              {companyData?.phone1}{" "}
              {" / "}{" "}
              {companyData?.phone2}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection:
            "row",
          justifyContent:
            "flex-end",
          marginRight: 19,
        }}
      >
        <View
          style={{
            flexDirection:
              "column",
            justifyContent:
              "flex-end",
            gap: 1,
          }}
        >
          <Text
            style={{
              fontFamily:
                "ethio",
              fontSize: 10,
              textDecoration:
                "underline",
            }}
          >
            ቀን:{" "}
            {new Date().toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )}
          </Text>

          <Text
            style={{
              fontFamily:
                "ethio",
              fontSize: 10,
            }}
          >
            Date
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection:
            "row",
          alignItems:
            "center",
          marginLeft: 15,
        }}
      >
        <View
          style={{
            fontFamily:
              "ethio",
            fontSize: 10,
            marginLeft: 20,
            fontWeight:
              "bold",
            flexDirection:
              "column",
          }}
        >
          <View
            style={{
              flexDirection:
                "row",
            }}
          >
            <Text>
              Tin No:{" "}
            </Text>

            <Text
              style={{
                textDecoration:
                  "underline",
              }}
            >
              {companyData?.tin_number
                ? companyData.tin_number
                : ""}
            </Text>
          </View>

          <View
            style={{
              flexDirection:
                "row",
            }}
          >
            <Text>
              Vat No:{" "}
            </Text>

            <Text
              style={{
                textDecoration:
                  "underline",
              }}
            >
              {companyData?.vat_number
                ? companyData.vat_number
                : ""}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection:
              "column",
            alignItems:
              "center",
          }}
        >
          <Text
            style={{
              fontFamily:
                "ethio",
              textDecoration:
                "underline",
              fontSize: 15,
              fontWeight:
                "bold",
              textAlign:
                "center",
              marginLeft:
                "150px",
            }}
          >
            የዋጋ ማቅረቢያ
          </Text>

          <Text
            style={{
              fontSize: 13,
              fontWeight:
                "bold",
              textAlign:
                "center",
              textDecoration:
                "underline",
              marginLeft:
                "150px",
            }}
          >
            Performa
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection:
            "column",
        }}
      >
        <Text
          style={{
            fontFamily:
              "ethio",
            fontSize: 10,
            fontWeight:
              "bold",
            marginLeft: 35,
          }}
        >
          ለ፦

          <Text
            style={{
              fontFamily:
                "ethio",
              fontSize: 10,
              fontWeight:
                "bold",
              marginLeft: 2,
              textDecoration:
                "underline",
            }}
          >
            {" "}
            {customer
              ? customer
              : ""}
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

        <Text
          style={{
            fontFamily:
              "ethio",
            fontSize: 10,
            fontWeight:
              "bold",
            marginLeft: 35,
          }}
        >
          Plate Number:{" "}

          <Text
            style={{
              fontFamily:
                "ethio",
              fontSize: 10,
              fontWeight:
                "bold",
              marginLeft: 2,
            }}
          >
            {targa_kutir}
          </Text>
        </Text>
      </View>
    </>
  );

  const renderProductTableHeader =
    () => (
      <View
        style={
          styles.tableHeader
        }
        wrap={false}
      >
        <View
          style={
            styles.tableCol1
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              ተ.ቁ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              No
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol2
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              የእቃው አይነት
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Description
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableColPartNumber
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              የክፍል ቁጥር
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Part Number
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol3
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              መለኪያ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Unit
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol4
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              ብዛት
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Qty
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol5
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              የአንድ ዋጋ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Unit Price
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol6
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              ጠቅላላ ዋጋ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Total Price
            </Text>
          </View>
        </View>
      </View>
    );

  const renderProductTableHeaderNoPartNumber =
    () => (
      <View
        style={
          styles.tableHeader
        }
        wrap={false}
      >
        <View
          style={
            styles.tableCol1
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              ተ.ቁ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              No
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tableCol2,
            styles.serviceChargeDescription
          ]}
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              የእቃው አይነት
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Description
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol3
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              መለኪያ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Unit
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol4
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              ብዛት
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Qty
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol5
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              የአንድ ዋጋ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Unit Price
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tableCol6
          }
        >
          <View
            style={
              styles.headerCellContent
            }
          >
            <Text
              style={
                styles.headerCellNumber
              }
            >
              ጠቅላላ ዋጋ
            </Text>

            <Text
              style={
                styles.headerCellLabel
              }
            >
              Total Price
            </Text>
          </View>
        </View>
      </View>
    );

  const renderNormalProductRow = (
    item: any,
    number: number,
    key: string | number
  ) => (
    <View
      key={key}
      style={
        styles.tableRow
      }
      wrap={false}
    >
      <View
        style={
          styles.tableCol1
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {number}
        </Text>
      </View>

      <View
        style={
          styles.tableCol2
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.product_name}
        </Text>
      </View>

      <View
        style={
          styles.tableColPartNumber
        }
      >
        <Text style={styles.tableCell}>
          {!item.part_number || item.part_number === "undefined"
            ? ""
            : item.part_number}
        </Text>
      </View>

      <View
        style={
          styles.tableCol3
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.unit}
        </Text>
      </View>

      <View
        style={
          styles.tableCol4
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.quantity}
        </Text>
      </View>

      <View
        style={
          styles.tableCol5
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.unit_price
          )}
        </Text>
      </View>

      <View
        style={
          styles.tableCol6
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.quantity *
            +item.unit_price
          )}
        </Text>
      </View>
    </View>
  );

  const renderNormalProductRowNoPartNumber = (
    item: any,
    number: number,
    key: string | number
  ) => (
    <View
      key={key}
      style={
        styles.tableRow
      }
      wrap={false}
    >
      <View
        style={
          styles.tableCol1
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {number}
        </Text>
      </View>

      <View
        style={[
          styles.tableCol2,
          styles.serviceChargeDescription
        ]}
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.product_name}
        </Text>
      </View>

      <View
        style={
          styles.tableCol3
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.unit}
        </Text>
      </View>

      <View
        style={
          styles.tableCol4
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.quantity}
        </Text>
      </View>

      <View
        style={
          styles.tableCol5
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.unit_price
          )}
        </Text>
      </View>

      <View
        style={
          styles.tableCol6
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.quantity *
            +item.unit_price
          )}
        </Text>
      </View>
    </View>
  );

  const renderServiceProductRow = (
    item: any,
    number: number,
    key: string | number
  ) => (
    <View
      key={key}
      style={
        styles.tableRow
      }
      wrap={false}
    >
      <View
        style={
          styles.tableCol1
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {number}
        </Text>
      </View>

      <View
        style={
          styles.tableCol2
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.product_name}
        </Text>
      </View>

      <View
        style={
          styles.tableColPartNumber
        }
      >
        <Text style={styles.tableCell}>
          {!item.part_number || item.part_number === "undefined"
            ? ""
            : item.part_number}
        </Text>
      </View>

      <View
        style={
          styles.tableCol3
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.unit}
        </Text>
      </View>

      <View
        style={
          styles.tableCol4
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.quantity}
        </Text>
      </View>

      <View
        style={
          styles.tableCol5
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.product_service_charge
          )}
        </Text>
      </View>

      <View
        style={
          styles.tableCol6
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.product_service_charge *
            +item.quantity
          )}
        </Text>
      </View>
    </View>
  );

  const renderServiceProductRowNoPartNumber = (
    item: any,
    number: number,
    key: string | number
  ) => (
    <View
      key={key}
      style={
        styles.tableRow
      }
      wrap={false}
    >
      <View
        style={
          styles.tableCol1
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {number}
        </Text>
      </View>

      <View
        style={[
          styles.tableCol2,
          styles.serviceChargeDescription
        ]}
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.product_name}
        </Text>
      </View>

      <View
        style={
          styles.tableCol3
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.unit}
        </Text>
      </View>

      <View
        style={
          styles.tableCol4
        }
      >
        <Text
          style={
            styles.tableCell
          }
        >
          {item.quantity}
        </Text>
      </View>

      <View
        style={
          styles.tableCol5
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.product_service_charge
          )}
        </Text>
      </View>

      <View
        style={
          styles.tableCol6
        }
      >
        <Text
          style={
            styles.tableCellRight
          }
        >
          {formatCurrency(
            +item.product_service_charge *
            +item.quantity
          )}
        </Text>
      </View>
    </View>
  );

  const renderMergedServiceHeader =
    () => (
      <View
        style={
          styles.serviceTitleRow
        }
        wrap={false}
      >
        <Text
          style={
            styles.serviceTitle
          }
        >
          Service Charge
        </Text>
      </View>
    );

  const renderFixedServiceChargeRow =
    () => (
      <>
        {renderMergedServiceHeader()}

        <View
          style={
            styles.tableRow
          }
          wrap={false}
        >
          <View
            style={
              styles.tableCol1
            }
          >
            <Text
              style={
                styles.tableCell
              }
            >
              {" "}
            </Text>
          </View>

          <View
            style={
              styles.tableCol2
            }
          >
            <Text
              style={[
                styles.tableCell,
                {
                  fontWeight:
                    "bold",
                },
              ]}
            >
              {/* Service Charge */}
            </Text>
          </View>

          <View
            style={
              styles.tableColPartNumber
            }
          >
            <Text
              style={
                styles.tableCell
              }
            >
              {" "}
            </Text>
          </View>

          <View
            style={
              styles.tableCol3
            }
          >
            <Text
              style={
                styles.tableCell
              }
            >
              {" "}
            </Text>
          </View>

          <View
            style={
              styles.tableCol4
            }
          >
            <Text
              style={
                styles.tableCell
              }
            >
              {" "}
            </Text>
          </View>

          <View
            style={
              styles.tableCol5
            }
          >
            <Text
              style={[
                styles.tableCellRight,
                {
                  fontWeight:
                    "bold",
                },
              ]}
            >
              {/* Total Service */}
            </Text>
          </View>

          <View
            style={
              styles.tableCol6
            }
          >
            <Text
              style={[
                styles.tableCellRight,
                {
                  fontWeight:
                    "bold",
                },
              ]}
            >
              {formatCurrency(
                +performaServiceCharge
              )}
            </Text>
          </View>
        </View>
      </>
    );

  const renderSummary = () => (
    <View wrap={false}>
      <View
        style={
          styles.summarySection
        }
      >
        <View
          style={{
            flexDirection:
              "column",
            fontSize: 8,
            maxWidth: 240,
          }}
        >
          <Text
            style={{
              fontFamily:
                "ethio",
              fontSize: 10,
            }}
          >
            የገንዘብ መጠን በፊደል
          </Text>

          <Text
            style={{
              fontFamily:
                "ethio",
              fontSize: 10,
            }}
          >
            Amount in Words:{" "}

            <Text
              style={{
                fontWeight:
                  "bold",
                fontSize: 10,
              }}
            >
              {convertToWordsWithCurrency(
                performaTotal
              )}{" "}
            </Text>
          </Text>
        </View>

        <View
          style={
            styles.summaryTable
          }
        >
          <View
            style={[
              styles.summaryTableRow,
              {
                borderBottomWidth: 1,
              },
            ]}
          >
            <View
              style={
                styles.summaryTableCol1
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                ጠቅላላ ድምር Total:
              </Text>
            </View>

            <View
              style={
                styles.summaryTableCol2
              }
            >
              <Text
                style={
                  styles.summaryValue
                }
              >
                {formatCurrency(
                  performaSubTotal
                )}
              </Text>
            </View>
          </View>

          {receipt !==
            "No Receipt" && (
              <View
                style={[
                  styles.summaryTableRow,
                  {
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <View
                  style={
                    styles.summaryTableCol1
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    ተ.እ.ታ VAT (15%):
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryTableCol2
                  }
                >
                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {formatCurrency(
                      performaVat
                    )}
                  </Text>
                </View>
              </View>
            )}

          {receipt !==
            "No Receipt" && (
              <View
                style={
                  styles.summaryTableRow
                }
              >
                <View
                  style={
                    styles.summaryTableCol1
                  }
                >
                  <Text
                    style={{
                      fontFamily:
                        "ethio",
                      fontSize: 10,
                      fontWeight:
                        "bold",
                    }}
                  >
                    ጠቅላላ ዋጋ ተ.እ.ታ ጨምሮ
                  </Text>

                  <Text
                    style={{
                      fontFamily:
                        "ethio",
                      fontSize: 8,
                      fontWeight:
                        "bold",
                    }}
                  >
                    Selling Price
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryTableCol2
                  }
                >
                  <Text
                    style={
                      styles.totalValue
                    }
                  >
                    {formatCurrency(
                      performaTotal
                    )}
                  </Text>
                </View>
              </View>
            )}
        </View>
      </View>

      <View
        style={{
          flexDirection:
            "row",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          paddingLeft: 13,
          paddingRight: 13,
        }}
      >
        <View
          style={
            styles.validitySection
          }
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight:
                "bold",
              fontFamily:
                "ethio",
            }}
          >
            ይህ ዋጋ ማቅረቢያ የሚያገለግለው ለ______________ ቀን ብቻ ነው።
          </Text>

          <Text
            style={{
              fontSize: 10,
            }}
          >
            The validity of this
            performa invoice is
            for ______________
            days only.
          </Text>
        </View>

        <View
          style={
            styles.signatureSection
          }
        >
          <View>
            <Text
              style={
                styles.signatureLine1
              }
            >
              ፊርማ ______________
            </Text>

            <Text
              style={
                styles.signatureText
              }
            >
              Signature
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  /*
   * ============================================================
   * CONDITION 1
   * No service charge
   *
   * Header is rendered ONLY when chunkIndex === 0.
   * Therefore pages 2+ contain only product rows.
   * ============================================================
   */
  if (isServiceChargesZero) {
    return (
      <Document>
        {itemChunks?.map(
          (
            chunk,
            chunkIndex
          ) => (
            <Page
              key={chunkIndex}
              size="A4"
              style={[
                styles.page,
                chunkIndex > 0
                  ? {
                    paddingTop: 30,
                    paddingBottom: 40,
                  }
                  : {
                    paddingBottom: 40,
                  },
              ]}
              wrap
            >
              {chunkIndex === 0 && (
                <>
                  {renderHeader()}
                </>
              )}

              <View
                style={
                  styles.tableContainer
                }
              >
                <View
                  style={
                    styles.table
                  }
                >
                  {/* HEADER ONLY ON FIRST PAGE */}
                  {chunkIndex === 0 &&
                    renderProductTableHeader()}

                  {chunk?.map(
                    (
                      item,
                      index
                    ) =>
                      renderNormalProductRow(
                        item,
                        index +
                        1 +
                        (chunkIndex >
                          0
                          ? itemsPerFirstPage +
                          (chunkIndex -
                            1) *
                          itemsPerPage
                          : 0),
                        `product-${chunkIndex}-${index}`
                      )
                  )}
                </View>
              </View>

              {chunkIndex ===
                itemChunks.length -
                1 &&
                renderSummary()}

              <FooterPdf fixed />
            </Page>
          )
        )}
      </Document>
    );
  }

  /*
   * ============================================================
   * CONDITION 2
   * Fixed service charge
   *
   * Header is rendered ONLY on first page.
   * ============================================================
   */
  if (
    Number(
      performaServiceCharge
    ) > 0
  ) {
    return (
      <Document>
        {itemChunks?.map(
          (
            chunk,
            chunkIndex
          ) => {
            const isLastChunk =
              chunkIndex ===
              itemChunks.length -
              1;

            return (
              <Page
                key={chunkIndex}
                size="A4"
                style={[
                  styles.page,
                  {
                    paddingTop: 30,
                    paddingBottom: 40,
                  },
                ]}
                wrap
              >
                {chunkIndex === 0 && (
                  <>
                    {renderHeader()}
                  </>
                )}

                <View
                  style={
                    styles.tableContainer
                  }
                >
                  <View
                    style={
                      styles.table
                    }
                  >
                    {/* HEADER ONLY ON FIRST PAGE */}
                    {chunkIndex === 0 &&
                      renderProductTableHeader()}

                    {chunk?.map(
                      (
                        item,
                        index
                      ) =>
                        renderNormalProductRow(
                          item,
                          index +
                          1 +
                          (chunkIndex >
                            0
                            ? itemsPerFirstPage +
                            (chunkIndex -
                              1) *
                            itemsPerPage
                            : 0),
                          `product-${chunkIndex}-${index}`
                        )
                    )}

                    {isLastChunk &&
                      renderFixedServiceChargeRow()}
                  </View>
                </View>

                {isLastChunk && (
                  <View
                    wrap={false}
                    breakBefore="avoid"
                  >
                    {renderSummary()}
                  </View>
                )}

                <FooterPdf fixed />
              </Page>
            );
          }
        )}
      </Document>
    );
  }

  /*
   * ============================================================
   * CONDITION 3
   * Product service charge
   *
   * Product table header is rendered ONLY on page 1.
   *
   * Service Charge title is rendered only on the page where
   * the service section starts.
   * ============================================================
   */

  const firstServiceChunkIndex =
    mergedChunks.findIndex(
      (chunk) =>
        chunk.some(
          (row) =>
            row.type ===
            "service"
        )
    );

  return (
    <Document>
      {mergedChunks.map(
        (
          chunk,
          chunkIndex
        ) => {
          const isLastChunk =
            chunkIndex ===
            mergedChunks.length -
            1;

          const firstServiceIndex =
            chunk.findIndex(
              (row) =>
                row.type ===
                "service"
            );

          const hasServiceRows =
            firstServiceIndex !==
            -1;

          const rowsBeforeService =
            hasServiceRows
              ? chunk.slice(
                0,
                firstServiceIndex
              )
              : chunk;

          const serviceRows =
            hasServiceRows
              ? chunk.slice(
                firstServiceIndex
              )
              : [];

          const getProductNumber = (
            originalIndex: number
          ) =>
            originalIndex + 1;

          const getServiceNumber = (
            originalIndex: number
          ) =>
            originalIndex + 1;

          /*
           * IMPORTANT:
           * Product table header appears ONLY on page 1.
           */
          const shouldRenderProductHeader =
            chunkIndex === 0;

          /*
           * Service Charge header appears only once,
           * on the first page where service rows begin.
           */
          const shouldRenderServiceHeader =
            chunkIndex ===
            firstServiceChunkIndex;

          return (
            <Page
              key={chunkIndex}
              size="A4"
              style={[
                styles.page,
                chunkIndex > 0
                  ? {
                    paddingTop: 30,
                    paddingBottom: 40,
                  }
                  : {
                    paddingBottom: 40,
                  },
              ]}
              wrap
            >
              {chunkIndex === 0 && (
                <>
                  {renderHeader()}
                </>
              )}

              <View
                style={
                  styles.tableContainer
                }
                breakBefore="avoid"
              >
                <View
                  style={
                    styles.table
                  }
                >
                  {/* PRODUCT TABLE HEADER ONLY ON FIRST PAGE */}
                  {shouldRenderProductHeader &&
                    renderProductTableHeaderNoPartNumber()}

                  {rowsBeforeService.map(
                    (row) => {
                      if (
                        row.type !==
                        "product"
                      ) {
                        return null;
                      }

                      return renderNormalProductRowNoPartNumber(
                        row.item,
                        getProductNumber(
                          row.originalIndex
                        ),
                        `product-${row.originalIndex}`
                      );
                    }
                  )}

                  {hasServiceRows && (
                    <>
                      {shouldRenderServiceHeader &&
                        renderMergedServiceHeader()}

                      {serviceRows.map(
                        (row) => {
                          if (
                            row.type !==
                            "service"
                          ) {
                            return null;
                          }

                          return renderServiceProductRowNoPartNumber(
                            row.item,
                            getServiceNumber(
                              row.originalIndex
                            ),
                            `service-${row.originalIndex}`
                          );
                        }
                      )}
                    </>
                  )}
                </View>
              </View>

              {isLastChunk && (
                <View
                  wrap={false}
                  breakBefore="avoid"
                >
                  {renderSummary()}
                </View>
              )}

              <FooterPdf fixed />
            </Page>
          );
        }
      )}
    </Document>
  );
};

export default ManagePerformaPdf;