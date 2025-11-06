import { View, Text, TouchableOpacity, Keyboard, Modal, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import Subheader from '../Commoncomponent/Subheader';
import DropDownPicker from 'react-native-dropdown-picker';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PaymentList = ({ navigation }) => {

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);

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

    const [searchTerm, setSearchTerm] = useState(null);
    const [data, setData] = useState([]);
    const [totaldelivered, setTotaldelivered] = useState(null);
    const [total, setTotal] = useState(null);
    const [mainloading, setMainloading] = useState(false);
    const [openstatus, setOpenStatus] = useState(false); // Controls dropdown visibility
    const [valuestatus, setValueStatus] = useState('All Payments'); // Selected category value
    const [itemsstatus, setItemsStatus] = useState([
        { label: 'All Payments', value: 'All Payments' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Baki', value: 'Baki' },
        { label: 'Half Payments', value: 'Half Payments' },
    ]);
    const [date, setDate] = useState({
        startDate: new Date(),
        endDate: null,
    });

    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState(date);

    const handleConfirm = () => {
        setDate(tempDate);
        setShow(false);
    };

    const formatDateToDatabase = (date) => {
        if (!date) return null; // Handle null case
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
    };

    const fetchdata = async () => {
        setMainloading(true);
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);

        const url = `${Constant.URL}${Constant.OtherURL.payment_multilist}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                payment_mode: valuestatus == 'All Payments' ? '' : valuestatus,
                search: searchTerm
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
            setTotal(result.total);
            setTotaldelivered(result.totaldelivered);
        } else {
            setData([]);
            console.log('error while fetching Payment Type');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchdata();
        }, [])
    );

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Payment Type" />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 0, marginBottom: 10 }}>

                        {/* Start Date Button */}
                        <TouchableOpacity onPress={showStartDatePicker} style={{ backgroundColor: '#fff', width: '28%', borderWidth: 0.8, borderColor: 'gray', marginTop: 10, borderRadius: 10 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', height: 50, alignSelf: 'center', padding: 15 }}>{displayStartDate}</Text>
                        </TouchableOpacity>

                        {/* End Date Button */}
                        <TouchableOpacity onPress={showEndDatePicker} style={{ backgroundColor: '#fff', width: '28%', borderWidth: 0.8, borderColor: 'gray', marginTop: 10, borderRadius: 10, }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', height: 50, alignSelf: 'center', padding: 15 }}>{displayEndDate}</Text>
                        </TouchableOpacity>

                        <View style={{ width: '40%', zIndex: 999 }}>
                            <DropDownPicker
                                placeholder="Select Status"
                                open={openstatus}
                                value={valuestatus}
                                items={itemsstatus}
                                setOpen={(openState) => {
                                    setOpenStatus(openState);
                                    if (openState) {
                                        Keyboard.dismiss();
                                    }
                                }}
                                setValue={setValueStatus}
                                setItems={setItemsStatus}
                                style={{
                                    // width: '92%',
                                    height: 40,
                                    borderRadius: 10,
                                    borderColor: 'gray',
                                    backgroundColor: '#fff',
                                    alignSelf: 'center',
                                }}
                                textStyle={{
                                    fontFamily: 'Inter-Medium',
                                    fontSize: 12,
                                    color: '#000',
                                }}
                                placeholderStyle={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 12,
                                    color: 'gray',
                                }}
                                dropDownContainerStyle={{
                                    position: 'absolute', // Make it overlap
                                    top: -10, // Align it with the top of the input
                                    right: -10,
                                    borderColor: '#fff',
                                    borderRadius: 10,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    elevation: 2,
                                    backgroundColor: '#fff',
                                    maxHeight: 600,
                                }}
                                listItemContainerStyle={{
                                    marginVertical: -3
                                }}
                            />
                        </View>
                    </View>

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

                    <View style={{ marginHorizontal: 5, flexDirection: 'row', gap: 5 }}>
                        {/* <TextInput placeholder='Search By Order No | Party' value={searchTerm} onChangeText={(text) => { setSearchTerm(text); if (text.trim().length == 0) { fetchdata(); } }} placeholderTextColor='gray' style={{flex:1, fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#737373', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10 }} /> */}
                        <TextInput placeholder='Search By Order No | Party' value={searchTerm} onChangeText={(text) => { setSearchTerm(text); }} placeholderTextColor='gray' style={{ flex: 1, fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#737373', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10 }} />
                        <TouchableOpacity onPress={fetchdata} style={{ flexDirection: 'row', backgroundColor: '#173161', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 0, padding: 10, paddingHorizontal: 15 }}>
                            <Ionicons name="search" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, margin: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Delivered:
                                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }}> {totaldelivered ? totaldelivered : 0} </Text></Text>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total:
                                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }}> {total ? total : 0}</Text> </Text>
                        </View>
                        {mainloading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                <ActivityIndicator size="large" color="#173161" />
                            </View>
                        ) :
                            data && data.length > 0 ? (
                                data.map((item, index) => (
                                    <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                            <View style={{ flexDirection: 'row', width: '80%' }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Number: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.order_no}</Text>
                                                </View>
                                            </View>
                                            {(item.paid_amount != 0) &&
                                                <TouchableOpacity onPress={() => navigation.navigate('Orderwisepayments', { order_no: item.order_no })}>
                                                    <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                                </TouchableOpacity>}
                                        </View>
                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.company_name}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Date: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', }}>
                                                    {item.order_date
                                                        ? new Date(item.order_date).toLocaleDateString("en-GB") + ' ' +
                                                        new Date(item.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                        : ""}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', width: '80%', gap: 10 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Paid: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.paid_amount}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Due: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.deu_amount}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.total_price}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Status: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.status}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Created By: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.created_by}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Delivered By: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.deliverd_by}</Text>
                                            </View>
                                        </View>

                                    </View>
                                ))) :
                                <View style={{ alignItems: 'center', marginTop: 30 }}>
                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#173161' }}>No Records Found</Text>
                                </View>}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};
export default PaymentList;