import { View, Text, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import DropDownPicker from 'react-native-dropdown-picker'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'

const Addproduct = ({ navigation, route }) => {
    const { productdata } = route.params || {};

    const [open, setOpen] = useState(false); // Controls dropdown visibility
    const [value, setValue] = useState(productdata?.category_id || null); // Selected category
    const [items, setItems] = useState([]);

    const [openinmodal, setOpeninmodal] = useState(false); // Controls dropdown visibility
    const [valueinmodal, setValueinmodal] = useState(productdata?.subcategory_id || null); // Selected subcategory
    const [itemsinmodal, setItemsinmodal] = useState([]);

    const [pname, setPname] = useState(productdata?.product_name || null);
    const [price, setPrice] = useState(productdata?.product_price || null);
    const [Quantity, setquantity] = useState(productdata?.product_qty || null);
    const [position, setposition] = useState(productdata?.position || null);
    const [openingstock, setOpeningstock] = useState(productdata?.opening_stock || null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        pname: '',
        price: '',
        Quantity: '',
        position: '',
        category: '',
        subcategory: '',
        openingstock: ''
    });

    // Error clearing function
    const clearError = (fieldName) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [fieldName]: ''
        }));
    };

    const validateFields = () => {
        const newErrors = {
            pname: pname ? '' : 'Product Name is required',
            price: price ? '' : 'Price is required',
            Quantity: Quantity ? '' : 'Quantity is required',
            category: value ? '' : 'Category required',
            subcategory: valueinmodal ? '' : 'Subcategory is required',
            openingstock: openingstock ? '' : 'opening stock is required',

        };
        if (!value) {
            // If category is not selected, disable subcategory and show an error
            newErrors.subcategory = 'Select category first';
        }

        if (!value || !valueinmodal) {
            newErrors.position = 'select category and subcategory to enter position';
        } else {
            newErrors.position = position ? '' : 'Position is required';
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };

    const listcategory = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_category}`;
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
                label: item.name,
                value: item.cid,
            }));
            setItems(formattedItems);
            setItemsinmodal(formattedItems);
        } else {
            console.log('error while listing category');
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            listcategory();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            if (value) {
                listsubcategory();
            } else {
                setItemsinmodal([]);
            }
        }, [value])
    );

    const listsubcategory = async () => {
        if (!value) {
            // If no category is selected, set itemsinmodal to an empty array or handle accordingly
            setItemsinmodal([]);
            return;
        }
        const url = `${Constant.URL}${Constant.OtherURL.list_subcategory}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cid: value,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const formattedItem = result.payload.map((item) => ({
                label: item.subcategory_name,
                value: item.subcategoryid,
            }));
            setItemsinmodal(formattedItem);
        } else {
            setItemsinmodal([]);
            console.log('error while listing category');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listsubcategory();
        }, [value])
    );

    const AddProducts = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_product}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category_id: value,
                subcategory_id: valueinmodal,
                product_name: pname,
                product_price: price,
                product_qty: Quantity,
                position: position,
                opening_stock: openingstock,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            setError('error while adding product');
        }
        setLoading(false);
    };

    const updateProducts = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_product}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productdata?.product_id,
                category_id: value,
                subcategory_id: valueinmodal,
                product_name: pname,
                product_price: price,
                product_qty: Quantity,
                position: position,
                opening_stock: openingstock,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            setError('error while adding product');
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={() => { setOpen(false); setOpeninmodal(false); Keyboard.dismiss(); }}>
            <View style={{ flex: 1 }}>
                <Subheader headername={productdata?.product_id ? 'Update Product' : 'Add Product'} />
                <View style={{ flex: 1 }}>
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled>
                        <View style={{ marginBottom: 10, marginTop: 15, zIndex: 2 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Category
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <DropDownPicker
                                placeholder="Select Category"
                                scrollViewProps={{
                                    nestedScrollEnabled: true,
                                }}
                                open={open}
                                value={value}
                                items={items}
                                setOpen={(isOpen) => {
                                    setOpen(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setOpeninmodal(false);
                                    }
                                }}
                                setValue={(val) => {
                                    setValue(val);
                                    clearError('category');
                                    // Clear subcategory error when category is selected
                                    if (val) {
                                        clearError('subcategory');
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
                                    maxHeight: 600,
                                    backgroundColor: '#fff',
                                    width: '92%', alignSelf: 'center', marginTop: 2
                                }}
                            />
                        </View>
                        {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.category}</Text> : null}

                        <View style={{ marginBottom: errors.subcategory ? 10 : 30, marginTop: 20, zIndex: 1 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Sub-Category
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <DropDownPicker
                                placeholder="Select Sub-Category"
                                scrollViewProps={{
                                    nestedScrollEnabled: true,
                                }}
                                open={openinmodal}
                                value={valueinmodal}
                                items={itemsinmodal}
                                setOpen={(isOpen) => {
                                    setOpeninmodal(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setOpen(false);
                                    }
                                }}
                                setValue={(val) => {
                                    setValueinmodal(val);
                                    clearError('subcategory');
                                    // Clear position error when subcategory is selected
                                    if (val) {
                                        clearError('position');
                                    }
                                }}
                                setItems={setItemsinmodal}
                                style={{
                                    width: '92%',
                                    height: 40,
                                    borderRadius: 10,
                                    borderColor: errors.subcategory ? 'red' : 'gray',
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
                                    width: '92%', alignSelf: 'center', marginTop: 2
                                }}
                                disabled={!value}
                            />
                            {/* {!value && (
                        <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15, marginTop: 10 }}>
                            Select category first
                        </Text>
                    )} */}
                            {errors.subcategory ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15, marginTop: 10 }}>{errors.subcategory}</Text> : null}
                        </View>

                        <View style={{ marginHorizontal: 15, marginVertical: 0, gap: 15 }}>
                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Product Name
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => { setOpen(false); setOpeninmodal(false) }} value={pname} onChangeText={(text) => {
                                    setPname(text);
                                    clearError('pname');
                                }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.pname ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.pname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.pname}</Text> : null}
                            </View>

                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Price
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => { setOpen(false); setOpeninmodal(false) }} value={price}
                                    onChangeText={(text) => {
                                        setPrice(text);
                                        clearError('price');
                                    }} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.price ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.price ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.price}</Text> : null}
                            </View>

                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Quantity
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => { setOpen(false); setOpeninmodal(false) }} value={Quantity}
                                    onChangeText={(text) => {
                                        setquantity(text);
                                        clearError('Quantity');
                                    }} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.Quantity ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.Quantity ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.Quantity}</Text> : null}
                            </View>

                        </View>

                        <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Position
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => { setOpen(false); setOpeninmodal(false) }} value={position}
                                    onChangeText={(text) => {
                                        setposition(text);
                                        clearError('position');
                                    }} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.position ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.position ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.position}</Text> : null}
                            </View>

                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Opening Stock
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => { setOpen(false); setOpeninmodal(false) }} value={openingstock}
                                    onChangeText={(text) => {
                                        setOpeningstock(text);
                                        clearError('openingstock');
                                    }} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.openingstock ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.openingstock ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.openingstock}</Text> : null}
                            </View>

                            {loading ?
                                <ActivityIndicator size="large" color="#173161" />
                                : <View style={{ margin: 10 }}>
                                    <MyButton btnname="Save" background="#173161" fontsize={18} textcolor="#FFF" runFunc={productdata?.product_id ? updateProducts : AddProducts} />
                                </View>
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default Addproduct