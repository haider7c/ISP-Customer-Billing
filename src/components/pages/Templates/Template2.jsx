import React from "react";
import {
  Page,
  Image,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import logo from "../../../../assets/logo.png";

// Register font for bold styling
Font.register({ family: "Helvetica-Bold", src: "Helvetica-Bold" });

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "white",
  },
  container: {
    marginHorizontal: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 40,
    width: "100%",
    borderBottom: 1,
    borderBottomColor: "black",
  },
  logoClass: {
    height: 50,
    width: 165,
  },
  section1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flex: 2,
    flexDirection: "column",
  },
  InvoiceHeadingContainer: {
    flex: 1,
    alignItems: "flex-end",
    flexDirection: "column",
  },
  InvoiceHeading: {
    fontSize: 20,
    letterSpacing: 4,
    marginLeft: 20,
    fontFamily: "Helvetica-Bold",
  },
  subInvoice: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 5,
    marginTop: 5,
    fontSize: 12,
  },
  subInvText: {
    width: "50%",
  },
  subInvVal: {
    width: "50%",
    textAlign: "right",
  },
  contactDet: {
    display: "flex",
    flexDirection: "column",
  },
  section2: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 20,
    borderTop: 1,
    borderTopColor: "black",
    borderBottom: 1,
    borderBottomColor: "black",
    alignItems: "center",
    marginTop: 10,
  },
  section3: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 20,
    borderBottom: 1,
    borderColor: "black",
    alignItems: "center",
    // marginVertical: 2,
  },
  section4: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 10,
  },
  sec4SubLeft: {
    width: "40%",
    flexDirection: "column",
  },
  sec4SubRight: {
    width: "60%",
    flexDirection: "column",
  },
  sec4Det: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    fontSize: 10,
    borderBottom: 1,
    borderBottomColor: "black",
  },
  btSection: {
    position: "absolute",
    bottom: -33,
    padding: 10,
    flexDirection: "row",
  },
  sec4Term: {
    display: "flex",
    flexDirection: "row",
    fontSize: 16,
    marginTop: 10,
  },
  vehicleCls: {
    width: "40%",
  },
  vehicleClsVal: {
    width: "60%",
    textAlign: "right",
  },
  newAddMain: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  invCont: {
    flexDirection: "column",
    width: "45%",
  },
});
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Add leading zero to day
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`; // Format: DD/MM/YYYY
};

const Template2 = ({ data }) => {
  return (
    <Document>
      <Page size={[420, 595]} style={styles.page}>
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.section1}>
            <View style={styles.logoContainer}>
              <View style={styles.newAddMain}>
                <Image src={logo} style={styles.logoClass} />
                <View style={styles.invCont}>
                  <Text style={styles.InvoiceHeading}>INVOICE</Text>
                  <View style={styles.subInvoice}>
                    <View style={styles.subInvText}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        BILL #
                      </Text>
                    </View>
                    <View style={styles.subInvVal}>
                      <Text>{data.serialNumb}</Text>
                    </View>
                  </View>
                  <View style={styles.subInvoice}>
                    <View style={styles.subInvText}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Date #
                      </Text>
                    </View>
                    <View style={styles.subInvVal}>
                      <Text>{formatDate(data.date)}</Text>
                    </View>
                  </View>
                  {data.vehicleReg && (
                    <View style={styles.subInvoice}>
                      <View style={styles.vehicleCls}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Vehicle #
                        </Text>
                      </View>
                      <View style={styles.vehicleClsVal}>
                        <Text>{data.vehicleReg}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.contactDet}>
                <Text style={{ fontSize: 12 }}>Invoice to:</Text>
                <Text
                  style={{
                    marginTop: 3,
                    fontSize: 14,
                    fontFamily: "Helvetica-Bold",
                  }}
                >
                  {data.billTo}
                </Text>
                <Text style={{ fontSize: 12, marginTop: 3 }}>Phone:</Text>
                <Text
                  style={{
                    marginTop: 3,
                    fontSize: 14,
                    fontFamily: "Helvetica-Bold",
                  }}
                >
                  {data.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Items Section */}

          <View style={{ marginTop: 10 }}>
            {data.items && data.items.length > 1 ? (
              <View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    fontSize: 10,
                    fontFamily: "Helvetica-Bold",
                    borderBottom: 1,
                    borderBottomColor: "black",
                    paddingBottom: 1,
                  }}
                >
                  <Text style={{}}>Item</Text>
                  <Text style={{ marginLeft: 50 }}>Qty</Text>
                  <Text style={{ marginLeft: 18 }}>Bharti</Text>
                  <Text style={{ marginLeft: 10 }}>Weight</Text>
                  <Text style={{ marginLeft: 10 }}>Kaat</Text>
                  <Text style={{ marginLeft: 15 }}>Safi</Text>
                  <Text style={{ marginLeft: 30 }}>Rate</Text>
                  <Text style={{ marginLeft: 45 }}>Amount</Text>
                </View>
                {data.items.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 5,
                      borderBottom: 1,
                      borderBottomColor: "black",
                      paddingVertical: 3,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        // alignItems: "center",
                        width: "15%",
                        borderRight: 1,
                        paddingRight: 2,
                        borderRightColor: "black",
                      }}
                    >
                      <Text style={{ fontSize: 10 }}>{item.description}</Text>
                    </View>
                    {item.quantity && (
                      <View
                        style={{
                          flexDirection: "column",
                          // alignItems: "center",
                          borderRight: 1,
                          width: "10%",
                          paddingRight: 2,
                          borderRightColor: "black",
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>
                          {item.quantity} Bag
                        </Text>
                      </View>
                    )}
                    {item.weight && (
                      <View
                        style={{
                          flexDirection: "column",
                          // alignItems: "center",
                          borderRight: 1,
                          paddingRight: 2,
                          width: "7%",
                          borderRightColor: "black",
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>{item.weight} kg</Text>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "column",
                        // alignItems: "center",
                        width: "10%",
                        borderRight: 1,
                        paddingRight: 2,
                        borderRightColor: "black",
                      }}
                    >
                      <Text style={{ fontSize: 10 }}>{item.kgWeight} kg</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "column",
                        // alignItems: "center",
                        borderRight: 1,
                        width: "7%",
                        paddingRight: 2,
                        borderRightColor: "black",
                      }}
                    >
                      <Text style={{ fontSize: 10 }}>{item.emptyBag} kg</Text>
                    </View>

                    {item.safiWeight && (
                      <View
                        style={{
                          flexDirection: "column",
                          // alignItems: "center",
                          borderRight: 1,
                          paddingRight: 2,
                          width: "10%",
                          borderRightColor: "black",
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>
                          {item.safiWeight} kg
                        </Text>
                      </View>
                    )}
                    {item.riceRate && (
                      <View
                        style={{
                          flexDirection: "column",
                          // alignItems: "center",
                          borderRight: 1,
                          width: "14%",
                          paddingRight: 2,
                          borderRightColor: "black",
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>
                          {item.riceRate}/{item.unit} kg
                        </Text>
                      </View>
                    )}
                    {item.safiWeight && item.riceRate && item.unit && (
                      <View
                        style={{
                          flexDirection: "column",
                          // alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>
                          {`${(
                            (item.safiWeight / item.unit) *
                            item.riceRate
                          ).toFixed(0)} Rs`}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : data.items.length === 1 ? (
              <View>
                <View style={styles.section2}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                    Item
                  </Text>
                  <Text style={{ fontSize: 10 }}>
                    {data.items[0].description}
                  </Text>
                </View>
                {data.items[0].quantity && (
                  <View style={styles.section3}>
                    <Text
                      style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                    >
                      Quantity
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                      {data.items[0].quantity} Bag
                    </Text>
                  </View>
                )}
                {data.items[0].weight && (
                  <View style={styles.section3}>
                    <Text
                      style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                    >
                      Bharti
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                      {data.items[0].weight} kg
                    </Text>
                  </View>
                )}
                {data.items[0].kgWeight && (
                  <View style={styles.section3}>
                    <Text
                      style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                    >
                      Weight
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                      {data.items[0].kgWeight} kg
                    </Text>
                  </View>
                )}
                {data.items[0].emptyBag && (
                  <View style={styles.section3}>
                    <Text
                      style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                    >
                      Khali Kat
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                      {data.items[0].emptyBag} kg
                    </Text>
                  </View>
                )}
                {data.items[0].safiWeight && (
                  <View style={styles.section3}>
                    <Text
                      style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                    >
                      Safi Weight
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                      {data.items[0].safiWeight} kg
                    </Text>
                  </View>
                )}
                {data.items[0].riceRate && (
                  <View style={styles.section3}>
                    <Text
                      style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                    >
                      Rate
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                      {data.items[0].riceRate} / {data.items[0].unit} kg
                    </Text>
                  </View>
                )}
                {data.items[0].safiWeight &&
                  data.items[0].riceRate &&
                  data.items[0].unit && (
                    <View style={styles.section3}>
                      <Text
                        style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}
                      >
                        Item Amount
                      </Text>
                      <Text style={{ fontSize: 10 }}>
                        {`${data.items[0].safiWeight}/${data.items[0].unit} * ${
                          data.items[0].riceRate
                        } = ${(
                          (data.items[0].safiWeight / data.items[0].unit) *
                          data.items[0].riceRate
                        ).toFixed(2)} Rs`}
                      </Text>
                    </View>
                  )}
              </View>
            ) : (
              <Text>No items available</Text>
            )}
          </View>

          {/* Items array New addition  */}
          {data.brokValue && (
            <View style={styles.section3}>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                Brokery
              </Text>
              <Text style={{ fontSize: 10 }}>
                {data.brokAddSub} {data.brokValue} Rs
              </Text>
            </View>
          )}
          {data.bardanaList[0]?.totalBardana > 0 ? (
            <View style={{ borderBottom: 1, borderBottomColor: "black" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Helvetica-Bold",
                  marginTop: 2,
                }}
              >
                Bardana:
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  fontSize: 10,
                  justifyContent: "space-between",
                  fontFamily: "Helvetica-Bold",
                  borderBottom: 1,
                  borderBottomColor: "black",
                  paddingBottom: 2,
                }}
              >
                <Text style={{ width: "55%" }}>Description</Text>
                <Text style={{ width: "15%", textAlign: "center" }}>Qty</Text>
                <Text style={{ width: "15%", textAlign: "center" }}>Rate</Text>
                <Text style={{ width: "15%", textAlign: "right" }}>Total</Text>
              </View>
              {data.bardanaList.map((bardana, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 10, width: "55%" }}>
                    {bardana.bardanaDesc}
                  </Text>
                  <Text
                    style={{ fontSize: 10, width: "15%", textAlign: "center" }}
                  >
                    {bardana.bardanaQty || "0"}
                  </Text>
                  <Text
                    style={{ fontSize: 10, width: "15%", textAlign: "center" }}
                  >
                    {bardana.addBardana || "0"}
                  </Text>
                  <Text
                    style={{ fontSize: 10, width: "15%", textAlign: "right" }}
                  >
                    {bardana.totalBardana || "0"}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section3}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
              Sub Total
            </Text>
            <Text style={{ fontSize: 10 }}>
              {`${data.items
                .map(
                  (item) =>
                    (item?.safiWeight / (item?.unit || 1)) *
                      (item?.riceRate || 0) -
                    (data.brokValue || 0)
                )
                .reduce((sum, value) => sum + value, 0)
                .toFixed(0)} Rs`}
            </Text>
          </View>

          {data.slaeList[0]?.totalSlae > 0 ? (
            <View style={{ borderBottom: 1, borderBottomColor: "black" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Helvetica-Bold",
                  marginTop: 2,
                }}
              >
                Salae:
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  fontSize: 10,
                  justifyContent: "space-between",
                  fontFamily: "Helvetica-Bold",
                  borderBottom: 1,
                  borderBottomColor: "black",
                  paddingBottom: 2,
                }}
              >
                <Text style={{ width: "55%" }}>Description</Text>
                <Text style={{ width: "15%", textAlign: "center" }}>Qty</Text>
                <Text style={{ width: "15%", textAlign: "center" }}>
                  Labour
                </Text>
                <Text style={{ width: "15%", textAlign: "right" }}>Total</Text>
              </View>
              {data.slaeList.map((slae, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 10, width: "55%" }}>
                    {slae.slaeDesc}
                  </Text>
                  <Text
                    style={{ fontSize: 10, width: "15%", textAlign: "center" }}
                  >
                    {slae.slaeQty || "0"}
                  </Text>
                  <Text
                    style={{ fontSize: 10, width: "15%", textAlign: "center" }}
                  >
                    {slae.labourCost || "0"}
                  </Text>
                  <Text
                    style={{ fontSize: 10, width: "15%", textAlign: "right" }}
                  >
                    {slae.totalSlae || "0"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            ""
          )}

          {data.transpExp && (
            <View style={styles.section3}>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                Transportation Expense
              </Text>
              <Text style={{ fontSize: 10 }}>
                {data.transpAction} {data.transpExp} Rs
              </Text>
            </View>
          )}

          {/* Terms and Totals Section */}
          <View style={styles.section4}>
            <View style={styles.sec4SubLeft}>
              {data.notes && (
                <View style={styles.sec4Term}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>
                    Note:{" "}
                  </Text>
                  <Text style={{ fontSize: 10, width: 70 }}>{data.notes}</Text>
                </View>
              )}
              {data.terms && (
                <View style={styles.sec4Term}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>
                    Terms:{" "}
                  </Text>
                  <Text style={{ fontSize: 10, width: 70 }}>{data.terms}</Text>
                </View>
              )}
            </View>
            <View style={styles.sec4SubRight}>
              {data.prevDue && (
                <View style={styles.sec4Det}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    Last Dues:
                  </Text>
                  <Text>
                    {data.prevDueAction}{" "}
                    {typeof data.prevDue === "number"
                      ? data.prevDue.toFixed(0)
                      : "0"}{" "}
                    Rs
                  </Text>
                </View>
              )}

              <View style={styles.sec4Det}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Total:</Text>
                <Text>
                  {typeof data.total === "number" ? data.total.toFixed(0) : "0"}{" "}
                  Rs
                </Text>
              </View>

              {data.amountPaid && (
                <View style={styles.sec4Det}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    Amount Paid:
                  </Text>
                  <Text>{data.amountPaid} Rs</Text>
                </View>
              )}
              {data.balanceDue && (
                <View style={styles.sec4Det}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    Balance Due:
                  </Text>
                  <Text>{data.balanceDue.toFixed(0)} Rs</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.btSection}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
              Phone:
            </Text>
            <Text style={{ marginLeft: 3, fontSize: 10 }}>03157484638</Text>
            <Text
              style={{
                marginLeft: 10,
                fontSize: 10,
                fontFamily: "Helvetica-Bold",
              }}
            >
              Address:
            </Text>
            <Text style={{ marginLeft: 3, fontSize: 10 }}>
              Sadhar Bypass Chabba Road, Faisalabad
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Template2;
