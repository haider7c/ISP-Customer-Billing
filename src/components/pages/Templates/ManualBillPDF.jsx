import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import logo from "../../../../assets/pdflogo.png";

// A7 size in points (width x height)
const A7_WIDTH = 2.9 * 72; // ~209
const A7_HEIGHT = 4.1 * 72; // ~295

Font.register({
  family: "Helvetica-Bold",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v15/sZlLxdL6pN4lAVxNmA.ttf" },
  ],
});

const styles = StyleSheet.create({
  page: {
    width: A7_WIDTH,
    height: A7_HEIGHT,
    padding: 10,
    fontSize: 10,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1pt solid #ddd",
  },
  titleBar: {
    textAlign: "center",
    paddingBottom: 5,
    borderBottom: "1pt dashed #999",
  },
  logo: {
    width: 90,
    height: 50,
    marginBottom: 4,
    alignSelf: "center",
  },
  table: {
    marginTop: 6,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottom: "1pt solid #eee",
  },
  label: {
    width: "55%",
    fontFamily: "Helvetica-Bold",
  },
  value: {
    width: "45%",
    textAlign: "right",
  },
  bold: {
    fontWeight: "bold",
  },
  footer: {
    fontSize: 8,
    textAlign: "center",
    borderTop: "1pt dashed #999",
    paddingTop: 6,
    marginTop: 6,
  },
});

const ManualBillPDF = ({ billData }) => {
  if (!billData) return null;

  const subtotal = billData.billAmount * billData.months;

  return (
    <Document>
      <Page style={styles.page} size={{ width: A7_WIDTH, height: A7_HEIGHT }}>
        {/* Header */}
        <View style={styles.titleBar}>
          <Image src={logo} style={styles.logo} />
          <Text>Manual Bill</Text>
        </View>

        {/* Content */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{billData.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{billData.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Package</Text>
            <Text style={styles.value}>{billData.packageName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Bill</Text>
            <Text style={styles.value}>Rs {billData.billAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Months</Text>
            <Text style={styles.value}>{billData.months}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>Rs {subtotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Connection Fee</Text>
            <Text style={styles.value}>Rs {billData.connectionFee}</Text>
          </View>

          {billData.additions?.length > 0 &&
            billData.additions.map((item, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.label}>{item.title}</Text>
                <Text style={styles.value}>Rs {item.amount}</Text>
              </View>
            ))}

          <View style={styles.row}>
            <Text style={[styles.label, styles.bold]}>Total</Text>
            <Text style={[styles.value, styles.bold]}>
              Rs {billData.totalAmount}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Ali Haider's Creation</Text>
          <Text>📞 0304-1275276</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ManualBillPDF;
