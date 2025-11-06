import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput, Alert, Keyboard, BackHandler, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BDMTargetlist = ({ navigation, route }) => {
    const { username, selecteduserid } = route.params || {};
    const [addtarget, setAddtarget] = useState(null);
    const [subcatmodal, setSubcatModal] = useState(false);
    const [mainloading, setMainloading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [openinmodal, setOpeninmodal] = useState(false); // Controls dropdown visibility
    const [valueinmodal, setValueinmodal] = useState(); // Selected value
    const [itemsinmodal, setItemsinmodal] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
    const [Bdmtargets, setBdmtargets] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const getStartOfMonth = (monthIndex) => new Date(new Date().getFullYear(), monthIndex, 1);
    const getEndOfMonth = (monthIndex) => new Date(new Date().getFullYear(), monthIndex + 1, 0);

    const [errors, setErrors] = useState({
        category: '',
        addsubcat: '',
    });

    useEffect(() => {
        const monthItems = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(i);
            return {
                label: date.toLocaleString('default', { month: 'long' }),
                value: i,
            };
        });
        setItemsinmodal(monthItems);
    }, []);

    useEffect(() => {
        if (valueinmodal !== null && valueinmodal !== undefined) {
            const start = getStartOfMonth(valueinmodal);
            const end = getEndOfMonth(valueinmodal);
            setStartDate(start);
            setEndDate(end);
        }
    }, [valueinmodal]);


    const validateFields = () => {
        const newErrors = {
            category: valueinmodal ? '' : 'Category is required',
            addsubcat: addtarget ? '' : 'BDM Target is required',
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

    const hasCategoryPermissions = permissions['BDM Target'] || {};

    const listbdmtargets = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_bdm}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salesman_id: selecteduserid,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setBdmtargets(result.payload);
        } else {
            setBdmtargets([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listbdmtargets();
        }, [])
    );

    const formatDateToDatabase = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
    };

    const AddBDMTarget = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const selectedMonthObj = itemsinmodal.find(item => item.value == valueinmodal);
        const monthName = selectedMonthObj ? selectedMonthObj.label : '';
        const url = `${Constant.URL}${Constant.OtherURL.add_bdm}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salesman_id: selecteduserid,
                add_by: id,
                month: monthName,
                start_date: formattedstartDate,
                end_date: formattedendDate,
                bdm_target: addtarget,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            // setCatModal(false);
            setAddtarget('');
            setError('');
            setSubcatModal(false);
            setValueinmodal(null);
            setStartDate(null);
            setEndDate(null);
            listbdmtargets();
        } else {
            setError('error while adding BDM Target');
        }
        setLoading(false);
    };

    const Updatebdmtarget = async (id) => {
        if (!validateFields()) return;
        setLoading(true);
        const adminid = await AsyncStorage.getItem('admin_id');
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const selectedMonthObj = itemsinmodal.find(item => item.value == valueinmodal);
        const monthName = selectedMonthObj ? selectedMonthObj.label : '';
        const url = `${Constant.URL}${Constant.OtherURL.update_bdm}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target_id: id,
                salesman_id: selecteduserid,
                add_by: adminid,
                month: monthName,
                start_date: formattedstartDate,
                end_date: formattedendDate,
                bdm_target: addtarget
            }),
        });

        const result = await response.json();
        if (result.code == "200") {
            setAddtarget('');
            setError('');
            setSubcatModal(false);
            setValueinmodal(null);
            setStartDate(null);
            setEndDate(null);
            listbdmtargets();
        } else {
            setError('error while update bdm target');
        }
        setLoading(false);
    };

    const openModal = (category, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedCategory(category);
        setAddtarget(category.bdm_target);
        const matchedMonth = itemsinmodal.find(item => item.label == category.month);
        if (matchedMonth) {
            setValueinmodal(matchedMonth.value);
        }
        setModalvisible(true);
    };

    const closeModal = () => {
        setSelectedCategory(null);
        setAddtarget('');
        setModalvisible(false);
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_bdm}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target_id: id,
            }),
        });
        console.log(id);
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listbdmtargets();
        }
        setLoading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete BDM Target",
            `Are you sure you want to delete BDM Target?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedCategory.target_id)
                }
            ]
        );
    };
    const formatDate = (date) => {
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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
            <Subheader headername={username} />
            <View style={{ marginVertical: 10, flex: 1 }}>

                <ScrollView keyboardShouldPersistTaps='handled' style={{ marginHorizontal: 10 }}>
                    {Bdmtargets.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No BDM Target available</Text>
                    ) : (
                        Bdmtargets.map((subcat, index) => (
                            <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <View style={{ flexDirection: 'row', width: '80%' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Month: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{subcat.month} ({subcat.start_date
                                                ? new Date(subcat.start_date).toLocaleDateString("en-GB") : ""}
                                                -{subcat.end_date ? new Date(subcat.end_date).toLocaleDateString("en-GB") : ""})</Text>
                                        </View>
                                    </View>
                                    {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && (
                                        <TouchableOpacity onPress={(e) => {
                                            const { pageX, pageY } = e.nativeEvent;
                                            openModal(subcat, pageX, pageY);
                                        }}>
                                            <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Box Target: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{subcat.bdm_target}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Achieved Box Target: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{subcat.achieve_target}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {hasCategoryPermissions.Add && (
                <View style={{ margin: 10, justifyContent: 'flex-end' }}>
                    <MyButton btnname="Add BDM Target" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => { setSubcatModal(true); }} />
                </View>
            )}

            <Modal visible={subcatmodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setAddtarget(''); setSelectedCategory(''); setSubcatModal(false); setStartDate(null); setEndDate(null); setValueinmodal(null); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 20, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Select Month
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={() => { setAddtarget(''); setSelectedCategory(''); setSubcatModal(false); setStartDate(null); setEndDate(null); setValueinmodal(null); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginBottom: errors.category ? 10 : 30 }}>
                            <DropDownPicker
                                placeholder="Select Month"
                                open={openinmodal}
                                value={valueinmodal}
                                items={itemsinmodal}
                                setOpen={(isOpen) => {
                                    setOpeninmodal(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                    }
                                }}
                                setValue={setValueinmodal}
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
                                }}
                            />
                            {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{errors.category}</Text> : null}
                        </View>

                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10, marginBottom: 5 }}>
                            Start Date <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={{ marginHorizontal: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, paddingVertical: 15, marginBottom: 10 }}>
                            <Text style={{ color: startDate ? '#000' : 'gray' }}>
                                {startDate ? formatDate(startDate) : 'Select Start Date'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10, marginBottom: 5 }}>
                            End Date <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <TouchableOpacity disabled={!startDate} onPress={() => setShowEndPicker(true)} style={{ marginHorizontal: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, paddingVertical: 15, marginBottom: 20 }}>
                            <Text style={{ color: endDate ? '#000' : 'gray' }}>
                                {endDate ? formatDate(endDate) : 'Select End Date'}
                            </Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate || getStartOfMonth(valueinmodal)}
                                mode="date"
                                display="default"
                                minimumDate={getStartOfMonth(valueinmodal)}
                                maximumDate={getEndOfMonth(valueinmodal)}
                                onChange={(event, selectedDate) => {
                                    setShowStartPicker(false);
                                    if (selectedDate) {
                                        if (endDate && selectedDate >= endDate) {
                                            Alert.alert("Start date must be before end date");
                                        } else {
                                            setStartDate(selectedDate);
                                        }
                                    }
                                }}
                            />
                        )}

                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate || getEndOfMonth(valueinmodal)}
                                mode="date"
                                display="default"
                                minimumDate={startDate || getStartOfMonth(valueinmodal)}
                                maximumDate={getEndOfMonth(valueinmodal)}
                                onChange={(event, selectedDate) => {
                                    setShowEndPicker(false);
                                    if (selectedDate) {
                                        if (startDate && selectedDate <= startDate) {
                                            Alert.alert("End date must be after start date");
                                        } else {
                                            setEndDate(selectedDate);
                                        }
                                    }
                                }}
                            />
                        )}

                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>BDM Target
                            <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>

                        <TextInput
                            placeholder="Enter BDM Target"
                            placeholderTextColor='gray'
                            keyboardType='numeric'
                            value={addtarget}
                            onChangeText={setAddtarget}
                            style={{ marginHorizontal: 10, borderWidth: 1, borderColor: errors.addsubcat ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: errors.addsubcat ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />

                        {errors.addsubcat ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 10 }}>{errors.addsubcat}</Text> : null}

                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => {
                                    if (!selectedCategory) {
                                        AddBDMTarget(); // Call Addcategory if addcat is empty
                                    } else {
                                        Updatebdmtarget(selectedCategory.target_id); setModalvisible(false); // Call Updatecategory if addcat is not empty
                                    }
                                }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setAddtarget(''); setSelectedCategory(''); setSubcatModal(false); setStartDate(null); setEndDate(null); setValueinmodal(null); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
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
                <TouchableOpacity onPress={() => { setModalvisible(false); setAddtarget(''); setSelectedCategory(''); setStartDate(null); setEndDate(null); setValueinmodal(null); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                        {hasCategoryPermissions.Update && (
                            <TouchableOpacity onPress={() => { setSubcatModal(true); setModalvisible(false) }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                            </TouchableOpacity>
                        )}
                        {hasCategoryPermissions.Delete && (
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

export default BDMTargetlist