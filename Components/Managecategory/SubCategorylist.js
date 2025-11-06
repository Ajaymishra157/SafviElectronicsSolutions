import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput, Alert, Keyboard, BackHandler, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import DropDownPicker from 'react-native-dropdown-picker'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SubCategorylist = () => {
    const [addsubcat, setAddsubcat] = useState(null);
    const [subcatmodal, setSubcatModal] = useState(false);
    const [mainloading, setMainloading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false); // Controls dropdown visibility
    const [value, setValue] = useState(null); // Selected value
    const [items, setItems] = useState([]);

    const [openinmodal, setOpeninmodal] = useState(false); // Controls dropdown visibility
    const [valueinmodal, setValueinmodal] = useState(); // Selected value
    const [itemsinmodal, setItemsinmodal] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
    const [subcategories, setSubcategories] = useState([]);

    const [errors, setErrors] = useState({
        category: '',
        addsubcat: '',
    });

    const validateFields = () => {
        const newErrors = {
            category: valueinmodal ? '' : 'Category is required',
            addsubcat: addsubcat ? '' : 'Sub-category is required',
        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };

    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const listPermissions = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setPermissionsList(result.payload);
            // Prepare permissions state
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
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
        }, [])
    );

    const hasCategoryPermissions = permissions['Sub Category'] || {};

    const listcategory = async () => {
        setMainloading(true);
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
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listcategory();
        }, [])
    );

    const listsubcategory = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_subcategory}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cid: value ? value : '',
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setSubcategories(result.payload);
        } else {
            setSubcategories([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listsubcategory();
        }, [value])
    );

    const Addsubcategory = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_subcategory}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cid: valueinmodal,
                subcategory_name: addsubcat,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            // setCatModal(false);
            setAddsubcat('');
            setError('');
            setSubcatModal(false);
            setValueinmodal(null);
            listsubcategory();
        } else {
            setError('error while adding category');
        }
        setLoading(false);
    };

    const Updatesubcategory = async (id) => {
        if (!addsubcat || addsubcat.trim() == '') {
            setError(' Sub-category name cannot be empty'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_subcategory}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subcategoryid: id,
                subcategory_name: addsubcat,
                category_id: valueinmodal
            }),
        });

        const result = await response.json();
        if (result.code == "200") {
            setSubcatModal(false);
            setAddsubcat('');
            setSelectedCategory('');
            setError('');
            listsubcategory();
        } else {
            setError('error while adding category');
        }
        setLoading(false);
    };

    const openModal = (category, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedCategory(category);
        setValueinmodal(category.cid);
        setAddsubcat(category.subcategory_name);
        setModalvisible(true);
    };

    const closeModal = () => {
        setSelectedCategory(null);
        setAddsubcat('');
        setModalvisible(false);
    };

    const handleDelete = async (id) => {
        console.log("ye id hai bhai", id);
        const url = `${Constant.URL}${Constant.OtherURL.delete_subcatgeory}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subcategoryid: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listsubcategory();
        } else {
            setCatList([]);
            // Handle error if needed
        }
        setLoading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Sub-category",
            `Are you sure you want to delete ${selectedCategory.subcategory_name} sub-category?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedCategory.subcategoryid)
                }
            ]
        );
    };

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <TouchableWithoutFeedback onPress={() => { setOpen(false); Keyboard.dismiss(); }}>
            <View style={{ flex: 1 }}>
                <Subheader headername='All Sub-Category' />
                <View style={{ marginVertical: 10, flex: 1 }}>

                    <View style={{ marginBottom: 20 }}>
                        <DropDownPicker
                            placeholder="Category"
                            open={open}
                            value={value}
                            items={items}
                            setOpen={(isOpen) => {
                                setOpen(isOpen);
                                if (isOpen) {
                                    Keyboard.dismiss();
                                }
                            }}
                            setValue={setValue}
                            setItems={setItems}
                            style={{
                                width: '95%',
                                alignSelf: 'center',
                                height: 40,
                                borderRadius: 5,
                                marginHorizontal: 0,
                                borderColor: '#173161',
                            }}
                            textStyle={{
                                fontFamily: 'Inter-Bold',
                                fontSize: 14,
                                color: '#173161',
                            }}
                            placeholderStyle={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: 'gray',
                            }}
                            dropDownContainerStyle={{
                                borderColor: '#E0E0E0', borderWidth: 1,
                                width: '95%', alignSelf: 'center', marginTop: 2
                            }}
                        />
                    </View>

                    <ScrollView keyboardShouldPersistTaps='handled' style={{ marginHorizontal: 10 }}>
                        {subcategories.length == 0 ? (
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No sub-categories available</Text>
                        ) : (
                            subcategories.map((subcat, index) => (
                                <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginTop: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Sub-Category: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{subcat.subcategory_name}</Text>
                                            </View>
                                        </View>
                                        {/* {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && ( */}
                                        <TouchableOpacity onPress={(e) => {
                                            const { pageX, pageY } = e.nativeEvent;
                                            openModal(subcat, pageX, pageY);
                                        }}>
                                            <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                        </TouchableOpacity>
                                        {/* )} */}
                                    </View>
                                    <View style={{ flexDirection: 'row', width: '80%' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Category: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{subcat.category_name}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
                {/* {hasCategoryPermissions.Add && ( */}
                <View style={{ margin: 10, justifyContent: 'flex-end' }}>
                    <MyButton btnname="Add Sub-Category" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => { setOpen(false); setSubcatModal(true); setAddsubcat(''), setValueinmodal('') }} />
                </View>
                {/* )} */}

                <Modal visible={subcatmodal} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => setSubcatModal(false)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 20, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Category
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TouchableOpacity onPress={() => setSubcatModal(false)} style={{ alignSelf: 'center' }}>
                                    <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginBottom: errors.category ? 10 : 30 }}>
                                <DropDownPicker
                                    placeholder="Category"
                                    open={openinmodal}
                                    value={valueinmodal}
                                    items={itemsinmodal}
                                    setOpen={(isOpen) => {
                                        setOpeninmodal(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                        }
                                    }}
                                    setValue={(callback) => {
                                        setValueinmodal((prev) => {
                                            const newValue = typeof callback === 'function' ? callback(prev) : callback;
                                            // ✅ Clear category error when user selects a value
                                            setErrors((prev) => ({ ...prev, category: '' }));
                                            return newValue;
                                        });
                                    }}
                                    setItems={setItemsinmodal}
                                    style={{
                                        width: '95%',
                                        height: 40,
                                        borderRadius: 5,
                                        borderColor: errors.category ? 'red' : '#173161',
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 14,
                                        color: '#173161',
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
                                        , width: '95%', alignSelf: 'center', marginTop: 2
                                    }}
                                />
                                {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{errors.category}</Text> : null}
                            </View>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Sub-Category
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>

                            <TextInput
                                placeholder="Enter Sub-Category"
                                placeholderTextColor='gray'
                                value={addsubcat}
                                onChangeText={(text) => {
                                    setAddsubcat(text);
                                    setErrors((prev) => ({ ...prev, addsubcat: '' }));
                                }}
                                style={{ marginHorizontal: 10, borderWidth: 1, borderColor: errors.addsubcat ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: errors.addsubcat ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />

                            {errors.addsubcat ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 10 }}>{errors.addsubcat}</Text> : null}

                            {loading ? (
                                <ActivityIndicator size="large" color="#173161" />
                            ) : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => {
                                        if (!selectedCategory) {
                                            Addsubcategory(); // Call Addcategory if addcat is empty
                                        } else {
                                            Updatesubcategory(selectedCategory.subcategoryid); setModalvisible(false); // Call Updatecategory if addcat is not empty
                                        }
                                    }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setSubcatModal(false)} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                        <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={modalvisible} transparent={true} animationType="slide">
                    <TouchableOpacity onPress={() => { setModalvisible(false); setAddsubcat(''); setSelectedCategory(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                        {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                        <View
                            onStartShouldSetResponder={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                top: modalPosition.top,
                                left: modalPosition.left,
                                gap: 10,
                                backgroundColor: '#fff',
                                paddingHorizontal: 20,
                                paddingBottom: 20,
                                paddingTop: 10,
                                borderRadius: 10,
                            }}
                        >
                            {/* {hasCategoryPermissions.Update && ( */}
                            <TouchableOpacity onPress={() => { setSubcatModal(true); setModalvisible(false) }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                            </TouchableOpacity>
                            {/* )} */}
                            {/* {hasCategoryPermissions.Delete && ( */}
                            <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                            {/* )} */}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default SubCategorylist