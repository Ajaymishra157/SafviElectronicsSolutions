import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RadioButton } from 'react-native-paper'
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import ImagePicker from 'react-native-image-crop-picker';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UPIlist = () => {
    const [upimodal, setUpiModal] = useState(false);
    const [addupi_id, setAddupi_id] = useState(null);
    const [upi_link, setUpi_link] = useState(null);
    const [upi_limit, setUpi_limit] = useState(null);
    const [upistatus, setUpistatus] = useState('Active');
    const [qrtype, setQrtype] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(true);
    const qrRef = useRef();
    const qrOptions = [
        { label: 'Generate QR', value: 'Generate QR' },
        { label: 'Upload Image', value: 'Upload Image' },
    ];
    const [upilist, setUpiList] = useState([]);
    const [selectedUPI, setSelectedUPI] = useState(null);

    const [error, setError] = useState(null);
    const [upiiderror, setUpiiderror] = useState(null);
    const [upinameerror, setUpinameerror] = useState(null);
    const [upilimiterror, setUpilimiterror] = useState(null);

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

    const generateQRImage = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // wait for QR to render
            const uri = await captureRef(qrRef.current, {
                format: 'png',
                quality: 1,
                result: 'base64',
            });
            setSelectedImage({ data: uri, mime: 'image/png' });
        } catch (err) {
            console.error('QR capture error:', err);
        }
    };



    const listupi = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.upi_list}`;
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
            setUpiList(result.payload);
        } else {
            setUpiList([]);
            console.log('error while listing upi');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listupi();
        }, [])
    );

    const hasUPIPermissions = permissions['UPI Payments'] || {};

    const Addupi = async () => {
        let hasError = false;

        // Reset previous errors
        setUpiiderror('');
        setUpinameerror('');
        setUpilimiterror('');
        setError('');

        // Validate UPI ID
        if (!addupi_id || addupi_id.trim() == '') {
            setUpiiderror('UPI Id cannot be empty');
            hasError = true;
        }

        // Validate UPI Link
        if (!upi_link) {
            setUpinameerror('UPI name cannot be empty');
            hasError = true;
        }

        // Validate UPI Limit
        if (!upi_limit) {
            setUpilimiterror('UPI limit cannot be empty');
            hasError = true;
        }

        // If any error exists, stop submission
        if (hasError) return;
        setLoading(true);
        const userImageToSend = selectedImage ? 'data:' + selectedImage.mime + ';base64,' + selectedImage.data : null;
        const url = `${Constant.URL}${Constant.OtherURL.add_upi}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                upi_id: addupi_id,
                upi_link: upi_link,
                upi_limit: upi_limit,
                upi_type: qrtype,
                image: userImageToSend
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setUpiModal(false);
            setAddupi_id('');
            setUpi_limit('');
            setUpi_link('');
            setQrtype('');
            setSelectedImage('');
            setError('');
            setUpinameerror('');
            setUpiiderror('');
            setUpilimiterror('');
            listupi();
        } else {
            setError('error while adding upi');
        }
        setLoading(false);
    };

    const onSelectImage = async () => {
        Alert.alert('Choose Medium', 'Choose option', [
            {
                text: 'Camera',
                onPress: () => onCamera(),
            },
            {
                text: 'Gallery',
                onPress: () => onGallery(),
            },
            {
                text: 'Cancel',
                onPress: () => { },
            },
        ]);
    };


    const onCamera = () => {
        ImagePicker.openCamera({
            width: 500,
            height: 500,
            cropping: false,
            includeBase64: true,
        }).then(image => {
            setSelectedImage(image)

        });
    };

    const onGallery = () => {
        ImagePicker.openPicker({
            width: 500,
            height: 500,
            cropping: false,
            includeBase64: true,
        }).then(image => {
            setSelectedImage(image)
        });
    };

    const Updateupi = async (id) => {
        let hasError = false;

        // Reset previous errors
        setUpiiderror('');
        setUpinameerror('');
        setUpilimiterror('');
        setError('');

        // Validate UPI ID
        if (!addupi_id || addupi_id.trim() == '') {
            setUpiiderror('UPI Id cannot be empty');
            hasError = true;
        }

        // Validate UPI Link
        if (!upi_link) {
            setUpinameerror('UPI name cannot be empty');
            hasError = true;
        }

        // Validate UPI Limit
        if (!upi_limit) {
            setUpilimiterror('UPI limit cannot be empty');
            hasError = true;
        }

        // If any error exists, stop submission
        if (hasError) return;
        setLoading(true);
        const userImageToSend = selectedImage ? 'data:' + selectedImage.mime + ';base64,' + selectedImage.data : null;
        const url = `${Constant.URL}${Constant.OtherURL.update_upi}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                upi_id: addupi_id,
                upi_link: upi_link,
                upi_limit: upi_limit,
                status: upistatus,
                upi_type: qrtype,
                image: userImageToSend
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setUpiModal(false);
            setAddupi_id('');
            setUpi_limit('');
            setUpi_link('');
            setQrtype('');
            setSelectedImage('');
            setSelectedUPI('');
            setError('');
            setUpinameerror('');
            setUpiiderror('');
            setUpilimiterror('');
            listupi();
        } else {
            setError('error while adding upi');
        }
        setLoading(false);
    };


    const openModal = (upi, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedUPI(upi);
        setAddupi_id(upi.upi_id);
        setUpi_link(upi.upi_link);
        setUpi_limit(upi.upi_limit);
        setUpistatus(upi.status);
        setQrtype(upi.upi_type);
        setSelectedImage(upi.image);
        setModalvisible(true);
    };

    const closeModal = () => {
        setSelectedUPI(null);
        setAddupi_id('');
        setModalvisible(false);
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_upi}`;
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
            listupi();
        } else {
            setUpiList([]);
            // Handle error if needed
        }
        setLoading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete UPI",
            `Are you sure you want to delete ${selectedUPI.upi_id} upi?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedUPI.id)
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
            <Subheader headername='All UPI' />
            <View style={{ margin: 10, flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {upilist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No UPI id available</Text>
                    ) : (
                        upilist.map((upi, index) => (
                            <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginBottom: 5 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <View style={{ flexDirection: 'row', width: '80%' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>UPI Id: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161' }}>{upi.upi_id}</Text>
                                    </View>

                                    {(hasUPIPermissions.Update || hasUPIPermissions.Delete) && (
                                        <TouchableOpacity onPress={(e) => {
                                            const { pageX, pageY } = e.nativeEvent;
                                            openModal(upi, pageX, pageY);
                                        }}>
                                            <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                        </TouchableOpacity>)}
                                </View>
                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>UPI Name: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161' }}>{upi.upi_link}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>UPI Limit: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161' }}>{upi.upi_limit}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>Status: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161' }}>{upi.status}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {hasUPIPermissions.Add && (
                <View style={{ margin: 10, justifyContent: 'flex-end' }}>
                    <MyButton btnname="Add UPI" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => setUpiModal(true)} />
                </View>
            )}

            <Modal visible={upimodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setUpiModal(false); setAddupi_id(''); setUpi_limit(''); setUpi_link(''); setError(''); setUpiiderror(''); setUpinameerror(''); setUpilimiterror(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Add UPI</Text>
                            <TouchableOpacity onPress={() => { setUpiModal(false); setAddupi_id(''); setUpi_limit(''); setUpi_link(''); setError(''); setUpiiderror(''); setUpinameerror(''); setUpilimiterror(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>UPI Id</Text>
                            <TextInput
                                placeholder="Enter UPI ID"
                                placeholderTextColor='gray'
                                value={addupi_id}
                                onChangeText={setAddupi_id}
                                style={{ borderWidth: 1, borderColor: upiiderror ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: upiiderror ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {upiiderror ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{upiiderror}</Text> : ''}

                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>UPI Name</Text>
                            <TextInput
                                placeholder="Enter UPI Name"
                                placeholderTextColor='gray'
                                value={upi_link}
                                onChangeText={setUpi_link}
                                style={{ borderWidth: 1, borderColor: upinameerror ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: upinameerror ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {upinameerror ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{upinameerror}</Text> : ''}

                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>UPI Limit</Text>
                            <TextInput
                                placeholder="Enter UPI Limit"
                                placeholderTextColor='gray'
                                keyboardType='numeric'
                                value={upi_limit?.toString() || ''}
                                onChangeText={setUpi_limit}
                                style={{ borderWidth: 1, borderColor: upilimiterror ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: upilimiterror ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                            />
                            {upilimiterror ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{upilimiterror}</Text> : ''}

                            {selectedUPI &&
                                <>
                                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Status</Text>

                                    <RadioButton.Group
                                        onValueChange={value => {
                                            if (selectedUPI) setUpistatus(value); // Allow changing only if editing
                                        }}
                                        value={upistatus}
                                    >
                                        <View style={{ flexDirection: 'row', marginBottom: 0 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                                                <RadioButton value="Active" disabled={!selectedUPI} color='#173161' />
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: !selectedUPI ? 'gray' : '#000' }}>
                                                    Active
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <RadioButton value="Deactive" disabled={!selectedUPI} color='#173161' />
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: !selectedUPI ? 'gray' : '#000' }}>
                                                    Deactive
                                                </Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                </>
                            }

                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5, marginTop: 0 }}>QR Type</Text>
                            <Dropdown
                                data={qrOptions}
                                labelField="label"
                                valueField="value"
                                placeholder="Select QR Type"
                                placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                                selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                                value={qrtype}
                                onChange={item => {
                                    setQrtype(item.value);
                                    setSelectedImage(null);
                                }}
                                style={{
                                    height: 50,
                                    borderColor: 'gray',
                                    borderWidth: 0.5,
                                    borderRadius: 5,
                                    paddingHorizontal: 15,
                                    marginBottom: 10,
                                    fontFamily: 'Inter-Regular',
                                    color: '#000'
                                }}
                                renderItem={item => {
                                    const isSelected = item.value === qrtype;
                                    return (
                                        <View style={{ padding: 5, paddingHorizontal: 10, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                            <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }} >{item.label}</Text>
                                        </View>
                                    );
                                }}
                            />

                            {qrtype == 'Generate QR' && (
                                <TouchableOpacity
                                    disabled={!addupi_id && !upi_link}
                                    onPress={() => generateQRImage()}
                                    style={{ backgroundColor: !addupi_id && !upi_link ? '#ccc' : selectedImage ? 'transparent' : '#173161', padding: 10, width: 100, marginBottom: 10, borderRadius: 10, }}>

                                    {!selectedImage ?
                                        <Text style={{ color: !addupi_id && !upi_link ? '#000' : "#fff", textAlign: 'center', fontFamily: 'Inter-Regular' }}>Generate</Text>
                                        : <View>
                                            <TouchableOpacity onPress={() => setSelectedImage(null)} style={{ position: 'absolute', top: -10, right: -25, zIndex: 1, backgroundColor: '#fff', borderRadius: 20, }}>
                                                <Ionicons name="close-circle" size={20} color="#000" />
                                            </TouchableOpacity>

                                            <Image
                                                source={
                                                    typeof selectedImage == 'string'
                                                        ? { uri: selectedImage }
                                                        : { uri: `data:${selectedImage.mime};base64,${selectedImage.data}` }
                                                }
                                                style={{ width: 100, height: 100, marginBottom: 10 }}
                                            />
                                        </View>}
                                </TouchableOpacity>
                            )}

                            {qrtype == 'Upload Image' && (
                                <TouchableOpacity onPress={onSelectImage} style={{ borderWidth: selectedImage ? 0 : 1, borderColor: '#ccc', backgroundColor: '#fff', padding: 10, width: 100, marginBottom: 10, borderRadius: 10, }}>
                                    {selectedImage ? (
                                        <View>
                                            <TouchableOpacity onPress={() => setSelectedImage(null)} style={{ position: 'absolute', top: -10, right: -25, zIndex: 1, backgroundColor: '#fff', borderRadius: 20, }}>
                                                <Ionicons name="close-circle" size={20} color="#000" />
                                            </TouchableOpacity>

                                            <Image
                                                source={
                                                    typeof selectedImage == 'string'
                                                        ? { uri: selectedImage }
                                                        : { uri: `data:${selectedImage.mime};base64,${selectedImage.data}` }
                                                }
                                                style={{ width: 100, height: 100, marginBottom: 10 }}
                                            />
                                        </View>
                                    ) : (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'gray' }}>Image</Text>
                                            <Ionicons name="camera" size={24} color="black" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}

                            {qrtype == 'Generate QR' && (
                                <View ref={qrRef} collapsable={false} style={{ position: 'absolute', left: -1000 }}>
                                    <QRCode
                                        value={`upi://pay?pa=${addupi_id}&pn=${encodeURIComponent(upi_link)}&cu=INR`}
                                        size={150}
                                    />
                                </View>
                            )}

                            {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}

                            {loading ? (
                                <ActivityIndicator size="large" color="#173161" />
                            ) : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => {
                                        if (!selectedUPI) {
                                            Addupi(); // Call Addupi if addupi_id is empty
                                        } else {
                                            Updateupi(selectedUPI.id); setModalvisible(false); // Call Updateupi if addupi_id is not empty
                                        }
                                    }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => { setUpiModal(false); setAddupi_id(''); setError(''); setSelectedUPI(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                        <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); setAddupi_id(''); setSelectedUPI(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                        {hasUPIPermissions.Update && (
                            <TouchableOpacity onPress={() => { setUpiModal(true); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                            </TouchableOpacity>
                        )}

                        {hasUPIPermissions.Delete && (
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

export default UPIlist