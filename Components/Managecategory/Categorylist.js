import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Categorylist = () => {
    const [catmodal, setCatModal] = useState(false);
    const [addcat, setAddcat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(true);

    const [catlist, setCatList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState(null);

    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);

    // const listPermissions = async () => {
    //     setMainloading(true);
    //     const id = await AsyncStorage.getItem('admin_id');

    //     const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ user_id: id }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         setPermissionsList(result.payload);
    //         // Prepare permissions state
    //         let permissionsData = {};
    //         result.payload.forEach((item) => {
    //             const permsArray = item.menu_permission.split(',');
    //             let permsObject = {};
    //             permsArray.forEach((perm) => {
    //                 permsObject[perm] = true;
    //             });
    //             permissionsData[item.menu_name] = permsObject;
    //         });

    //         setPermissions(permissionsData);
    //     } else {
    //         console.log('Error fetching permissions');
    //     }
    //     setMainloading(false);
    // };

    // useFocusEffect(
    //     React.useCallback(() => {
    //         listPermissions();
    //     }, [])
    // );

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
            setCatList(result.payload);
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

    const hasCategoryPermissions = permissions['Category'] || {};

    const Addcategory = async () => {
        if (!addcat || addcat.trim() == '') {
            setError('Category name cannot be empty'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_category}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: addcat,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setCatModal(false);
            setAddcat('');
            setError('');
            listcategory();
        } else {
            setError('error while adding category');
        }
        setLoading(false);
    };

    const Updatecategory = async (id) => {
        if (!addcat || addcat.trim() == '') {
            setError('Category name cannot be empty'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_category}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cid: id,
                name: addcat,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setCatModal(false);
            setAddcat('');
            setSelectedCategory('');
            setError('');
            listcategory();
        } else {
            setError('error while adding category');
        }
        setLoading(false);
    };


    const openModal = (category, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedCategory(category);
        setAddcat(category.name);
        setModalvisible(true);
    };

    const closeModal = () => {
        setSelectedCategory(null);
        setAddcat('');
        setModalvisible(false);
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_category}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cid: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listcategory();
        } else {
            setCatList([]);
            // Handle error if needed
        }
        setLoading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete ${selectedCategory.name} category?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedCategory.cid)
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
        <View style={{ flex: 1 }}>
            <Subheader headername='All Category' />
            <View style={{ margin: 10, flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {catlist.length != 0 &&
                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#173161', textTransform: 'capitalize' }}>category name:</Text>
                    }
                    {catlist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No categories available</Text>
                    ) : (
                        catlist.map((category, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>{category.name}</Text>
                                </View>

                                {/* {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && ( */}
                                <TouchableOpacity onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(category, pageX, pageY);
                                }}>
                                    <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                </TouchableOpacity>
                                {/* )} */}
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {/* {hasCategoryPermissions.Add && ( */}
            <View style={{ margin: 10, justifyContent: 'flex-end' }}>
                <MyButton btnname="Add Category" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => setCatModal(true)} />
            </View>
            {/* )} */}

            <Modal visible={catmodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setCatModal(false); setAddcat(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Category
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={() => { setCatModal(false); setAddcat(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Enter Category"
                            placeholderTextColor='gray'
                            value={addcat}
                            onChangeText={(text) => {
                                setAddcat(text);
                                setError('');
                            }}
                            style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />
                        {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}
                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => {
                                    if (!selectedCategory) {
                                        Addcategory(); // Call Addcategory if addcat is empty
                                    } else {
                                        Updatecategory(selectedCategory.cid); setModalvisible(false); // Call Updatecategory if addcat is not empty
                                    }
                                }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setCatModal(false); setAddcat(''); setError(''); setSelectedCategory(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
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
                <TouchableOpacity onPress={() => { setModalvisible(false); setAddcat(''); setSelectedCategory(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                        <TouchableOpacity onPress={() => { setCatModal(true); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* )} */}
                        {/* 
                        {hasCategoryPermissions.Delete && ( */}
                        <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                        {/* )} */}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Categorylist