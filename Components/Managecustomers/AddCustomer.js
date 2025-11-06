import { View, Text, ScrollView, Keyboard, Image, TouchableOpacity, TextInput, ActivityIndicator, TouchableWithoutFeedback, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker from '@react-native-community/datetimepicker';
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from "react-native-paper";

const AddCustomer = ({ navigation, route }) => {
    const { customerdata, mobile_no, from, customerId, screen, customer } = route.params || {};
    const [companyname, setCompanyname] = useState(customerdata?.company_name || null);
    const [fullname, setFullname] = useState(customerdata?.full_name || null);
    const [creditperiod, setCreditperiod] = useState(customerdata?.credit_period || null);
    const [creditamt, setCreditamt] = useState(customerdata?.credit_amount || null);
    const [creditdays, setCreditDays] = useState(customerdata?.credit_days || null);
    const [address, setAddress] = useState(customerdata?.address || null);
    const [pincode, setPincode] = useState(customerdata?.pin_code || null);
    const [area, setArea] = useState(customerdata?.area || null);
    const [Location, setLocation] = useState(customerdata?.locaton_link || null);
    const [mobileno1, setMobileno1] = useState(customerdata?.moblie_no ? customerdata.moblie_no : mobile_no ? mobile_no : null);
    const [mobileno2, setMobileno2] = useState(customerdata?.mobile_number || null);
    const [email, setEmail] = useState(customerdata?.email || null);
    const [otherinfo, setOtherInfo] = useState(customerdata?.other_info || null);
    const [GSTNo, setGSTno] = useState(customerdata?.gst_no || null);
    const [pannumber, setPannumber] = useState(customerdata?.pancard_number || null);
    const [remark, setRemark] = useState(customerdata?.remark || null);
    const [bloodgroup, setBloodgroup] = useState(customerdata?.blood_group || null); console.log("custmerdata", customerdata)

    const [permissions, setPermissions] = useState({
        "Bank Transfer": false,
        "Cash": false,
        "Baki": false,
        "UPI": false,
    });

    const [birthdate, setbirthDate] = useState(customerdata?.birth_date ? new Date(customerdata.birth_date) : null);
    const [formattedDate, setFormattedDate] = useState(customerdata?.birth_date || 'Select Date');
    const [showbirthDatePicker, setShowbirthDatePicker] = useState(false);

    // Anniversary date initialization fix  
    const [anniversarydate, setAnniversarydate] = useState(customerdata?.anniversary ? new Date(customerdata.anniversary) : null);
    const [formattedAnniversaryDate, setFormattedAnniversaryDate] = useState(customerdata?.anniversary || 'Select Date');
    const [showdatepicker, setShowdatepicker] = useState(false);

    const [open, setOpen] = useState(false); // Controls dropdown visibility
    const [value, setValue] = useState(customerdata?.category || null); // Selected category value
    const [items, setItems] = useState([
        { label: 'Add New Category', value: 'add_new', icon: () => <Text>➕</Text> },
    ]);
    const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false); // Modal visibility
    const [newCategoryName, setNewCategoryName] = useState('');

    const [genderOpen, setGenderOpen] = useState(false); // Controls dropdown visibility
    const [genderValue, setGenderValue] = useState(customerdata?.gender || null); // Selected value
    const [genderItems, setGenderItems] = useState([
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
    ]);

    const [stateOpen, setStateOpen] = useState(false); // Controls dropdown visibility
    const [stateValue, setStateValue] = useState(customerdata?.state || null); // Selected state
    const [stateItems, setStateItems] = useState([]);

    const [cityOpen, setCityOpen] = useState(false); // Controls dropdown visibility
    const [cityValue, setCityValue] = useState(customerdata?.city || null); // Selected city
    const [cityItems, setCityItems] = useState([]);

    const [addedbyOpen, setAddedbyOpen] = useState(false); // Controls dropdown visibility
    const [addedbyValue, setAddedbyValue] = useState(customerdata?.added_by); // Selected state
    const [addedbyItems, setAddedbyItems] = useState([]);

    useEffect(() => {
        if (customerdata?.added_by) {
            setAddedbyItems((prevItems) => {
                // Check if the customerdata.added_by already exists in the addedbyItems
                if (!prevItems.some(item => item.value == customerdata.user_id)) {
                    return [...prevItems, { label: customerdata.added_by, value: customerdata.user_id }];
                }
                return prevItems;
            });

            // Set the default selected value for addedbyValue
            setAddedbyValue(customerdata.added_by);
        }
    }, [customerdata]);

    // useEffect(() => {
    //     if (customerdata?.added_by) {
    //         setAddedbyItems((prevItems) => {
    //             // Check if the value already exists to prevent duplicates
    //             if (!prevItems.some(item => item.value === customerdata.added_by)) {
    //                 return [...prevItems, { label: customerdata.added_by, value: customerdata.added_by }];
    //             }
    //             return prevItems;
    //         });
    //         setAddedbyValue(customerdata.added_by);
    //     }
    // }, [customerdata?.added_by]); // Only trigger when `added_by` changes


    // fetch users list
    const listusers = async () => {
        // setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const formattedusers = result.Payload.map((item) => ({
                label: item.user_name,
                value: item.userid,
            }));
            setAddedbyItems(formattedusers);

            const selectedUser = formattedusers.find(user => user.value == customerdata.user_id);
            if (selectedUser) {
                setAddedbyValue(selectedUser.value);  // Set the selected value as default
            }
        } else {
            setAddedbyItems([]);
            console.log('error while listing category');
        }
        // setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listusers();
        }, [])
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({
        category: '',
        companyname: '',
        fullname: '',
        mobileno1: '',
        gender: '',
    });

    const validateFields = () => {
        const newErrors = {
            category: value ? '' : 'category is required',
            companyname: companyname ? '' : 'company Name is required',
            fullname: fullname ? '' : 'full name is required',
            mobileno1: mobileno1 ? '' : 'Mobile Number is required',
            gender: genderValue ? '' : 'gender is required',
        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };


    const clearError = (fieldName) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [fieldName]: ''
        }));
    };

    // Update your date change handlers
    const handleChangeDate = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowdatepicker(false);
            return;
        }
        const currentDate = selectedDate || new Date();
        setShowdatepicker(false);

        if (currentDate) {
            // Format date as DD/MM/YY only if a date is selected
            const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getFullYear()).slice(-2)}`;
            setAnniversarydate(currentDate);
            setFormattedAnniversaryDate(formattedDate);
        } else {
            // Reset to placeholder if no date selected
            setAnniversarydate(null);
            setFormattedAnniversaryDate('Select Date');
        }
    };


    const getEighteenYearsAgo = () => {
        const today = new Date();
        return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    };

    // Open the calendar set to 18 years ago
    const openDatePicker = () => {
        // Set to current date instead of 18 years ago
        setbirthDate(birthdate || new Date()); // Use existing date or current date
        setShowbirthDatePicker(true);
        Keyboard.dismiss();
        setOpen(false);
        setGenderOpen(false);
    };
    const handleChangeBirthDate = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowbirthDatePicker(false);
            return;
        }
        const currentDate = selectedDate || new Date();
        setShowbirthDatePicker(false);

        if (currentDate) {
            const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getFullYear()).slice(-2)}`;
            setbirthDate(currentDate);
            setFormattedDate(formattedDate);
        } else {
            setbirthDate(null);
            setFormattedDate('Select Date');
        }
    };

    // Initialize the checkboxes when the component mounts
    useEffect(() => {
        if (customerdata?.payment_mode) {
            setPermissions((prev) => {
                const updatedPermissions = { ...prev };
                customerdata.payment_mode.forEach((mode) => {
                    updatedPermissions[formatPaymentMode(mode)] = true;
                });
                return updatedPermissions;
            });
        }
    }, [customerdata]);

    // Function to format payment modes to match keys in the state
    const formatPaymentMode = (mode) => {
        const formattedModes = {
            "bank_transfer": "Bank Transfer",
            "cash": "Cash",
            "baki": "Baki",
            "UPI": "UPI",
        };
        return formattedModes[mode] || mode;
    };

    // Toggle function for checkboxes
    const togglePermission = (perm) => {
        setPermissions((prev) => ({
            ...prev,
            [perm]: !prev[perm],
        }));
    };


    const Customercategory = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.listcustomer_category}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({

            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const formattedItems = result.payload.map((item) => ({
                label: item.category_name,
                value: item.customer_category_id,
            }));
            setItems([
                { label: 'Add New Category', value: 'add_new', icon: () => <Text>➕</Text> },
                ...formattedItems,
            ]);
            setNewCategoryModalVisible(false); // Close the modal
            setNewCategoryName('');
        } else {
            console.log('error while listing category');
        }
    };

    const addCustomercategory = async () => {
        if (!newCategoryName || newCategoryName.trim() == '') {
            setError('Enter Category Name'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.addcustomer_category}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category_name: newCategoryName
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setNewCategoryModalVisible(false);
            setOpen(true);
            Customercategory();
        } else {
            console.log('error while listing category');
        } setLoading(false)
    };

    const fetchstate = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_state}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({

            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const formattedItems = result.payload.map((item) => ({
                label: item.state_name,
                value: item.id,
            }));
            setStateItems(formattedItems);
        } else {
            console.log('error while listing category');
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchstate();
            Customercategory();
        }, [])
    );

    const fetchcities = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_city}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                state_id: stateValue,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const citylist = result.payload.map((item) => ({
                label: item.city_name,
                value: item.id,
            }));
            setCityItems(citylist);
        } else {
            setCityItems([]);
            console.log('error while listing category');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchcities();
        }, [stateValue])
    );

    const addcustomers = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.addcustomer}`;
        let selectedPaymentModes = from == 'SearchCustomer'
            ? ["Bank Transfer", "Cash", "Baki", "UPI"] // Pass all payment types when `from === 'SearchCustomer'`
            : Object.keys(permissions).filter((key) => permissions[key]);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                category: value,
                company_name: companyname,
                full_name: fullname,
                credit_period: creditperiod,
                credit_amount: creditamt,
                credit_days: creditdays,
                address: address,
                state: stateValue,
                city: cityValue,
                area: area,
                locaton_link: Location,
                moblie_no: mobileno1,
                mobile_number: mobileno2,
                gst_no: GSTNo,
                remark: remark,
                pin_code: pincode,
                email: email,
                other_info: otherinfo,
                anniversary: anniversarydate ? anniversarydate.toISOString().split('T')[0] : '',
                birth_date: birthdate ? birthdate.toISOString().split('T')[0] : '',
                gender: genderValue,
                pancard_number: pannumber,
                blood_group: bloodgroup,
                payment_mode: selectedPaymentModes
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            console.log('error while adding category');
        }
        setLoading(false);
    };

    const updatecustomers = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.update_customer}`;
        const selectedPaymentModes = Object.keys(permissions).filter((key) => permissions[key]);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: addedbyValue,
                c_id: customerdata?.c_id,
                category: value,
                company_name: companyname,
                full_name: fullname,
                credit_period: creditperiod,
                credit_amount: creditamt,
                credit_days: creditdays,
                address: address,
                state: stateValue,
                city: cityValue,
                area: area,
                locaton_link: Location,
                moblie_no: mobileno1,
                mobile_number: mobileno2,
                gst_no: GSTNo,
                remark: remark,
                pin_code: pincode,
                email: email,
                other_info: otherinfo,
                anniversary: anniversarydate ? anniversarydate.toISOString().split('T')[0] : '',
                birth_date: birthdate ? birthdate.toISOString().split('T')[0] : '',
                gender: genderValue,
                pancard_number: pannumber,
                blood_group: bloodgroup,
                payment_mode: selectedPaymentModes
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            console.log('error while updating customers');
        }
        setLoading(false);
    };

    const updatelocation = async () => {
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.locationupdate}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerId,
                location: Location,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            console.log('error while updating customers');
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={() => { setOpen(false); setGenderOpen(false); Keyboard.dismiss(); }}>
            <View style={{ flex: 1 }}>
                <Subheader headername={customerdata?.c_id ? 'Update Customer' : 'Add Customer'} />
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {screen != 'orderdetail' &&
                        <>
                            <View style={{ marginBottom: 10, marginTop: 10, zIndex: 10000 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Category
                                    <Text style={{ color: '#e60000' }}>*</Text></Text>
                                <DropDownPicker
                                    placeholder="Select Category"
                                    open={open}
                                    value={value}
                                    items={items}
                                    setOpen={(isOpen) => {
                                        setOpen(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                            setStateOpen(false);
                                            setCityOpen(false);
                                            setGenderOpen(false);
                                        }
                                    }}
                                    setValue={(value) => {
                                        if (value === 'add_new') {
                                            setValue(null); // Reset the selected value to null when "Add New" is selected
                                            clearError('category');
                                        } else {
                                            setValue(value); // Set the selected category value
                                            clearError('category');
                                        }
                                    }}
                                    onChangeValue={(value) => {
                                        if (value == 'add_new') {
                                            setOpen(false);
                                            setNewCategoryModalVisible(true);
                                            setValue(null);
                                        } else {
                                            setValue(value);
                                        }
                                    }}
                                    setItems={setItems}
                                    style={{
                                        width: '92%',
                                        height: 40,
                                        borderRadius: 10,
                                        borderColor: errors.category ? 'red' : 'gray',
                                        backgroundColor: '#F5F5F5',
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                        color: '#000',
                                    }}
                                    placeholderStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: 'gray',
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2,
                                        backgroundColor: '#fff',
                                        maxHeight: 600, width: '92%', alignSelf: 'center', marginTop: 2
                                    }}
                                />
                            </View>
                            {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.category}</Text> : null}

                            <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Company Name
                                        <Text style={{ color: '#e60000' }}>*</Text>
                                    </Text>
                                    <TextInput value={companyname} onChangeText={(text) => {
                                        setCompanyname(text);
                                        clearError('companyname');
                                    }} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.companyname ? 'red' : 'gray', borderRadius: 11 }} />
                                    {errors.companyname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', }}>{errors.companyname}</Text> : null}

                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Full Name
                                        <Text style={{ color: '#e60000' }}>*</Text>
                                    </Text>
                                    <TextInput value={fullname} onChangeText={(text) => {
                                        setFullname(text);
                                        clearError('fullname');
                                    }} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.fullname ? 'red' : 'gray', borderRadius: 11 }} />
                                    {errors.fullname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', }}>{errors.fullname}</Text> : null}

                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Credit Period</Text>
                                    <TextInput value={creditperiod} onChangeText={setCreditperiod} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Credit Amount</Text>
                                    <TextInput keyboardType='numeric' value={creditamt} onChangeText={setCreditamt} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Credit Days</Text>
                                    <TextInput keyboardType='numeric' value={creditdays} onChangeText={setCreditDays} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Address</Text>
                                    <TextInput value={address} onChangeText={setAddress} onFocus={() => { setOpen(false); setGenderOpen(false) }} multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15, marginTop: 0 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>State</Text>
                                <DropDownPicker
                                    placeholder="Select State"
                                    listMode='MODAL'
                                    open={stateOpen}
                                    value={stateValue}
                                    items={stateItems}
                                    setOpen={(isOpen) => {
                                        setStateOpen(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                            setOpen(false);
                                            setCityOpen(false);
                                            setGenderOpen(false);
                                        }
                                    }}
                                    setValue={setStateValue}
                                    setItems={setStateItems}
                                    searchable={true}
                                    searchablePlaceholder="Search State..." // Placeholder for search bar
                                    searchContainerStyle={{
                                        borderBottomColor: '#dfdfdf',
                                        borderBottomWidth: 1,
                                    }}
                                    searchTextInputStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: '#000',
                                    }}
                                    style={{
                                        width: '92%',
                                        height: 40,
                                        borderRadius: 10,
                                        borderColor: 'gray',
                                        backgroundColor: '#F5F5F5',
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                        color: '#000',
                                    }}
                                    placeholderStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: 'gray',
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2,
                                        backgroundColor: '#fff',
                                        maxHeight: 600
                                    }}
                                />
                            </View>

                            <View style={{ marginBottom: 10, marginTop: 10 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>City</Text>
                                <DropDownPicker
                                    placeholder="Select City"
                                    listMode='MODAL'
                                    open={cityOpen}
                                    value={cityValue}
                                    items={cityItems}
                                    setOpen={(isOpen) => {
                                        setCityOpen(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                            setStateOpen(false);
                                            setOpen(false);
                                            setGenderOpen(false);
                                        }
                                    }}
                                    setValue={setCityValue}
                                    setItems={setCityItems}
                                    searchable={true} // Enable searching functionality
                                    searchablePlaceholder="Search City..." // Placeholder for search bar
                                    searchContainerStyle={{
                                        borderBottomColor: '#dfdfdf',
                                        borderBottomWidth: 1,
                                    }}
                                    searchTextInputStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: '#000',
                                    }}
                                    style={{
                                        width: '92%',
                                        height: 40,
                                        borderRadius: 10,
                                        borderColor: 'gray',
                                        backgroundColor: '#F5F5F5',
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                        color: '#000',
                                    }}
                                    placeholderStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: 'gray',
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2,
                                        backgroundColor: '#fff',
                                        maxHeight: 600
                                    }}
                                    disabled={!stateValue}
                                />
                            </View>
                        </>
                    }
                    <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>
                        {screen != 'orderdetail' &&
                            <>
                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Pin Code</Text>
                                    <TextInput keyboardType='numeric' maxLength={6} value={pincode} onChangeText={setPincode} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Area</Text>
                                    <TextInput value={area} onChangeText={setArea} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>
                            </>}

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Location Link</Text>
                            <TextInput value={Location} onChangeText={setLocation} onFocus={() => { setOpen(false); setGenderOpen(false) }} placeholder='Select Location' placeholderTextColor='gray' multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                        </View>
                        {screen != 'orderdetail' &&
                            <>
                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Mobile Number 1
                                        <Text style={{ color: '#e60000' }}>*</Text>
                                    </Text>
                                    <TextInput value={mobileno1} onChangeText={(text) => {
                                        setMobileno1(text);
                                        clearError('mobileno1');
                                    }} onFocus={() => { setOpen(false); setGenderOpen(false) }} maxLength={10} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.mobileno1 ? 'red' : 'gray', borderRadius: 11 }} />
                                    {errors.mobileno1 ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.mobileno1}</Text> : null}

                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Mobile Number 2</Text>
                                    <TextInput value={mobileno2} onChangeText={setMobileno2} onFocus={() => { setOpen(false); setGenderOpen(false) }} maxLength={10} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Email</Text>
                                    <TextInput value={email} onChangeText={setEmail} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Other Information</Text>
                                    <TextInput value={otherinfo} onChangeText={setOtherInfo} onFocus={() => { setOpen(false); setGenderOpen(false) }} multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, height: 100, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>GST Number</Text>
                                    <TextInput value={GSTNo} onChangeText={setGSTno} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowdatepicker(true); setOpen(false); setGenderOpen(false); }}>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Anniversary</Text>
                                    <Text style={{ fontFamily: 'Inter-Medium', height: 50, fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingTop: 15 }}>{formattedAnniversaryDate}</Text>
                                </TouchableOpacity>
                                {showdatepicker && (
                                    <DateTimePicker
                                        value={anniversarydate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleChangeDate}
                                    />
                                )}

                                <TouchableOpacity onPress={openDatePicker}>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Birthdate</Text>
                                    <Text style={{ fontFamily: 'Inter-Medium', height: 50, fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingTop: 15 }}>{formattedDate}</Text>
                                </TouchableOpacity>
                                {showbirthDatePicker && (
                                    <DateTimePicker
                                        value={birthdate || new Date()} // Current date show karein agar null hai
                                        mode="date"
                                        display="default"
                                        onChange={handleChangeBirthDate}
                                    />
                                )}
                            </>}
                    </View>

                    {screen != 'orderdetail' &&
                        <>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Gender
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <DropDownPicker
                                    placeholder="Select Gender"
                                    open={genderOpen}
                                    value={genderValue}
                                    items={genderItems}
                                    setOpen={(isOpen) => {
                                        setGenderOpen(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                            setStateOpen(false);
                                            setOpen(false);
                                            setCityOpen(false);
                                        }
                                    }}
                                    setValue={(value) => {
                                        setGenderValue(value);
                                        clearError('gender');
                                    }}
                                    setItems={setGenderItems}
                                    style={{
                                        width: '92%',
                                        height: 40,
                                        borderRadius: 10,
                                        borderColor: errors.gender ? 'red' : 'gray',
                                        backgroundColor: '#F5F5F5',
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                        color: '#000',
                                    }}
                                    placeholderStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: 'gray',
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2,
                                        backgroundColor: '#fff',
                                        width: '92%', alignSelf: 'center', marginTop: 2
                                    }}
                                />
                            </View>
                            {errors.gender ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.gender}</Text> : null}
                        </>}

                    <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>
                        {screen != 'orderdetail' &&
                            <>
                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Pan Card Number</Text>
                                    <TextInput value={pannumber} onChangeText={setPannumber} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>


                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Remark</Text>
                                    <TextInput value={remark} onChangeText={setRemark} onFocus={() => { setOpen(false); setGenderOpen(false) }} multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View >
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Blood group</Text>
                                    <TextInput value={bloodgroup} onChangeText={setBloodgroup} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                {customerdata?.c_id &&
                                    <View style={{ marginBottom: 10, zIndex: 10000 }}>
                                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 5 }}>Party Added By
                                            <Text style={{ color: '#e60000' }}>*</Text></Text>
                                        <DropDownPicker
                                            placeholder='Select User'
                                            listMode='MODAL'
                                            open={addedbyOpen}
                                            value={addedbyValue}
                                            items={addedbyItems}
                                            setOpen={(isOpen) => {
                                                setAddedbyOpen(isOpen);
                                                if (isOpen) {
                                                    Keyboard.dismiss();
                                                    setStateOpen(false);
                                                    setCityOpen(false);
                                                    setGenderOpen(false);
                                                }
                                            }}
                                            setValue={setAddedbyValue}
                                            setItems={setAddedbyItems}
                                            style={{
                                                width: '100%',
                                                height: 40,
                                                borderRadius: 10,
                                                borderColor: 'gray',
                                                backgroundColor: '#F5F5F5',
                                                alignSelf: 'center'
                                            }}
                                            textStyle={{
                                                fontFamily: 'Inter-Medium',
                                                fontSize: 14,
                                                color: '#000',
                                            }}
                                            placeholderStyle={{
                                                fontFamily: 'Inter-Regular',
                                                fontSize: 14,
                                                color: 'gray',
                                            }}
                                            dropDownContainerStyle={{
                                                borderColor: '#fff',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 3,
                                                elevation: 2,
                                                backgroundColor: '#fff',
                                                maxHeight: 600
                                            }}
                                        />
                                    </View>}

                                {from != 'SearchCustomer' &&
                                    <>
                                        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 5 }}>
                                            <Text style={{ fontSize: 12, fontFamily: "Inter-Regular", color: "gray" }}>
                                                Payment Type
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: "row", alignItems: 'center', flexWrap: 'wrap' }}>
                                            {["Bank Transfer", "Cash", "Baki", "UPI"].map((perm) => (
                                                <View
                                                    key={perm}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        marginRight: 10,
                                                    }}
                                                >
                                                    <Checkbox.Android
                                                        status={permissions[perm] ? "checked" : "unchecked"}
                                                        onPress={() => togglePermission(perm)}
                                                        color="#173161"
                                                        uncheckedColor="#173161"
                                                    />
                                                    <Text style={{ fontSize: 16, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                        {perm}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>}

                            </>}
                        {loading ?
                            <ActivityIndicator size="large" color="#173161" />
                            :
                            <View style={{ margin: 10 }}>
                                <MyButton btnname="Save" background="#173161" fontsize={18} textcolor="#FFF" runFunc={(customerdata?.c_id && customer != 'Customer') ? updatecustomers : customerId ? updatelocation : addcustomers} />
                            </View>
                        }
                    </View>

                </ScrollView>

                <Modal visible={newCategoryModalVisible} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => { setNewCategoryModalVisible(false); setNewCategoryName(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Add New Category</Text>
                                <TouchableOpacity onPress={() => { setNewCategoryModalVisible(false); setNewCategoryName(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                    <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder="Enter Category Name"
                                placeholderTextColor='gray'
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}
                            {loading ? (
                                <ActivityIndicator size="large" color="#173161" />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => { addCustomercategory(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>

                                    {/* <TouchableOpacity onPress={() => { setNewCategoryModalVisible(false); setAddcat(''); setError(''); setSelectedCategory(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                                <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity> */}

                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

        </TouchableWithoutFeedback>
    )
}

export default AddCustomer