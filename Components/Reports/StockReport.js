import {
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker';
import Constant from '../Commoncomponent/Constant';
import Icon from 'react-native-vector-icons/FontAwesome';

const StockReport = () => {
    const navigation = useNavigation();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const validateDates = () => {
        if (startDate > endDate) {
            // Alert.alert('Invalid Dates', 'Start date cannot be after end date');
            return false;
        }
        return true;
    };

    const fetchSalesReport = async () => {
        if (!validateDates()) return;

        setLoading(true);
        try {
            const payload = {
                start_date: formatDate(startDate),
                end_date: formatDate(endDate)
            };

            console.log('📤 API Payload:', payload);

            // ✅ Yahan apni API URL daalna
            const response = await fetch(`${Constant.URL}${Constant.OtherURL.stock_report}`, { // ✅ Sales report URL change karna
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log('📥 API Response:', result);

            if (result.code === 200) {
                setReportData(result);
            } else {
                console.log(result.message || 'Failed to fetch report');
                setReportData(null);
            }

        } catch (error) {
            console.log('❌ API Error:', error);

        } finally {
            setLoading(false);
        }
    };

    const formatDisplayDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6FA' }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />

            {/* Header */}
            <View style={{
                backgroundColor: '#173161',
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/arrow_back.png')}
                        style={{ height: 25, width: 25, tintColor: '#FFF' }}
                    />
                </TouchableOpacity>
                <Text style={{
                    color: '#FFF',
                    fontFamily: 'Inter-Bold',
                    fontSize: 16,
                }}>
                    Stock Report
                </Text>
                <Text style={{
                    color: '#173161',
                    fontFamily: 'Inter-Regular',
                    fontSize: 18,
                }}>
                    ..
                </Text>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps='handled'>
                {/* Date Selection Card */}
                <View style={{
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontFamily: 'Inter-Bold',
                        color: '#173161',
                        marginBottom: 16,
                    }}>
                        Select Date Range
                    </Text>

                    {/* Start Date */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'Inter-Medium',
                            color: '#666',
                            marginBottom: 8,
                        }}>
                            Start Date
                        </Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderWidth: 1,
                                borderColor: '#DDD',
                                borderRadius: 8,
                                padding: 12,
                                backgroundColor: '#F9F9F9',
                            }}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'Inter-Medium',
                                color: '#333',
                            }}>
                                {formatDisplayDate(startDate)}
                            </Text>
                            <Image
                                source={require('../../assets/calendar.png')}
                                style={{ height: 20, width: 20, tintColor: '#173161' }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* End Date */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'Inter-Medium',
                            color: '#666',
                            marginBottom: 8,
                        }}>
                            End Date
                        </Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderWidth: 1,
                                borderColor: '#DDD',
                                borderRadius: 8,
                                padding: 12,
                                backgroundColor: '#F9F9F9',
                            }}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'Inter-Medium',
                                color: '#333',
                            }}>
                                {formatDisplayDate(endDate)}
                            </Text>
                            <Image
                                source={require('../../assets/calendar.png')}
                                style={{ height: 20, width: 20, tintColor: '#173161' }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Generate Report Button */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#173161',
                            borderRadius: 8,
                            padding: 16,
                            alignItems: 'center',
                            marginTop: 8,
                        }}
                        onPress={fetchSalesReport}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={{
                                color: '#FFF',
                                fontSize: 16,
                                fontFamily: 'Inter-Bold',
                            }}>
                                Generate Report
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Report Data Display */}
                {reportData && (
                    <View>


                        {/* Main Table */}
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

                            {/* HEADER WITH TITLE */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 5
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontFamily: 'Inter-Bold',
                                    color: '#173161',
                                }}>
                                    Product-wise Stock
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
                                    paddingHorizontal: 6,
                                }}>#</Text>

                                <Text style={{
                                    flex: 2,
                                    color: '#FFF',
                                    fontFamily: 'Inter-Bold',
                                    paddingLeft: 8,
                                    borderRightWidth: 1,
                                    borderColor: 'white',
                                    paddingVertical: 10,
                                    paddingHorizontal: 6,
                                }}>Product</Text>

                                <Text style={{
                                    flex: 1.2,
                                    color: '#FFF',
                                    fontFamily: 'Inter-Bold',
                                    textAlign: 'center',
                                    paddingRight: 8,
                                    borderRightWidth: 1,
                                    borderColor: 'white',
                                    paddingVertical: 10,
                                    paddingHorizontal: 6,
                                }}>Purchased</Text>

                                <Text style={{
                                    flex: 1,
                                    color: '#FFF',
                                    fontFamily: 'Inter-Bold',
                                    textAlign: 'center',
                                    paddingRight: 8,
                                    borderRightWidth: 1,
                                    borderColor: 'white',
                                    paddingVertical: 10,
                                    paddingHorizontal: 6,
                                }}>Sale</Text>

                                <Text style={{
                                    flex: 1.4,
                                    color: '#FFF',
                                    fontFamily: 'Inter-Bold',
                                    textAlign: 'center',
                                    paddingRight: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 6,
                                }}>Available</Text>
                            </View>

                            {/* ===== TABLE BODY ===== */}
                            {reportData.payload?.map((item, index) => (
                                <View key={item.product_id}
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: index % 2 === 0 ? '#F7F9FC' : '#FFF',
                                        borderLeftWidth: 1,
                                        borderRightWidth: 1,
                                        borderBottomWidth: 1,
                                        borderColor: 'black',
                                    }}
                                >
                                    {/* Sr No */}
                                    <Text style={{
                                        flex: 0.4,
                                        fontFamily: 'Inter-Medium',
                                        color: 'black',
                                        textAlign: 'center',
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                        borderRightWidth: 1,
                                        borderColor: 'black',
                                    }}>
                                        {index + 1}
                                    </Text>

                                    {/* Product Name + Info Icon */}
                                    <View style={{
                                        flex: 2,
                                        position: 'relative', // 👈 FIX ADDED
                                        justifyContent: 'center',
                                        paddingLeft: 8,
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                        borderRightWidth: 1,
                                        borderColor: 'black',
                                    }}>
                                        <Text style={{
                                            fontFamily: 'Inter-Medium',
                                            color: 'black',
                                            paddingRight: 30,   // icon ke liye space
                                        }}>
                                            {item.product_name}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.navigate("StockReportList", {
                                                    productId: item.product_id,
                                                    productName: item.product_name,
                                                    startDate: formatDate(startDate),
                                                    endDate: formatDate(endDate)
                                                })
                                            }

                                            style={{
                                                position: 'absolute',
                                                right: 6,
                                                top: '50%',
                                                transform: [{ translateY: -9 }],
                                                padding: 5,
                                            }}
                                        >
                                            <Icon name="info-circle" size={18} color="#173161" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Amount */}
                                    <Text style={{
                                        flex: 1.2,
                                        fontFamily: 'Inter-Medium',
                                        textAlign: 'center',
                                        color: 'black',
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                        borderRightWidth: 1,
                                        borderColor: 'black',
                                    }}>
                                        {item.purchase || 0}
                                    </Text>

                                    {/* Qty */}
                                    <Text style={{
                                        flex: 1,
                                        fontFamily: 'Inter-Bold',
                                        textAlign: 'center',
                                        color: 'black',
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                        borderRightWidth: 1,
                                        borderColor: 'black',
                                    }}>
                                        {item.sale}
                                    </Text>

                                    {/* Total */}
                                    <Text style={{
                                        flex: 1.4,
                                        fontFamily: 'Inter-Bold',
                                        textAlign: 'center',
                                        color: '#4CAF50',
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                    }}>
                                        {item.available}
                                    </Text>
                                </View>
                            ))}

                            {/* ===== FOOTER ===== */}
                            {/* <View style={{
                                flexDirection: 'row',
                                borderWidth: 1,
                                borderColor: '#173161',
                                backgroundColor: '#F0F4FF',
                                borderTopWidth: 0
                            }}>
                                <Text style={{
                                    flex: 4.250,
                                    fontFamily: 'Inter-Bold',
                                    color: '#173161',
                                    paddingLeft: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 6,
                                    borderRightWidth: 1,
                                    borderColor: '#173161',
                                }}>
                                    TOTAL
                                </Text>



                                <Text style={{
                                    flex: 1,
                                    fontFamily: 'Inter-Bold',
                                    textAlign: 'center',
                                    color: '#173161',
                                    paddingRight: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 6,
                                    borderRightWidth: 1,
                                    borderColor: '#173161',
                                }}>
                                    {reportData.total_quantity || 0}
                                </Text>

                                <Text style={{
                                    flex: 1.4,
                                    fontFamily: 'Inter-Bold',
                                    textAlign: 'center',
                                    color: '#173161',
                                    paddingRight: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 6,
                                }}>
                                    ₹{reportData.total_amount || 0}
                                </Text>
                            </View> */}

                        </View>

                    </View>
                )}

                {/* No Data Message */}
                {!reportData && !loading && (
                    <View style={{
                        backgroundColor: '#FFF',
                        borderRadius: 12,
                        padding: 24,
                        alignItems: 'center',
                        marginBottom: 16,
                    }}>
                        <Image
                            source={require('../../assets/nodata.png')} // ✅ Apna no data image daalna
                            style={{ height: 80, width: 80, marginBottom: 16 }}
                        />
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'Inter-Medium',
                            color: '#666',
                            textAlign: 'center',
                        }}>
                            Select date range and generate report to view sales data
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Date Pickers */}
            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                    maximumDate={new Date()}
                />
            )}

            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                    maximumDate={new Date()}
                    minimumDate={startDate}
                />
            )}
        </View>
    )
}

export default StockReport