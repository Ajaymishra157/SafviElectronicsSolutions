import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    ActivityIndicator
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import Constant from "../Commoncomponent/Constant";

const SalesReportList = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { productId, productName, startDate: paramStartDate, endDate: paramEndDate } = route.params;

    // 🔹 State variables with values from params (read-only)
    const [startDate, setStartDate] = useState(new Date(paramStartDate));
    const [endDate, setEndDate] = useState(new Date(paramEndDate));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const formatDisplayDate = (date) => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    // Auto-fetch report when component mounts
    useEffect(() => {
        fetchCustomerReport();
    }, []);

    const fetchCustomerReport = async () => {
        setLoading(true);

        try {
            const payload = {
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                product_id: productId,
            };

            console.log("📤 Payload:", payload);

            const response = await fetch(
                `${Constant.URL}${Constant.OtherURL.detail_sales_report}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();
            console.log("📥 Response:", result);

            if (result.code === 200) setReportData(result);
            else {
                console.log(result.message);
                setReportData(null);
            }
        } catch (err) {
            console.log("❌ Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F4F6FA" }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />

            {/* HEADER */}
            <View style={{
                backgroundColor: "#173161",
                height: 50,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 10
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require("../../assets/arrow_back.png")}
                        style={{ width: 25, height: 25, tintColor: "#fff" }}
                    />
                </TouchableOpacity>

                <Text style={{ color: "#fff", fontFamily: "Inter-Bold", fontSize: 16 }}>
                    {productName}
                </Text>

                <Text style={{ color: "#173161" }}>..</Text>
            </View>

            <ScrollView style={{ padding: 16 }}>

                {/* DATE DISPLAY CARD (Read-only) */}
                <View style={{
                    backgroundColor: "#fff",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 16,
                    elevation: 3
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontFamily: 'Inter-Bold',
                        color: '#173161',
                        marginBottom: 12,
                        textAlign: 'center'
                    }}>
                        Selected Date Range
                    </Text>

                    {/* START DATE */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <Text style={{
                            fontFamily: "Inter-Medium",
                            fontSize: 14,
                            color: "#666",
                            marginRight: 6
                        }}>Start Date:</Text>
                        <Text style={{
                            fontSize: 14,
                            color: "#333",
                            fontFamily: "Inter-Medium",
                        }}>
                            {formatDisplayDate(startDate)}
                        </Text>
                    </View>

                    {/* END DATE */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <Text style={{
                            fontFamily: "Inter-Medium",
                            fontSize: 14,
                            color: "#666",
                            marginRight: 6
                        }}>End Date:</Text>
                        <Text style={{
                            fontSize: 14,
                            color: "#333",
                            fontFamily: "Inter-Medium",
                        }}>
                            {formatDisplayDate(endDate)}
                        </Text>
                    </View>


                </View>

                {/* TABLE */}
                {reportData && (
                    <View style={{
                        backgroundColor: '#FFF',
                        borderRadius: 12,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                    }}>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            paddingVertical: 5,
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'Inter-Bold',
                                color: '#173161',
                            }}>
                                Customer-wise Sales
                            </Text>
                        </View>

                        {/* ===== TABLE HEADER ===== */}
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: '#173161',
                        }}>
                            <Text style={{
                                flex: 0.4,
                                color: '#FFF',
                                fontFamily: 'Inter-Bold',
                                textAlign: 'center',
                                borderRightWidth: 1,
                                borderColor: 'white',
                                paddingVertical: 10,
                            }}>#</Text>

                            <Text style={{
                                flex: 2.2,
                                color: '#FFF',
                                fontFamily: 'Inter-Bold',
                                paddingLeft: 8,
                                borderRightWidth: 1,
                                borderColor: 'white',
                                paddingVertical: 10,
                            }}>Customer</Text>

                            <Text style={{
                                flex: 1,
                                color: '#FFF',
                                fontFamily: 'Inter-Bold',
                                textAlign: 'center',
                                borderRightWidth: 1,
                                borderColor: 'white',
                                paddingVertical: 10,
                            }}>Qty</Text>

                            <Text style={{
                                flex: 1.4,
                                color: '#FFF',
                                fontFamily: 'Inter-Bold',
                                textAlign: 'center',
                                paddingVertical: 10,
                            }}>Total</Text>
                        </View>

                        {/* ===== TABLE BODY ===== */}
                        {reportData.payload.map((item, i) => (
                            <View key={i} style={{
                                flexDirection: "row",
                                backgroundColor: i % 2 === 0 ? "#F7F9FC" : "#FFF",
                                borderLeftWidth: 1,
                                borderRightWidth: 1,
                                borderBottomWidth: 1,
                                borderColor: "black",

                            }}>

                                <Text style={{
                                    flex: 0.4,
                                    textAlign: "center",
                                    paddingVertical: 10,
                                    borderRightWidth: 1,
                                    borderColor: "black",
                                    color: 'black',
                                    fontFamily: 'Inter-Regular'
                                }}>
                                    {i + 1}
                                </Text>

                                <Text style={{
                                    flex: 2.2,
                                    paddingVertical: 10,
                                    paddingLeft: 8,
                                    borderRightWidth: 1,
                                    borderColor: "black",
                                    color: 'black',
                                    fontFamily: 'Inter-Regular'
                                }}>
                                    {item.customer_name}
                                </Text>

                                <Text style={{
                                    flex: 1,
                                    textAlign: "center",
                                    paddingVertical: 10,
                                    borderRightWidth: 1,
                                    borderColor: "black",
                                    color: 'black',
                                    fontFamily: 'Inter-Regular'
                                }}>
                                    {item.item_quantity}
                                </Text>

                                <Text style={{
                                    flex: 1.4,
                                    textAlign: "center",
                                    paddingVertical: 10,
                                    color: "#4CAF50",
                                }}>
                                    ₹{item.item_amount}
                                </Text>
                            </View>
                        ))}

                        {/* ===== FOOTER ===== */}
                        <View style={{
                            flexDirection: "row",
                            borderWidth: 1,
                            borderColor: "#173161",
                            backgroundColor: "#F0F4FF",
                            borderTopWidth: 0,

                        }}>
                            <Text style={{
                                flex: 2.6,
                                paddingVertical: 12,
                                paddingLeft: 8,
                                fontFamily: "Inter-Bold",
                                borderRightWidth: 1,
                                borderColor: "#173161",
                                color: "#173161",
                            }}>
                                TOTAL
                            </Text>

                            <Text style={{
                                flex: 1,
                                textAlign: "center",
                                paddingVertical: 12,
                                borderRightWidth: 1,
                                borderColor: "#173161",
                                fontFamily: "Inter-Bold",
                                color: "#173161",
                            }}>
                                {reportData.total_quantity}
                            </Text>

                            <Text style={{
                                flex: 1.4,
                                textAlign: "center",
                                paddingVertical: 12,
                                fontFamily: "Inter-Bold",
                                color: "#173161",
                            }}>
                                ₹{reportData.total_amount}
                            </Text>
                        </View>

                    </View>
                )}

                {/* LOADING */}
                {loading && (
                    <View style={{ alignItems: 'center', padding: 20 }}>
                        <ActivityIndicator size="large" color="#173161" />
                        <Text style={{ marginTop: 10, color: '#666' }}>Loading report...</Text>
                    </View>
                )}

                {/* NO DATA */}
                {!reportData && !loading && (
                    <View style={{ backgroundColor: "#fff", padding: 24, borderRadius: 12, alignItems: "center" }}>
                        <Image source={require("../../assets/nodata.png")} style={{ width: 80, height: 80, marginBottom: 12 }} />
                        <Text style={{ fontSize: 16, color: "#666" }}>No data found for selected period</Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
};

export default SalesReportList;