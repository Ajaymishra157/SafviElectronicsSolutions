import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import React, { useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import Subheader from '../Commoncomponent/Subheader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';

const FestivePayementReport = ({ navigation }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [stafflist, setStafflist] = useState([]);
    const [selectedstaff, setSelectedStaff] = useState(null);
    const [data, setData] = useState([]);

    const liststaff = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_staff}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // customer_id: customerid
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            const formattedItems = result.payload.map((item) => ({
                label: item.staff_name,
                value: item.staff_id,
            }));
            setStafflist(formattedItems);
        } else {
            setStafflist([]);
            console.log('error while listing category');
        }
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const displayStartDate = startDate ? formatDate(startDate) : 'dd/mm/yyyy';
    const displayEndDate = endDate ? formatDate(endDate) : 'dd/mm/yyyy';

    const showStartDatePicker = () => {
        setShowStartDate(true);
    };

    const showEndDatePicker = () => {
        setShowEndDate(true);
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartDate(false); // always close picker
        if (selectedDate) {
            if (!endDate || selectedDate <= endDate) {
                setStartDate(selectedDate);
            }
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDate(false); // always close picker
        if (selectedDate) {
            if (!startDate || selectedDate >= startDate) {
                setEndDate(selectedDate);
            }
        }
    };
    const today = new Date();

    const formatDateToDatabase = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
    };

    const fetchpaymentreport = async () => {
        setMainloading(true);
        const formattedstartDate = startDate ? formatDateToDatabase(startDate) : '';
        const formattedendDate = endDate ? formatDateToDatabase(endDate) : '';

        const url = `${Constant.URL}${Constant.OtherURL.paymentlist}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                staff_id: selectedstaff ? selectedstaff : ''
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
        } else {
            setData([]);
            console.log('error while fetching data');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            if ((startDate && endDate) || (!startDate && !endDate)) {
                fetchpaymentreport();
            }
        }, [startDate, endDate, selectedstaff])
    );

    useFocusEffect(
        React.useCallback(() => {
            liststaff();
        }, [])
    );

    // Helper to convert string to number safely (remove commas if present)
    const toNumber = (value) => {
        if (!value) return 0;
        return Number(value.toString().replace(/,/g, '')) || 0;
    };

    // Totals
    const totalQty = data.reduce((sum, item) => sum + toNumber(item.total_qty), 0);
    const totalPrice = data.reduce((sum, item) => sum + toNumber(item.total_price), 0);
    const totalCash = data.reduce((sum, item) => sum + toNumber(item.cash_amount), 0);
    const totalOnline = data.reduce((sum, item) => sum + toNumber(item.online_amount), 0);
    const totalBaki = data.reduce((sum, item) => sum + toNumber(item.baki_amount), 0);
    const totalLoss = data.reduce((sum, item) => sum + toNumber(item.loss_amount), 0);

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Payment Report" />

            <View style={{ flex: 1, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5 }}>
                    {/* Start Date Button */}
                    <TouchableOpacity onPress={showStartDatePicker} style={{ width: '48%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 10, padding: 15 }}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayStartDate}</Text>
                    </TouchableOpacity>

                    {/* End Date Button */}
                    <TouchableOpacity onPress={showEndDatePicker} style={{ width: '48%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 10, padding: 15 }}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayEndDate}</Text>
                    </TouchableOpacity>

                    {/* Start Date Picker */}
                    {showStartDate && (
                        <DateTimePicker
                            value={startDate || today}
                            mode="date"
                            is24Hour={false}
                            display="default"
                            onChange={onStartDateChange}
                            maximumDate={today}
                        />
                    )}

                    {/* End Date Picker */}
                    {showEndDate && (
                        <DateTimePicker
                            value={endDate || today}
                            mode="date"
                            is24Hour={false}
                            display="default"
                            onChange={onEndDateChange}
                            maximumDate={today}
                        />
                    )}
                </View>

                <Dropdown
                    data={stafflist}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Staff"
                    placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                    selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                    value={selectedstaff}
                    onChange={item => {
                        setSelectedStaff(item.value);
                    }}
                    style={{
                        height: 50,
                        borderColor: 'gray',
                        borderWidth: 0.5,
                        borderRadius: 10,
                        paddingHorizontal: 15,
                        marginBottom: 5,
                        marginHorizontal: 5,
                        // backgroundColor: '#fff'
                    }}
                    renderItem={item => {
                        const isSelected = item.value === selectedstaff;
                        return (
                            <View style={{ padding: 8, paddingHorizontal: 12, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>
                                    {item.label}
                                </Text>
                            </View>
                        );
                    }}
                />

                {mainloading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : (
                    <ScrollView keyboardShouldPersistTaps='handled' style={{ flex: 1 }}>
                        <ScrollView horizontal keyboardShouldPersistTaps='handled'>
                            {data && data.length > 0 ? (
                                <View style={{ marginHorizontal: 5, borderRadius: 10, padding: 0, marginBottom: 5, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: 40, borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>No</Text>
                                        </View>

                                        <View style={{ width: 100, borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Date</Text>
                                        </View>

                                        <View style={{ width: 100, borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Name</Text>
                                        </View>
                                        <View style={{ width: 80, borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Box</Text>
                                        </View>
                                        <View style={{ width: 100, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', }}>Price</Text>
                                        </View>
                                        <View style={{ width: 100, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', }}>Cash Amt</Text>
                                        </View>
                                        <View style={{ width: 100, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>UPI Amt</Text>
                                        </View>
                                        <View style={{ width: 80, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Baki Amt</Text>
                                        </View>
                                        <View style={{ width: 80, paddingVertical: 10, alignItems: 'center', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Loss Amt</Text>
                                        </View>
                                    </View>

                                    {data.map((item, index) => (
                                        <View key={index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                            <View style={{ width: 40, borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{index + 1}</Text>
                                            </View>

                                            <View style={{ width: 100, borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }}>  {item.entry_date.split(" ")[0].split("-").join("/")}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', width: 100, borderRightWidth: 1, borderColor: '#173161', paddingLeft: 5, alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', textAlign: 'left', fontSize: 12, textTransform: 'uppercase' }}>{item.staff_name}</Text>
                                            </View>
                                            <View style={{ width: 80, borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase', textAlign: 'center' }}>{item.total_qty.replace(',', ',\n')}</Text>
                                            </View>
                                            <View style={{ width: 100, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.total_price}</Text>
                                            </View>
                                            <View style={{ width: 100, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.cash_amount}</Text>
                                            </View>
                                            <View style={{ width: 100, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.online_amount}</Text>
                                            </View>
                                            <View style={{ width: 80, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.baki_amount}</Text>
                                            </View>
                                            <View style={{ width: 80, justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.loss_amount}</Text>
                                            </View>
                                        </View>
                                    ))}

                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', }}>
                                        <View style={{ width: 320, borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Total</Text>
                                        </View>

                                        <View style={{ width: 100, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', }}>{totalPrice}</Text>
                                        </View>
                                        <View style={{ width: 100, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', }}>{totalCash}</Text>
                                        </View>
                                        <View style={{ width: 100, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>{totalOnline}</Text>
                                        </View>
                                        <View style={{ width: 80, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>{totalBaki}</Text>
                                        </View>
                                        <View style={{ width: 80, paddingVertical: 10, alignItems: 'center', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>{totalLoss}</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 16, textAlign: 'center', marginTop: 10 }}>
                                    No Records Found
                                </Text>
                            )}
                        </ScrollView>
                    </ScrollView>

                )}

            </View>
        </View>
    )
}

export default FestivePayementReport