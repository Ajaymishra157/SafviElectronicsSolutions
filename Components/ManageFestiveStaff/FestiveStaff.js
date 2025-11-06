import { View, Text, ScrollView, Keyboard, ActivityIndicator, TextInput, TouchableOpacity, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import Feather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';

const FestiveStaff = ({ navigation, route }) => {
    const { staffdata } = route.params || {};
    const [staffname, setStaffName] = useState(staffdata?.staff_name || null);
    const [staffmobile, setStaffMobile] = useState(staffdata?.staff_mobile || null);
    const [staffimg, setStaffimg] = useState(null);
    const [staffimgUrl, setStaffimgUrl] = useState(staffdata?.staff_image || '');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleImageSelect = () => {
        Alert.alert(
            "Select Image",
            "Choose an option to select the staff photo.",
            [
                {
                    text: "Gallery",
                    onPress: () => handleImagePick("gallery")
                },
                {
                    text: "Camera",
                    onPress: () => handleImagePick("camera")
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    // Function to pick image from camera or gallery
    const handleImagePick = async (source) => {
        try {
            let image;
            if (source === "camera") {
                image = await ImagePicker.openCamera({
                    width: 300,
                    height: 300,
                    compressImageQuality: 0.8,
                    includeBase64: true
                });
            } else {
                image = await ImagePicker.openPicker({
                    width: 300,
                    height: 300,
                    compressImageQuality: 0.8,
                    includeBase64: true
                });
            }
            setStaffimg(image);
        } catch (error) {
            console.log('Image pick cancelled or failed', error);
        }
    };

    const handleValidation = () => {
        let tempErrors = {};
        if (!staffname) tempErrors.staffname = 'Staff Name is required';
        if (!staffmobile) tempErrors.staffmobile = 'Mobile Number is required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const AddStaff = async () => {
        if (!handleValidation()) return;
        setLoading(true);
        const staffphoto = staffimg
            ? `data:${staffimg.mime};base64,${staffimg.data}`
            : null;

        const url = `${Constant.URL}${Constant.OtherURL.add_staff}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_name: staffname,
                staff_mobile: staffmobile,
                staff_image: staffphoto,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            console.log('error while adding Staff');
        }
        setLoading(false);
    };

    const updateStaff = async () => {
        if (!handleValidation()) return;
        setLoading(true);
        const staffphoto = staffimg
            ? `data:${staffimg.mime};base64,${staffimg.data}`
            : null;

        const url = `${Constant.URL}${Constant.OtherURL.update_staff}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_id: staffdata?.staff_id,
                staff_name: staffname,
                staff_mobile: staffmobile,
                staff_image: staffphoto,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            console.log('error while update Staff');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={staffdata?.staff_id ? 'Update Staff' : 'Add Staff'} />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Staff Name
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TextInput value={staffname} onChangeText={setStaffName} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.staffname ? 'red' : 'gray', borderRadius: 11 }} />
                            {errors.staffname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.staffname}</Text> : null}
                        </View>

                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Mobile Number
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TextInput value={staffmobile} onChangeText={setStaffMobile} maxLength={10} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.staffmobile ? 'red' : 'gray', borderRadius: 11 }} />
                            {errors.staffmobile ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.staffmobile}</Text> : null}
                        </View>

                        <View style={{ width: '48%' }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Staff Photo:</Text>
                            <TouchableOpacity style={{ width: 150, height: 100, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'gray', }} onPress={() => { handleImageSelect(); Keyboard.dismiss(); }} >
                                {staffimg ? (
                                    <Image source={{ uri: staffimg.path }} style={{ width: '100%', height: '100%', borderRadius: 20, resizeMode: 'cover', }} />
                                ) : staffimgUrl ? (
                                    <Image source={{ uri: staffimgUrl }} style={{ width: '100%', height: '100%', borderRadius: 20, resizeMode: 'cover', }} />
                                ) : (
                                    <Feather name="camera" size={20} color='#000' />
                                )}
                            </TouchableOpacity>
                        </View>

                        {loading ?
                            <ActivityIndicator size="large" color="#173161" />
                            : <View style={{ marginHorizontal: 5, justifyContent: 'flex-end' }}>
                                <MyButton btnname={"Save"} background="#173161" fontsize={18} textcolor="#FFF" runFunc={staffdata?.staff_id ? updateStaff : AddStaff} />
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default FestiveStaff