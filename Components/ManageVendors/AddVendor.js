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

const AddVendor = ({ navigation, route }) => {
    const { customerdata, mobile_no, from, customerId, screen, customer } = route.params || {};
    const [vendorname, setVendorname] = useState(customerdata?.vendor_name || null);
    const [vendoremail, setVendoremail] = useState(customerdata?.vendor_email || null);
    const [vendorphoneno, setVendorphoneno] = useState(customerdata?.vendor_mobile || null);
    const [vendoraddress, setVendoraddress] = useState(customerdata?.vendor_address || null);
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
    const [bloodgroup, setBloodgroup] = useState(customerdata?.blood_group || null);

    const [permissions, setPermissions] = useState({
        "Bank Transfer": false,
        "Cash": false,
        "Baki": false,
        "UPI": false,
    });

    const [birthdate, setbirthDate] = useState(new Date());
    const [formattedDate, setFormattedDate] = useState(customerdata?.birth_date || null);
    const [showbirthDatePicker, setShowbirthDatePicker] = useState(false);

    const [anniversarydate, setAnniversarydate] = useState(new Date());
    const [formattedAnniversaryDate, setFormattedAnniversaryDate] = useState(customerdata?.anniversary || null);
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

        vendoremail: '',
        vendorphoneno: '',

    });

    const validateFields = () => {
        const newErrors = {

            vendorname: vendorname ? '' : 'Vendor Name is required',

            vendorphoneno: vendorphoneno ? '' : 'Vendor Number is required',

        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };

    const handleChangeDate = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowdatepicker(false);
            return;
        }
        const currentDate = selectedDate || new Date();
        setShowdatepicker(false);

        // Format date as DD/MM/YY
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getFullYear()).slice(-2)}`;

        setAnniversarydate(currentDate); // Save the actual date object
        setFormattedAnniversaryDate(formattedDate); // Save the formatted string
    };

    const getEighteenYearsAgo = () => {
        const today = new Date();
        return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    };

    // Open the calendar set to 18 years ago
    const openDatePicker = () => {
        setbirthDate(getEighteenYearsAgo()); // Set the default value to 18 years ago
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

        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getFullYear()).slice(-2)}`;

        setbirthDate(currentDate);
        setFormattedDate(formattedDate)
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

    const addVendors = async () => {

        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.add_vendor}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vendorname: vendorname,
                vendoremail: vendoremail,
                vendorphoneno: vendorphoneno,
                vendoraddress: vendoraddress,
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

    const updateVendors = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.update_vendor}`;
        const selectedPaymentModes = Object.keys(permissions).filter((key) => permissions[key]);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vendorid: customerdata.vendor_id,
                vendorname: vendorname,
                vendoremail: vendoremail,
                vendorphoneno: vendorphoneno,
                vendoraddress: vendoraddress,
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
                <Subheader headername={customerdata?.vendor_id ? 'Update Vendor' : 'Add Vendor'} />
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {screen != 'orderdetail' &&
                        <>
                            {/* <View style={{ marginBottom: 10, marginTop: 10, zIndex: 10000 }}>
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
                                        } else {
                                            setValue(value); // Set the selected category value
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
                                        maxHeight: 600
                                    }}
                                />
                            </View>
                            {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.category}</Text> : null} */}

                            <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Vendor Name
                                        <Text style={{ color: '#e60000' }}>*</Text>
                                    </Text>
                                    <TextInput value={vendorname} onChangeText={setVendorname} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.vendorname ? 'red' : 'gray', borderRadius: 11 }} />
                                    {errors.vendorname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', }}>{errors.vendorname}</Text> : null}

                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Vendor Email

                                    </Text>
                                    <TextInput value={vendoremail} onChangeText={setVendoremail} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                    {/* {errors.fullname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', }}>{errors.fullname}</Text> : null} */}

                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Vendor Phone No <Text style={{ color: '#e60000' }}>*</Text></Text>
                                    <TextInput value={vendorphoneno} onChangeText={setVendorphoneno} keyboardType='number-pad' maxLength={10} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.vendorphoneno ? 'red' : 'gray', borderRadius: 11 }} />
                                    {errors.vendorphoneno ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', }}>{errors.vendorphoneno}</Text> : null}

                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Vendor Address</Text>
                                    <TextInput keyboardType='email-address' value={vendoraddress} multiline={true} onChangeText={setVendoraddress} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                {/* <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Credit Days</Text>
                                    <TextInput keyboardType='numeric' value={creditdays} onChangeText={setCreditDays} onFocus={() => { setOpen(false); setGenderOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View>

                                <View>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Address</Text>
                                    <TextInput value={address} onChangeText={setAddress} onFocus={() => { setOpen(false); setGenderOpen(false) }} multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                </View> */}
                            </View>

                            {/* <View style={{ marginBottom: 15, marginTop: 0 }}>
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
                            </View> */}

                            {/* <View style={{ marginBottom: 10, marginTop: 10 }}>
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
                            </View> */}
                        </>
                    }




                    <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                        {loading ?
                            <ActivityIndicator size="large" color="#173161" />
                            :
                            <View style={{ margin: 10 }}>
                                <MyButton btnname="Save" background="#173161" fontsize={18} textcolor="#FFF" runFunc={customerId ? updateVendors : addVendors} />
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

export default AddVendor