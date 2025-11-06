import { View, Text, ScrollView, Keyboard, TouchableOpacity, Modal, Image, TextInput, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import DropDownPicker from 'react-native-dropdown-picker'
import MyButton from '../Commoncomponent/MyButton'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AddMarketVisit = ({ navigation, route }) => {
    const { customerdata } = route.params || {};
    const [open, setOpen] = useState(false); // Controls dropdown visibility
    const [value, setValue] = useState(customerdata?.customer_source ? customerdata?.customer_source : 'Exhibition'); // Selected value
    const [items, setItems] = useState([
        { label: 'Exhibition ', value: 'Exhibition' },
        { label: 'Market Visit', value: 'Market Visit' },
    ]);

    const [categoryOpen, setCategoryOpen] = useState(false); // Controls dropdown visibility
    const [categoryValue, setCategoryValue] = useState(customerdata?.category || null); // Selected value
    const [categoryItems, setCategoryItems] = useState([{
        label: 'Add New Category', value: 'add_new', icon: () => <Text>➕</Text>
    },
    ]);
    const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false); // Modal visibility
    const [newCategoryName, setNewCategoryName] = useState('');

    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [error, setError] = useState(null);

    const [areaOpen, setAreaOpen] = useState(false); // Controls dropdown visibility
    const [areaValue, setAreaValue] = useState(customerdata?.area || null); // Selected value
    const [areaItems, setAreaItems] = useState([
        { label: 'Add New Area', value: 'add_new_area', icon: () => <Text>➕</Text> }
    ]);

    const [areamodal, setAreaModal] = useState([]);
    const [addareas, setAddareas] = useState();

    const [mobile, setMobile] = useState(customerdata?.mobile_no || null);
    const [firmname, setFirmname] = useState(customerdata?.firm || null);
    const [businessyears, setBusinessyears] = useState(customerdata?.years || null);
    const [customername, setCustomername] = useState(customerdata?.name || null);
    const [remark, setRemark] = useState(customerdata?.remark || null);

    const [errors, setErrors] = useState({
        customersource: '',
        category: '',
        mobile: '',
        firm: '',
        business: '',
        cname: '',
        area: '',
        remark: ''
    });

    const validateFields = () => {
        const newErrors = {
            customersource: value ? '' : 'Customer source is required',
            category: categoryValue ? '' : 'Category is required',
            mobile: mobile ? '' : 'Mobile No is required',
            firm: firmname ? '' : 'Firm name is required',
            business: businessyears ? '' : 'Business years is required',
            cname: customername ? '' : 'Customer Name is required',
            area: areaValue ? '' : 'Area is required',
        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
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
            setCategoryItems([
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
            setCategoryOpen(true);
            Customercategory();
        } else {
            console.log('error while listing category');
        } setLoading(false)
    };

    const arealist = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.listcustomer_area}`;
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
            const areaItems = result.payload.map((item) => ({
                label: item.customer_area_name,
                value: item.customer_area_id,
            }));
            setAreaItems([
                { label: 'Add New Area', value: 'add_new_area', icon: () => <Text>➕</Text> },
                ...areaItems,
            ]);
            setAreaModal(false); // Close the modal
            setAddareas('');
        } else {
            console.log('error while listing category');
        }
    };

    const addarea = async () => {
        if (!addareas || addareas.trim() == '') {
            setError('Enter Area Name'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.addcustomer_area}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_area_name: addareas
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setAreaModal(false);
            setAreaOpen(true);
            arealist();
        } else {
            console.log('error while listing category');
        } setLoading(false)
    };

    const AddMarketvisit = async () => {
        if (!validateFields()) return;
        const id = await AsyncStorage.getItem('admin_id');
        setMainloading(true)
        const url = `${Constant.URL}${Constant.OtherURL.addmarket_visit}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                customer_source: value,
                category: categoryValue,
                mobile_no: mobile,
                firm: firmname,
                years: businessyears,
                name: customername,
                area: areaValue,
                remark: remark
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.replace('AddSizes', { customerid: result.payload[0].id })
        } else {
            console.log('error while listing category');
        } setMainloading(false);
    };

    const updateMarketvisit = async () => {
        if (!validateFields()) return;
        const id = await AsyncStorage.getItem('admin_id');
        setMainloading(true)
        const url = `${Constant.URL}${Constant.OtherURL.marketvisit_update}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: customerdata?.id,
                customer_source: value,
                category: categoryValue,
                mobile_no: mobile,
                firm: firmname,
                years: businessyears,
                name: customername,
                area: areaValue,
                remark: remark
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.replace('Marketvisit')
        } else {
            console.log('error while listing category');
        } setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            Customercategory();
            arealist();
        }, [])
    );

    return (
        <TouchableWithoutFeedback onPress={() => { setOpen(false); setCategoryOpen(false); setAreaOpen(false); Keyboard.dismiss(); }}>
            <View style={{ flex: 1 }}>
                <Subheader headername='Add Market Visit' />
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={{ marginBottom: 10, marginTop: 10, zIndex: 100 }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Customer Source
                            <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <DropDownPicker
                            placeholder="Select Source"
                            open={open}
                            value={value}
                            items={items}
                            setOpen={(openState) => {
                                setOpen(openState);
                                if (openState) {
                                    setCategoryOpen(false); // Close the category dropdown if source is opened
                                    setAreaOpen(false);
                                    Keyboard.dismiss();
                                }
                            }}
                            setValue={setValue}
                            setItems={setItems}
                            style={{
                                width: '92%',
                                height: 40,
                                borderRadius: 10,
                                borderColor: errors.customersource ? 'red' : 'gray',
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
                                backgroundColor: '#fff'
                            }}
                        />
                    </View>
                    {errors.customersource ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.customersource}</Text> : null}

                    <View style={{ marginBottom: 10, marginTop: 15, zIndex: 5 }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Customer Category
                            <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <DropDownPicker
                            placeholder="Select Category"
                            open={categoryOpen}
                            value={categoryValue}
                            items={categoryItems}
                            setOpen={(openState) => {
                                setCategoryOpen(openState);
                                if (openState) {
                                    setOpen(false); // Close the category dropdown if source is opened
                                    setAreaOpen(false);
                                    Keyboard.dismiss();
                                }
                            }}
                            setValue={(value) => {
                                if (value === 'add_new') {
                                    setCategoryValue(null); // Reset the selected value to null when "Add New" is selected
                                } else {
                                    setCategoryValue(value); // Set the selected category value
                                }
                            }}
                            onChangeValue={(value) => {
                                if (value == 'add_new') {
                                    setCategoryOpen(false);
                                    setNewCategoryModalVisible(true);
                                    setCategoryValue(null);
                                } else {
                                    setCategoryValue(value);
                                }
                            }}
                            setItems={setCategoryItems}
                            searchable={true} // Enable searching functionality
                            searchablePlaceholder="Search Category..." // Placeholder for search bar
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
                    {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.category}</Text> : null}

                    <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Customer Mobile Number
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TextInput value={mobile} onChangeText={setMobile} onFocus={() => { setOpen(false); setCategoryOpen(false); setAreaOpen(false); }} maxLength={10} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.mobile ? 'red' : 'gray', borderRadius: 11 }} />
                            {errors.mobile ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.mobile}</Text> : null}
                        </View>

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Customer Firm Name
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TextInput value={firmname} onChangeText={setFirmname} onFocus={() => { setOpen(false); setCategoryOpen(false); setAreaOpen(false); }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.firm ? 'red' : 'gray', borderRadius: 11 }} />
                            {errors.firm ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.firm}</Text> : null}
                        </View>

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Business Years
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TextInput value={businessyears} onChangeText={setBusinessyears} onFocus={() => { setOpen(false); setCategoryOpen(false); setAreaOpen(false); }} maxLength={10} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.business ? 'red' : 'gray', borderRadius: 11 }} />
                            {errors.business ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.business}</Text> : null}
                        </View>

                        <View >
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Customer Name
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TextInput value={customername} onChangeText={setCustomername} onFocus={() => {
                                setOpen(false); setCategoryOpen(false); setAreaOpen(false);
                            }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.cname ? 'red' : 'gray', borderRadius: 11 }} />
                            {errors.cname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.cname}</Text> : null}
                        </View>
                    </View>

                    <View style={{ marginBottom: 10, marginTop: 0, zIndex: 1 }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Customer Area
                            <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <DropDownPicker
                            placeholder="Select Area"
                            listMode='MODAL'
                            open={areaOpen}
                            value={areaValue}
                            items={areaItems}
                            setOpen={(openState) => {
                                setAreaOpen(openState);
                                if (openState) {
                                    setCategoryOpen(false); // Close the category dropdown if source is opened
                                    setOpen(false);
                                    Keyboard.dismiss();
                                }
                            }}
                            setValue={setAreaValue}

                            onChangeValue={(value) => {
                                if (value == 'add_new_area') {
                                    setAreaOpen(false);
                                    setAreaModal(true);
                                    setAreaValue(null);
                                } else {
                                    setAreaValue(value);
                                }
                            }}
                            setItems={setAreaItems}
                            searchable={true} // Enable searching functionality
                            searchablePlaceholder="Search Area..." // Placeholder for search bar
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
                                borderColor: errors.area ? 'red' : 'gray',
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
                                maxHeight: 700,
                            }}
                            dropDownDirection='TOP'
                        />
                    </View>
                    {errors.area ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.area}</Text> : null}

                    <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Remark</Text>
                            <TextInput value={remark} onChangeText={setRemark} onFocus={() => { setOpen(false); setCategoryOpen(false); setAreaOpen(false); }} multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                        </View>

                        {mainloading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ margin: 10 }}>
                                <MyButton btnname="Next" background="#173161" fontsize={18} textcolor="#FFF" runFunc={customerdata?.id ? updateMarketvisit : AddMarketvisit} />
                            </View>
                        )}
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

                <Modal visible={areamodal} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => { setAreaModal(false); setAddareas(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Add New Area</Text>
                                <TouchableOpacity onPress={() => { setAreaModal(false); setAddareas(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                    <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder="Enter Area Name"
                                placeholderTextColor='gray'
                                value={addareas}
                                onChangeText={setAddareas}
                                style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}
                            {loading ? (
                                <ActivityIndicator size="large" color="#173161" />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => { addarea(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
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

export default AddMarketVisit