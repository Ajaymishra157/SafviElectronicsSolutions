import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { Checkbox, Modal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import MyButton from '../Commoncomponent/MyButton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchCustomer = ({ navigation }) => {
    const [customerlist, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isOkButtonPressed, setIsOkButtonPressed] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [isFestiveChecked, setIsFestiveChecked] = useState(false);
    const [latestRequestId, setLatestRequestId] = useState(0);
    const latestRequestIdRef = useRef(0);

    const listPermissions = async () => {
        // setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            let permissionsData = {};
            result.payload.forEach((item) => {
                const permsArray = item.menu_permission.split(',');
                let permsObject = {};
                permsArray.forEach((perm) => {
                    permsObject[perm] = true;
                });
                permissionsData[item.menu_name] = permsObject;
            });

            setPermissions(permissionsData);
        } else {
            console.log('Error fetching permissions');
        }
        // setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
        }, [])
    );

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };
    const displayDate = formatDate(date);

    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = String(minutes).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };
    const displayTime = formatTime(date);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
        setShowTimePicker(true);
    };

    const showDatePicker = () => {
        setShow(true);
    };

    const onTimeChange = (event, selectedDate) => {
        const currentTime = selectedDate || date;
        setShowTimePicker(false);
        setDate(currentTime);
    };

    const handleSearch = async (text) => {
        setLoading(true);
        setSearchTerm(text);

        latestRequestIdRef.current += 1;
        const requestId = latestRequestIdRef.current;

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
        if (requestId === latestRequestIdRef.current) {
            if (result.code == "200") {
                setCustomerList(result.payload);
                setIsModalVisible(true);
            } else {
                setCustomerList([]);
                console.log('error while Searching Customer');
            } setLoading(false);
        }
    };

    const handleSelectCompany = (item) => {
        setSelectedCompany(item); // Set the selected company
        setIsModalVisible(false);
    };

    const handleAddOrder = () => {
        const festiveStatus = isFestiveChecked ? "checked" : "unchecked";
        // Check if user has "Over Limit" permission
        if (permissions?.["Credit Permission"]?.["Over Limit"]) {
            // User has permission to go over limit, proceed with order addition
            const orderDate = date.getTime() == new Date(0).getTime() ? null : date.toISOString(); // Check if date is still initial value
            navigation.replace('CreateOrder', {
                companyname: selectedCompany.company_name,
                mobile_no: selectedCompany.phone,
                customerid: selectedCompany.customer_id,
                orderdate: orderDate, // Passing the Date object
                area: selectedCompany.area,
                FestiveChecked: festiveStatus,
            });

            // Check credit amount condition
            // if (Number(selectedCompany.credit_amount) <= Number(selectedCompany.total_due)) {
            //     const message = `${selectedCompany.full_name} ( ${selectedCompany.area} ) ${selectedCompany.company_name} is over their credit amount ${selectedCompany.credit_amount} for new order`;
            //     setMessageText(message);
            //     setShowMessage(true);
            //     setTimeout(() => setShowMessage(false), 3000); // Hide after 3 seconds
            // }
            // Check credit period condition
            // else if (Number(selectedCompany.credit_period) <= Number(selectedCompany.baki_count)) {
            //     const message = `${selectedCompany.full_name} ( ${selectedCompany.area} ) ${selectedCompany.company_name} is over their credit period ${selectedCompany.credit_period} for new order`;
            //     setMessageText(message);
            //     setShowMessage(true);
            //     setTimeout(() => setShowMessage(false), 3000); // Hide after 3 seconds
            // }
            // Proceed if no credit issues
        } else {
            const orderDate = date.getTime() == new Date(0).getTime() ? null : date.toISOString(); // Check if date is still initial value
            navigation.replace('CreateOrder', {
                companyname: selectedCompany.company_name,
                mobile_no: selectedCompany.phone,
                customerid: selectedCompany.customer_id,
                orderdate: orderDate,  // Passing the Date object
                FestiveChecked: festiveStatus,
            });
        }

    };

    const handleOkButtonPress = () => {
        setIsOkButtonPressed(true); // Set OK button as pressed
        console.log("OK Button Pressed: ", isOkButtonPressed);
    };

    const navigatetoAddcustomer = () => {
        navigation.navigate('AddCustomer', { mobile_no: searchTerm, from: 'SearchCustomer' });
        setIsModalVisible(false);
        setSearchTerm(null);
    };

    useEffect(() => {
        if (/^\d{10}$/.test(searchTerm)) {
            setIsModalVisible(false);
        }
    }, [searchTerm]); // Runs only when searchTerm changes

    const isOkButtonVisible =
        (Number(selectedCompany?.credit_amount) <= Number(selectedCompany?.total_due)) &&
        (Number(selectedCompany?.credit_period) <= Number(selectedCompany?.baki_count));

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername='Checkout' />
            <View style={{ margin: 10, flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextInput placeholder='Search by Name or Mobile' value={searchTerm} onChangeText={handleSearch} placeholderTextColor='gray' style={{ width: /^\d{10}$/.test(searchTerm) ? '90%' : '100%', fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 10 }} />
                    {/^\d{10}$/.test(searchTerm) && (
                        <TouchableOpacity onPress={() => navigatetoAddcustomer()} style={{ width: '10%', padding: 10, paddingVertical: 15 }}>
                            <Image source={require('../../assets/add-friend.png')} style={{ height: 25, width: 25 }} />
                        </TouchableOpacity>
                    )}
                </View>

                {selectedCompany && (
                    <View style={{ gap: 10, marginTop: 10, marginHorizontal: 0 }}>
                        <View
                            style={{ borderRadius: 10, padding: 10, borderColor: '#008000', borderWidth: 1, backgroundColor: '#fff' }}
                        >
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>
                                {selectedCompany.company_name}{selectedCompany.area ? ` (${selectedCompany.area})` : ''}
                            </Text>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>
                                {selectedCompany.full_name}
                            </Text>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>
                                {selectedCompany.phone}
                            </Text>

                            <View style={{ flexDirection: 'row', gap: 2 }}>
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'capitalize' }}>
                                    Total: {selectedCompany.total_due} {selectedCompany.baki_count > 0 ? `(Baki Bill: ${selectedCompany.baki_count})` : ''}
                                </Text>

                                {isOkButtonVisible &&
                                    <TouchableOpacity onPress={handleOkButtonPress} style={{ backgroundColor: '#173161', paddingHorizontal: 10, borderRadius: 10 }}>
                                        <Text style={{ color: '#fff', fontFamily: 'Inter-Regular', fontSize: 12 }}>OK</Text>
                                    </TouchableOpacity>}
                            </View>
                        </View>
                    </View>
                )}
                <TouchableOpacity onPress={showDatePicker} style={{ marginTop: 10, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'gray', padding: 10, borderRadius: 10 }}>
                    <Text style={{ color: '#000', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                        {date.getTime() === new Date(0).getTime() ? 'Select Date and Time' : `${displayDate} ${displayTime}`}
                    </Text>
                </TouchableOpacity>
                {show && (
                    <DateTimePicker
                        value={date}
                        mode='date'
                        is24Hour={false}
                        display="default"
                        onChange={onChange}
                        minimumDate={new Date()}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        is24Hour={true}
                        display="clock"
                        onChange={onTimeChange}
                    />
                )}

                {/* Festive Checkbox */}
                {permissions?.Festive?.Festive && selectedCompany && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <Checkbox
                            status={isFestiveChecked ? 'checked' : 'unchecked'} // Set checked/unchecked status
                            onPress={() => setIsFestiveChecked(!isFestiveChecked)} // Toggle checkbox state
                            color='#173161'
                        />
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>Festive</Text>
                    </View>
                )}
            </View>

            {/* <View style={{ margin: 10, }}>
                {isOkButtonVisible ?
                    <MyButton btnname="Add Order" background={selectedCompany && isOkButtonPressed ? "#173161" : "#D3D3D3"} fontsize={18} textcolor={selectedCompany && isOkButtonPressed ? "#fff" : "#000"} runFunc={handleAddOrder} disabled={!selectedCompany || !isOkButtonPressed} />
                    : <MyButton btnname="Add Order" background={selectedCompany ? "#173161" : "#D3D3D3"} fontsize={18} textcolor={selectedCompany ? "#fff" : "#000"} runFunc={handleAddOrder} disabled={!selectedCompany} />
                }
            </View> */}
            <View style={{ margin: 10 }}>
                <MyButton
                    btnname="Add Order"
                    background={selectedCompany ? "#173161" : "#D3D3D3"}
                    fontsize={18}
                    textcolor={selectedCompany ? "#fff" : "#000"}
                    runFunc={handleAddOrder}
                    disabled={!selectedCompany}
                />
            </View>


            {showMessage && (
                <View style={{ position: 'absolute', bottom: 60, left: 20, right: 20, backgroundColor: '#000000', padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                    <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                        {messageText}
                    </Text>
                </View>
            )}


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
                                        {item.full_name}{item.area ? ` (${item.area})` : ''}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                            No results found
                        </Text>
                    )
                )}
            </Modal>
        </View>
    )
}

export default SearchCustomer