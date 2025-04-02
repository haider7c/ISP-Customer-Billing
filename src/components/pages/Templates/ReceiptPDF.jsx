import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

import logo from '../../../../assets/pdflogo.png';

// A7 dimensions in points
const A7_WIDTH = 2.9 * 72; // 209
const A7_HEIGHT = 4.1 * 72; // 295

Font.register({
  family: 'Helvetica-Bold',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v15/sZlLxdL6pN4lAVxNmA.ttf' },
  ],
});

const styles = StyleSheet.create({
  page: {
    width: A7_WIDTH,
    height: A7_HEIGHT,
    padding: 10,
    fontSize: 10,
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1pt solid #ddd',
  },
  titleBar: {
    textAlign: 'center',
    paddingBottom: 5,
    borderBottom: '1pt dashed #999',
    // marginBottom: 5,
  },
  logo: {
    width: 90,
    height: 50,
    marginBottom: 4,
    alignSelf: 'center',
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottom: '1pt solid #eee',
  },
  cellLabel: {
    width: '45%',
    fontFamily: 'Helvetica-Bold',
  },
  cellValue: {
    width: '55%',
    textAlign: 'right',
  },
  statusPaid: {
    color: 'green',
    fontWeight: 700,
  },
  statusUnpaid: {
    color: 'red',
    fontWeight: 700,
  },
  footer: {
    fontSize: 8,
    textAlign: 'center',
    borderTop: '1pt dashed #999',
    paddingTop: 6,
    marginTop: 6,
  },
});

const ReceiptPDF = ({ customer }) => {
  const {
    customerId,
    customerName,
    phone,
    cnic,
    packageName,
    amount,
    billStatus,
    paymentMethod,
    paymentNote,
    billReceiveDate,
  } = customer;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB');

  return (
    <Document>
      <Page style={styles.page} size={{ width: A7_WIDTH, height: A7_HEIGHT }}>
        {/* Logo + Title */}
        <View style={styles.titleBar}>
          <Image src={logo} style={styles.logo} />
          <Text>Billing Receipt</Text>
        </View>

        {/* Table Format */}
        <View style={styles.table}>

          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Customer ID</Text>
            <Text style={styles.cellValue}>{customerId}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Name</Text>
            <Text style={styles.cellValue}>{customerName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Phone</Text>
            <Text style={styles.cellValue}>{phone}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>CNIC</Text>
            <Text style={styles.cellValue}>{cnic}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Package</Text>
            <Text style={styles.cellValue}>{packageName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Amount</Text>
            <Text style={styles.cellValue}>Rs. {amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Status</Text>
            <Text
              style={[
                styles.cellValue,
                billStatus ? styles.statusPaid : styles.statusUnpaid,
              ]}
            >
              {billStatus ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Method</Text>
            <Text style={styles.cellValue}>{paymentMethod || 'N/A'}</Text>
          </View>
          {paymentNote && (
            <View style={styles.tableRow}>
              <Text style={styles.cellLabel}>Note</Text>
              <Text style={styles.cellValue}>{paymentNote}</Text>
            </View>
          )}
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Date</Text>
            <Text style={styles.cellValue}>{formatDate(billReceiveDate)}</Text>
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

export default ReceiptPDF;
