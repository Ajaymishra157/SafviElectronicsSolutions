import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import DateTimePicker from '@react-native-community/datetimepicker';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';

const Deliveryreport = ({ navigation }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [data, setData] = useState([]);
    const [mainloading, setMainloading] = useState(false);

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

    const fetchdata = async () => {
        setMainloading(true);
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const url = `${Constant.URL}${Constant.OtherURL.delivered_report}`;
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
            fetchdata();
        }, [startDate, endDate])
    );

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    if (data) {
        return (
            <View style={{ flex: 1 }}>
                <Subheader headername='Delivery Report' />

                <View style={{ flex: 1, marginHorizontal: 10 }}>
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

                    <View style={{ borderRadius: 10, padding: 10, marginBottom: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff' }}>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', width: '100%', paddingBottom: 10 }}>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Delivery: {data.cash_count + data.baki_count + data.bank_transfer_count + data.upi_count}</Text>
                        </View>
                        {data.cash_count > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Cash Delivery: {data.cash_count}</Text>
                            </View>)}
                        {data.baki_count > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Baki Delivery: {data.baki_count}</Text>
                            </View>)}
                        {data.bank_transfer_count > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Bank Transfer Delivery: {data.bank_transfer_count}</Text>
                            </View>)}

                        {data.upi_count > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>UPI Delivery: {data.upi_count}</Text>
                            </View>)}
                    </View>

                    <ScrollView keyboardShouldPersistTaps='handled'>
                        <View style={{ borderRadius: 10, padding: 10, marginBottom: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff' }}>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', width: '100%', paddingBottom: 10 }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Amount: {data.cash_amount + data.baki_amount + data.bank_transfer_amount + data.old_cash_amount + data.old_bank_amount}</Text>
                            </View>
                            {data.cash_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Cash Amount: {data.cash_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'Cash' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>)}
                            {data.baki_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Baki Amount: {data.baki_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'Baki' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>)}
                            {data.bank_transfer_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Bank Transfer Amount: {data.bank_transfer_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'Bank Transfer' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>)}

                            {data.upi_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>UPI Amount: {data.upi_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'UPI' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>)}

                            {data.old_cash_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Old Cash: {data.old_cash_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'Old Cash' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>)}
                            {data.old_bank_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Old Bank Transfer: {data.old_bank_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'Old Bank Transfer' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {data.old_upi_amount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Old UPI: {data.old_upi_amount}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Paymentcollection', { startdate: startDate, enddate: endDate, mode: 'Old Upi' })}>
                                        <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                    </TouchableOpacity>
                                </View>)}

                            {(data.old_cash_amount > 0 || data.cash_amount > 0) &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Old Cash: {data.old_cash_amount} + Today Cash: {data.cash_amount} = Total: {data.old_cash_amount + data.cash_amount}</Text>
                                </View>
                            }
                            {(data.old_bank_amount > 0 || data.bank_transfer_amount > 0) &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Old Bank Transfer: {data.old_bank_amount} + Today Bank Transfer: {data.bank_transfer_amount} = Total: {data.old_bank_amount + data.bank_transfer_amount}</Text>
                                </View>
                            }

                            {(data.old_upi_amount > 0 || data.upi_amount > 0) &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Old UPI: {data.old_upi_amount} + Today UPI: {data.upi_amount} = Total: {data.old_upi_amount + data.upi_amount}</Text>
                                </View>
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

export default Deliveryreport