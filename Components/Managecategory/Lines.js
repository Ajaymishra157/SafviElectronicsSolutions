import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Lines = () => {
    const [linemodal, setLineModal] = useState(false);
    const [addline, setAddline] = useState(null);
    const [production, setProduction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(true);

    const [linelist, setLineList] = useState([]);
    const [selectedLine, setSelectedLine] = useState(null);
    const [error, setError] = useState(null);
    const [productionerror, setProductionError] = useState(null);

    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

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

    const listline = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_line}`;
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
            setLineList(result.payload);
        } else {
            console.log('error while listing line');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listline();
        }, [])
    );

    const hasLinePermissions = permissions['Line'] || {};

    const Addline = async () => {
        let hasError = false;

        // Reset previous errors
        setError('');
        setProductionError('');

        if (!addline || addline.trim() === '') {
            setError('Line name cannot be empty');
            hasError = true;
        }

        if (!production) {
            setProductionError('Line production is required');
            hasError = true;
        }

        // Stop function if there are any errors
        if (hasError) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_line}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                line_name: addline,
                line_amount: production
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setLineModal(false);
            setAddline('');
            setError('');
            listline();
        } else {
            setError('error while adding line');
        }
        setLoading(false);
    };

    const Updateline = async (id) => {
        let hasError = false;

        // Reset previous errors
        setError('');
        setProductionError('');

        if (!addline || addline.trim() === '') {
            setError('Line name cannot be empty');
            hasError = true;
        }

        if (!production) {
            setProductionError('Line production is required');
            hasError = true;
        }

        // Stop function if there are any errors
        if (hasError) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_line}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                line_name: addline,
                line_amount: production
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setLineModal(false);
            setAddline('');
            setSelectedLine('');
            setError('');
            listline();
        } else {
            setError('error while adding line');
        }
        setLoading(false);
    };


    const openModal = (line, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedLine(line);
        setAddline(line.line_name);
        setProduction(line.line_amount);
        setModalvisible(true);
    };

    const closeModal = () => {
        setSelectedLine(null);
        setAddline('');
        setProduction('');
        setError('');
        setProductionError('');
        setModalvisible(false);
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_line}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listline();
        } else {
            setLineList([]);
            // Handle error if needed
        }
        setLoading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Line",
            `Are you sure you want to delete ${selectedLine.line_name} line?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedLine.id)
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
            <Subheader headername='All Line' />
            <View style={{ margin: 10, flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {linelist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No lines available</Text>
                    ) : (
                        linelist.map((line, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginTop: 10 }}>
                                <View style={{ width: '80%' }}>
                                    <View style={{ flexDirection: 'row', width: '80%' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{line.line_name}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', width: '80%' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Production: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{line.line_amount}</Text>
                                    </View>
                                </View>

                                {(hasLinePermissions.Update || hasLinePermissions.Delete) && (
                                    <TouchableOpacity onPress={(e) => {
                                        const { pageX, pageY } = e.nativeEvent;
                                        openModal(line, pageX, pageY);
                                    }}>
                                        <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                    </TouchableOpacity>)}
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {hasLinePermissions.Add && (
                <View style={{ margin: 10, justifyContent: 'flex-end' }}>
                    <MyButton btnname="Add Line" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => setLineModal(true)} />
                </View>
            )}

            <Modal visible={linemodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setLineModal(false); setAddline(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Line
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={() => { setLineModal(false); setAddline(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Enter Line"
                            placeholderTextColor='gray'
                            value={addline}
                            onChangeText={setAddline}
                            style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />
                        {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}

                        <TextInput
                            placeholder="Enter Line Production"
                            placeholderTextColor='gray'
                            value={production}
                            onChangeText={setProduction}
                            keyboardType='numeric'
                            style={{ borderWidth: 1, borderColor: productionerror ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: productionerror ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />

                        {productionerror ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{productionerror}</Text> : ''}

                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => {
                                    if (!selectedLine) {
                                        Addline(); // Call Addline if addline is empty
                                    } else {
                                        Updateline(selectedLine.id); setModalvisible(false); // Call Updateline if addcat is not empty
                                    }
                                }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setLineModal(false); setAddline(''); setError(''); setSelectedLine(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
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
                <TouchableOpacity onPress={() => { setModalvisible(false); setAddline(''); setSelectedLine(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                        {hasLinePermissions.Update && (
                            <TouchableOpacity onPress={() => { setLineModal(true); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                            </TouchableOpacity>
                        )}

                        {hasLinePermissions.Delete && (
                            <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Lines