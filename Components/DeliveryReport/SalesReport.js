import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import Subheader from '../Commoncomponent/Subheader';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import { Modal } from 'react-native-paper';

const SalesReport = ({ navigation }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [data, setData] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(null);
    const [totalqty, setTotalqty] = useState(null);
    const [totalamt, setTotalamt] = useState(null);
    const [todayqty, setTodayqty] = useState(null);
    const [todayamt, setTodayamt] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [customerlist, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const handleSearch = async (text) => {
        setSearchTerm(text);
        if (text.trim() == '') {
            fetchdata();
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.customer_search}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                search: text,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setCustomerList(result.payload);
            setIsModalVisible(true);
            setSelectedCompany(null);
        } else {
            setCustomerList([]);
            console.log('error while Searching Customer');
        } setLoading(false);
    };

    const handleSelectCompany = (item) => {
        setSelectedCompany(item.company_name);
        setSearchTerm(item.company_name); // Set the selected company
        setIsModalVisible(false);
    };

    const fetchdata = async () => {
        setMainloading(true);
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);

        const url = `${Constant.URL}${Constant.OtherURL.sales_report}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                party_name: selectedCompany
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
            setTodayamt(result.total_today_amount);
            setTodayqty(result.total_today_qty);
            setTotalamt(result.total_amount);
            setTotalqty(result.total_quantity);
        } else {
            setData([]);
            console.log('error while fetching sales Report');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchdata();
        }, [startDate, endDate, selectedCompany])
    );

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Sales Report" />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
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
                <View style={{ marginBottom: 5 }}>
                    <TextInput placeholder='Search by party' value={searchTerm} onChangeText={handleSearch} placeholderTextColor='gray' style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 10 }} />
                </View>

                {mainloading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : (
                    <>
                        <View style={{ borderRadius: 10, padding: 10, marginBottom: 5, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Quantity</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{totalqty ? totalqty : 0} (Box)</Text>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <View>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Amount</Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{totalamt ? totalamt : 0}</Text>
                                    </View>
                                    {(totalqty || totalamt) &&
                                        <TouchableOpacity onPress={() => navigation.navigate('Customerwise_sales', { totalamt: totalamt, totalqty: totalqty, startdate: startDate.toISOString(), enddate: endDate.toISOString() })} style={{ paddingLeft: 10, paddingBottom: 10 }}>
                                            <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>

                            {/* <View style={{ borderWidth: 0.5, borderColor: '#D3D3D3', marginVertical: 10 }}></View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Today Quantity</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{todayqty} (Box)</Text>
                                </View>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Today Amount</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{todayamt}</Text>
                                </View>
                            </View> */}
                        </View>


                        {data && data.length > 0 ? (
                            <ScrollView keyboardShouldPersistTaps='handled'>
                                {data.map((item, index) => (
                                    <View key={index} style={{ borderRadius: 10, padding: 10, marginBottom: 5, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', }}>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, width: '90%', }}>{item.product_name}</Text>
                                            {!selectedCompany &&
                                                <TouchableOpacity onPress={() => navigation.navigate('Salesreportdetail', { product_name: item.product_name, product_id: item.product_id, totalqty: item.total_qty, totalamt: item.total_amount, startdate: startDate.toISOString(), enddate: endDate.toISOString() })} style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                                                    <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                                </TouchableOpacity>}
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Quantity</Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{item.total_qty} (Box)</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Amount</Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{item.total_amount}</Text>
                                            </View>
                                        </View>

                                        {/* <View style={{ borderWidth: 0.5, borderColor: '#D3D3D3', marginVertical: 10 }}></View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Today Quantity</Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{item.today_qty} (Box)</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Today Amount</Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{item.today_amount}</Text>
                                            </View>
                                        </View> */}
                                    </View>
                                ))}
                            </ScrollView>
                        ) : null}
                    </>
                )}
            </View>

            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)} // Close modal when tapping outside
                contentContainerStyle={{
                    backgroundColor: 'white',
                    borderRadius: 10,
                    padding: 10,
                    width: '90%',
                    alignSelf: 'center', // Center the modal horizontally
                }}
            >
                {loading ? (
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : (
                    customerlist.length > 0 ? (
                        customerlist.map((item, index) => (
                            <TouchableOpacity key={index} onPress={() => handleSelectCompany(item)}>
                                <View style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderBottomWidth: 1, backgroundColor: '#fff', marginBottom: 10, }} >
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase', }} >
                                        {item.company_name}{item.area ? ` (${item.area})` : ''}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : ((
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                            No results found
                        </Text>
                    ))
                )}
            </Modal>
        </View>
    );
};

export default SalesReport;
