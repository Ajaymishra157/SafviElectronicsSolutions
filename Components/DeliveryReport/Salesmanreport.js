import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import React, { useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import Subheader from '../Commoncomponent/Subheader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

const Salesmanreport = ({ navigation }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [data, setData] = useState([]);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const displayStartDate = formatDate(startDate);
    const displayEndDate = formatDate(endDate);

    const showStartDatePicker = () => {
        setShowStartDate(true);
    };

    const showEndDatePicker = () => {
        setShowEndDate(true);
    };

    const onStartDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        if (currentDate <= endDate) { // Ensure start date is not after end date
            setShowStartDate(false);
            setStartDate(currentDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        if (currentDate >= startDate) { // Ensure end date is not before start date
            setShowEndDate(false);
            setEndDate(currentDate);
        }
    };
    const today = new Date();

    const formatDateToDatabase = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
    };

    const fetchdeliverymanreport = async () => {
        setMainloading(true);
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);

        const url = `${Constant.URL}${Constant.OtherURL.salesmen_report}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
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
            fetchdeliverymanreport();
        }, [startDate, endDate])
    );

    const totalOrdersSum = data.reduce((sum, item) => sum + parseFloat(item.created_order || 0), 0);
    const totalBoxSum = data.reduce((sum, item) => sum + parseInt(item.order_qty || 0), 0);

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Salesman Report" />

            <View style={{ flex: 1, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10 }}>
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
                            value={startDate}
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
                            value={endDate}
                            mode="date"
                            is24Hour={false}
                            display="default"
                            onChange={onEndDateChange}
                            maximumDate={today}
                        />
                    )}
                </View>

                {mainloading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : (
                    <ScrollView style={{ flex: 1 }}>
                        {data && data.length > 0 ? (
                            <View style={{ marginHorizontal: 5, borderRadius: 10, padding: 0, marginBottom: 5, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '15%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>No</Text>
                                    </View>
                                    <View style={{ width: '45%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Name</Text>
                                    </View>
                                    <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Orders</Text>
                                    </View>
                                    <View style={{ width: '20%', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Box</Text>
                                    </View>
                                </View>

                                {data.map((item, index) => (
                                    <View key={index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                        <View style={{ width: '15%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{index + 1}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', width: '45%', borderRightWidth: 1, borderColor: '#173161', paddingLeft: 5, alignItems: 'center' }}>
                                            <Text style={{ width: '80%', color: '#173161', fontFamily: 'Inter-SemiBold', textAlign: 'left', fontSize: 12, textTransform: 'uppercase' }}>{item.name}</Text>
                                            <TouchableOpacity onPress={() => navigation.navigate('SalesmanreportDetails', { startdate: startDate, enddate: endDate, userid: item.user_id, name: item.name, created_order: item.created_order, order_qty: item.order_qty })} style={{ width: '20%', alignItems: 'center', paddingVertical: 5 }}>
                                                <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.created_order}</Text>
                                        </View>
                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.order_qty}</Text>
                                        </View>
                                    </View>
                                ))}

                                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                    <View style={{ width: '60%', borderRightWidth: 1, borderColor: '#173161', paddingLeft: 5, paddingVertical: 5 }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase', textAlign: 'center' }}>Total</Text>
                                    </View>
                                    <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{totalOrdersSum}</Text>
                                    </View>
                                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{totalBoxSum}</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 16, textAlign: 'center', marginTop: 10 }}>
                                No Records Found
                            </Text>
                        )}
                    </ScrollView>

                )}

            </View>
        </View>
    )
}

export default Salesmanreport