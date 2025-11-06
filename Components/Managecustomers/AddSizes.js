import { View, Text, ScrollView, Keyboard, TouchableOpacity, Image, Modal, Alert, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { TextInput } from 'react-native-gesture-handler'
import DropDownPicker from 'react-native-dropdown-picker'
import MyButton from '../Commoncomponent/MyButton'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'

const AddSizes = ({ navigation, route }) => {
    const { customerid } = route.params;

    const [watercompanyOpen, setWaterComapnyOpen] = useState(false); // Controls dropdown visibility
    const [watercompanyValue, setWaterComapnyValue] = useState(null); // Selected value
    const [watercompanyItems, setWaterComapnyItems] = useState([
        { label: 'Add New Water Company', value: 'add_new_company', icon: () => <Text>➕</Text> },
    ]);
    const [wcname, setWcname] = useState(null);
    const [wcmodal, setWcmodal] = useState(false);

    const [sizesOpen, setSizesOpen] = useState(false); // Controls dropdown visibility
    const [sizesValue, setSizesValue] = useState(null); // Selected value
    const [sizesItems, setSizesItems] = useState([]);
    const [skuPrices, setSkuPrices] = useState({});


    const [newskq, setNewskq] = useState(null);
    const [skqmodal, setSkqmodal] = useState(false);

    const [price, setPrice] = useState(null);
    const [data, setData] = useState([]);
    const [modalvisible, setModalvisible] = useState(false);
    const [selecteduser, setSelectedUser] = useState(null);
    const [selecteduserid, setselecteduserid] = useState(null);

    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [error, setError] = useState(null);

    const [errors, setErrors] = useState({
        watercomapny: '',
        skuPrices: ''
    });

    const validateFields = () => {
        // Check if at least one SKU input is filled
        const filledSku = Object.values(skuPrices).some((value) => value.trim() !== '');

        const newErrors = {
            watercomapny: watercompanyValue ? '' : 'Water Company is required',
            skuPrices: filledSku ? '' : 'At least one SKU price is required', // Error for SKU prices
        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };


    const watercompanylist = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.listwater_company}`;
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
                label: item.water_company_name,
                value: item.water_company_id,
            }));
            setWaterComapnyItems([
                { label: 'Add New Water Company', value: 'add_new_company', icon: () => <Text>➕</Text> },
                ...formattedItems,
            ]);
            setWcmodal(false); // Close the modal
            setWcname('');
        } else {
            console.log('error while listing category');
        }
    };

    const addwatercompany = async () => {
        if (!wcname || wcname.trim() == '') {
            setError('Enter Water Company Name'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.addwater_company}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                water_company_name: wcname
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setWcmodal(false);
            setWaterComapnyOpen(true);
            watercompanylist();
        } else {
            console.log('error while listing category');
        } setLoading(false)
    };

    const skqlist = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_size}`;
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
            setSizesItems(result.payload);
            setSkqmodal(false); // Close the modal
            setNewskq('');
        } else {
            console.log('error while listing category');
        }
    };

    const addskq = async () => {
        if (!newskq || newskq.trim() == '') {
            setError('Enter SKQ Name'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_size}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                size_name: newskq
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setSizesOpen(true);
            skqlist();
        } else {
            console.log('error while listing category');
        } setLoading(false)
    };

    const addsurveydata = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const sizeIds = Object.keys(skuPrices); // Get all size IDs
        const prices = Object.values(skuPrices);
        const url = `${Constant.URL}${Constant.OtherURL.customer_detail}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
                company: watercompanyValue,
                size: sizeIds,
                price: prices,
            }),
        });

        const result = await response.json();
        if (result.code == "200") {
            listdata();
            setPrice('');
            setSkuPrices([])
        } else {
            console.log('Error while adding survey data');
        }
        setLoading(false);
    };

    const listdata = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_customerdetail}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.Payload);
        } else {
            setData([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listdata();
            watercompanylist();
            skqlist();
        }, [])
    );

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.customerdetail_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                d_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listdata();
        } else {
            setData([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Lead",
            `Are you sure you want to delete ${selecteduser}'s Survey?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selecteduserid)
                }
            ]
        );
    };

    const openModal = (item) => {
        console.log(item)
        setSelectedUser(item.size_name);
        setselecteduserid(item.company_id);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };


    return (
        <TouchableWithoutFeedback onPress={() => { setWaterComapnyOpen(false); setSizesOpen(false); Keyboard.dismiss(); }}>
            <View style={{ flex: 1 }}>
                <Subheader headername='Product Survey' />
                <View style={{ marginBottom: 10, marginTop: 10, zIndex: 2 }}>
                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Water Company</Text>
                    <DropDownPicker
                        placeholder="Select Water Company"
                        listMode='MODAL'
                        open={watercompanyOpen}
                        value={watercompanyValue}
                        items={watercompanyItems}
                        setOpen={(openState) => {
                            setWaterComapnyOpen(openState);
                            if (openState) {
                                setSizesOpen(false); // Close the category dropdown if source is opened
                                Keyboard.dismiss();
                            }
                        }}
                        setValue={setWaterComapnyValue}
                        onChangeValue={(value) => {
                            if (value == 'add_new_company') {
                                setWaterComapnyOpen(false);
                                setWcmodal(true);
                                setWaterComapnyValue(null);
                            } else {
                                setWaterComapnyValue(value);
                            }
                        }}
                        setItems={setWaterComapnyItems}
                        searchable={true} // Enable searching functionality
                        searchablePlaceholder="Search Water Company..." // Placeholder for search bar
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
                            borderColor: errors.watercomapny ? 'red' : 'gray',
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
                            maxHeight: 600,
                        }}
                    />
                </View>
                {errors.watercomapny ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.watercomapny}</Text> : null}

                <View style={{ marginBottom: 10, marginTop: 10, flexDirection: 'row', marginHorizontal: 10 }}>
                    {/* Display SKUs fetched from the list */}
                    <View style={{ width: '100%' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 10, width: '40%' }}>SKU</Text>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 0, width: '40%' }}>Price</Text>
                        </View>

                        {sizesItems.length > 0 &&
                            sizesItems.map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
                                    {/* SKU label */}
                                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#000', marginRight: 10, width: '40%', borderWidth: 1, opacity: 0.5, borderColor: 'gray', padding: 13, borderRadius: 10 }}>
                                        {item.size_name}
                                    </Text>
                                    {/* SKU input */}
                                    <TextInput
                                        value={skuPrices[item.size_id] || ''}
                                        onChangeText={(text) => setSkuPrices({ ...skuPrices, [item.size_id]: text })}
                                        keyboardType="numeric"
                                        style={{
                                            fontFamily: 'Inter-Medium',
                                            fontSize: 14,
                                            padding: 10,
                                            color: '#000',
                                            borderWidth: 1,
                                            borderColor: 'gray',
                                            borderRadius: 11,
                                            width: '55%',
                                        }}
                                    />
                                </View>
                            ))}
                        {errors.skuPrices && (
                            <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', textAlign: 'center' }}>
                                {errors.skuPrices}
                            </Text>
                        )}
                    </View>

                    {/* TextInput for Price */}
                    {/* <View style={{ marginBottom: 10, alignItems: 'center' }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, width: '40%' }}>
                            Price
                        </Text>
                        <TextInput
                            onFocus={() => { setWaterComapnyOpen(false); }}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                paddingHorizontal: 10,
                                color: '#000',
                                borderWidth: 1,
                                borderColor: errors.price ? 'red' : 'gray',
                                borderRadius: 11,
                                width: '55%', // Adjust this width as needed
                            }}
                        />
                        {errors.price ? (
                            <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                {errors.price}
                            </Text>
                        ) : null}
                    </View> */}
                </View>



                <View style={{ flex: 1, }}>
                    <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }}>
                        {data.length == 0 ? (
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Products available</Text>
                        ) : (
                            data.map((item, index) => (
                                <View key={index} style={{ gap: 10, marginBottom: 10 }}>
                                    <View style={{ borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', width: '60%' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>Water Comapny: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.company_name}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => openModal(item)}>
                                                <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                            </TouchableOpacity>
                                        </View>
                                        {item.details.map((detail, detailIndex) => (
                                            <View key={detailIndex} style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>SKQ: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase', width: '20%' }}>{detail.size_name}   </Text>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Price: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{detail.price}</Text>
                                            </View>
                                        ))}
                                    </View>

                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

                <View style={{ justifyContent: 'flex-end', margin: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            // <MyButton btnname="Add Product" background="#173161" btnWidth={250} fontsize={18} textcolor="#FFF" runFunc={addsurveydata} />
                            <TouchableOpacity onPress={addsurveydata} style={{ width: 250, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter-Bold' }}>
                                    Add Product
                                </Text>
                            </TouchableOpacity>
                        )}
                        {/* <MyButton btnname="Save" background="#173161" btnWidth={70} fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('Marketvisit')} /> */}
                        <TouchableOpacity onPress={() => {
                            Alert.alert(
                                "You want to save customer Data?", // Title of the alert
                                "", // Message in the alert
                                [
                                    {
                                        text: "Cancel", // Option for user to cancel the action
                                        style: "cancel",
                                    },
                                    {
                                        text: "OK", // Option to confirm the action
                                        onPress: () => navigation.replace('Marketvisit'), // Navigate if the user confirms
                                    },
                                ],
                                { cancelable: false } // The alert will not dismiss if the user taps outside
                            );
                        }} style={{ width: 70, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter-Bold' }}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Modal visible={wcmodal} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => { setWcmodal(false); setWcname(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Add Water Company</Text>
                                <TouchableOpacity onPress={() => { setWcmodal(false); setWcname(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                    <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder="Enter Category Name"
                                placeholderTextColor='gray'
                                value={wcname}
                                onChangeText={setWcname}
                                style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}
                            {loading ? (
                                <ActivityIndicator size="large" color="#173161" />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => { addwatercompany(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
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

                <Modal visible={skqmodal} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => { setSkqmodal(false); setNewskq(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Add SKQ</Text>
                                <TouchableOpacity onPress={() => { setSkqmodal(false); setNewskq(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                    <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                placeholder="Enter SKU"
                                placeholderTextColor='gray'
                                value={newskq}
                                onChangeText={setNewskq}
                                style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}
                            {loading ? (
                                <ActivityIndicator size="large" color="#173161" />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => { addskq(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
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

                <Modal visible={modalvisible} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                            {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}

                            {/* <TouchableOpacity style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                        <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                        <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                                    </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default AddSizes