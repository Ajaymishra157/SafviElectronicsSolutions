import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyButton from '../Commoncomponent/MyButton';
import DateTimePicker from '@react-native-community/datetimepicker';

const Stockentrylist = ({ navigation }) => {
    const [mainloading, setMainloading] = useState(false);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [stockentrylist, setStockEntrylist] = useState([]);
    const [loss, setLoss] = useState(null);
    const [allloss, setallloss] = useState(null);

    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedstocketry, setSelectedstockentry] = useState(null);
    const [selectedstockentryid, setSelectedstockentryid] = useState(null);
    const [selectedstockentrydata, setSelectedstockentrydata] = useState(null);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);

    const [losshour, setLossHour] = useState(null);

    const showStartDatePicker = () => {
        setShowStartDate(true);
    };

    const showEndDatePicker = () => {
        setShowEndDate(true);
    };

    const onStartDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        if (currentDate <= endDate) { // Ensure start date is not after end date
            setShowStartDate(false);
            setStartDate(currentDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        if (currentDate >= startDate) { // Ensure end date is not before start date
            setShowEndDate(false);
            setEndDate(currentDate);
        }
    };

    const today = new Date();

    const formatDateToDatabase = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
    };

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
            liststocks();
        }, [])
    );

    const hasCategoryPermissions = permissions['Stock Entry'] || {};

    const liststocks = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const url = `${Constant.URL}${Constant.OtherURL.list_stock}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                start_date: formattedstartDate,
                end_date: formattedendDate,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const updatedStockEntries = result.payload.map(dateEntry => {
                return {
                    ...dateEntry,
                    entries: dateEntry.entries.map(item => {
                        const lossBottal = Number(item.loss_bottal) || 0; // Ensure valid number
                        const totalLossHours = lossBottal / 5000; // Convert to hours
                        const hours = Math.floor(totalLossHours); // Get whole hours
                        const minutes = Math.round((totalLossHours - hours) * 60); // Convert remainder to minutes

                        return {
                            ...item,
                            losshour: `${hours}h ${minutes}m`, // Store formatted loss hour
                        };
                    }),
                };
            });

            setStockEntrylist(updatedStockEntries);
            setLoss(result.loss);
            setallloss(result.all_loss)
        } else {
            setStockEntrylist([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            liststocks();
        }, [startDate, endDate])
    );

    const openModal = (item, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedstockentryid(item.id);
        setSelectedstockentrydata(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };
    const handleEdit = () => {
        if (selectedstockentrydata) {
            navigation.navigate('AddStockEntry', { stockdata: selectedstockentrydata });
            setModalvisible(false);
        }
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_stock}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entry_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            liststocks();
        } else {
            // setProductList([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Customer",
            `Are you sure you want to delete this stock entry?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedstockentryid)
                }
            ]
        );
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Get day with leading zero
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month with leading zero
        const year = date.getFullYear(); // Get full year

        return `${day}/${month}/${year}`; // Return formatted date
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':'); // Assuming time is in 'HH:mm' format
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);

        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString([], options); // Format time in hh:mm am/pm
    };

    const displayStartDate = formatDate(startDate);
    const displayEndDate = formatDate(endDate);

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Stock Entry" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10 }}>
                {/* Start Date Button */}
                <TouchableOpacity onPress={showStartDatePicker} style={{ width: '48%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 10, padding: 15 }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayStartDate}</Text>
                </TouchableOpacity>

                {/* End Date Button */}
                <TouchableOpacity onPress={showEndDatePicker} style={{ width: '48%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 10, padding: 15 }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayEndDate}</Text>
                </TouchableOpacity>

                {/* Start Date Picker */}
                {showStartDate && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        onChange={onStartDateChange}
                        maximumDate={today}
                    />
                )}

                {/* End Date Picker */}
                {showEndDate && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        onChange={onEndDateChange}
                        maximumDate={today}
                    />
                )}
            </View>
            <View style={{ marginHorizontal: 10, borderWidth: 1, borderColor: '#173161', borderRadius: 5, padding: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <Text style={{ width: '55%', fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderRightWidth: 1, borderColor: '#173161', padding: 3 }}>Over All Loss Amount </Text>
                    <Text style={{ width: '45%', fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase', paddingLeft: 10 }}>₹{allloss}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }}>
                    {stockentrylist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Stock Entry available</Text>
                    ) : (
                        stockentrylist.map((group, groupindex) => (
                            <View key={groupindex} style={{ gap: 10, marginBottom: 10 }}>
                                {group.entries.map((item, index) => (
                                    <View key={index} style={{ borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', width: '80%', alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Entry No.: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.entry_no}</Text>
                                            </View>


                                            {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && (
                                                <TouchableOpacity onPress={(e) => {
                                                    const { pageX, pageY } = e.nativeEvent;
                                                    openModal(item, pageX, pageY);
                                                }}>
                                                    <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={{ flexDirection: 'row', width: '80%', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Entry Added By: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.user_name}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Date: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{formatDate(item.date)}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Time: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{formatTime(item.time_from)} To {formatTime(item.time_to)}</Text>
                                            </View>

                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Line: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.line_name}</Text>
                                        </View>
                                        {/* <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Subcategory Name: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.subcategory_name}</Text>
                                    </View> */}
                                        <View style={{ flexDirection: 'row', }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Product Name: </Text>
                                            <Text style={{ width: '70%', fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.product_name}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Live/Carton: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.qty} Box ({item.no_qty_pcs} Bottal(Preform))</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Shrink Machine Carton: </Text>
                                            <Text style={{ width: '45%', fontFamily: 'Inter-Regular', fontSize: 14, color: 'red', textTransform: 'capitalize' }}>{item.machine_qty} Box ({item.difference_qty} Loss/Carton)</Text>
                                        </View>
                                        {/* <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Difference: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.difference_qty} Box ({item.difference_qty_pcs} pcs)</Text>
                                    </View> */}

                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Expected Bottal Qty: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.expected_qty}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ width: '25%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>Loss/Bottal</Text>
                                            <Text style={{ width: '25%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>Loss/Carton</Text>
                                            <Text style={{ width: '28%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>Loss/Amount</Text>
                                            <Text style={{ width: '20%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161' }}>Loss Hour</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ width: '25%', paddingLeft: 5, fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', textTransform: 'capitalize' }}>{item.loss_bottal}</Text>
                                            <Text style={{ width: '25%', marginLeft: 10, fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', textTransform: 'capitalize' }}>{item.loss_carton}</Text>
                                            <Text style={{ width: '28%', fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', textTransform: 'capitalize' }}>₹{Number(item.loss_amt).toFixed(0)}</Text>
                                            <Text style={{ width: '20%', fontFamily: 'Inter-Regular', fontSize: 12, color: 'red' }}>{item.losshour}</Text>
                                        </View>
                                    </View>
                                ))}
                                <View style={{ gap: 5 }}>
                                    {group.Line_1_loss &&
                                        <View style={{ flexDirection: 'row', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#e6ecff', }}>
                                            <Text style={{ marginLeft: 10, fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>Line 1 ({group.date ? new Date(group.date).toLocaleDateString("en-GB") : ''})</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize', textAlign: 'center' }}>: ₹{Number(group.Line_1_loss).toFixed(0)}</Text>
                                        </View>}
                                    {group.Line_2_loss &&
                                        <View style={{ flexDirection: 'row', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#e6ecff', }}>
                                            <Text style={{ marginLeft: 10, fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>Line 2 ({group.date ? new Date(group.date).toLocaleDateString("en-GB") : ''})</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize', alignSelf: 'center' }}>: ₹{Number(group.Line_2_loss).toFixed(0)}</Text>
                                        </View>}

                                    {group.Line_3_loss &&
                                        <View style={{ flexDirection: 'row', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#e6ecff', }}>
                                            <Text style={{ marginLeft: 10, fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>Line 3 ({group.date ? new Date(group.date).toLocaleDateString("en-GB") : ''})</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize', alignSelf: 'center' }}>: ₹{Number(group.Line_3_loss).toFixed(0)}</Text>
                                        </View>}

                                    {group.Line_4_loss &&
                                        <View style={{ flexDirection: 'row', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#e6ecff', }}>
                                            <Text style={{ marginLeft: 10, fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>Line 4 ({group.date ? new Date(group.date).toLocaleDateString("en-GB") : ''})</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize', alignSelf: 'center' }}>: ₹{Number(group.Line_4_loss).toFixed(0)}</Text>
                                        </View>}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {hasCategoryPermissions.Add && (
                <View style={{ margin: 10 }}>
                    <MyButton btnname="Add Stock Entry" background="#173161" fontsize={18} textcolor="#FFF"
                        runFunc={() => {
                            const allEntries = stockentrylist.flatMap(item => item.entries || []);

                            // Get highest entry_no as a number
                            const lastEntryNumber = allEntries.length > 0
                                ? Math.max(...allEntries.map(item => Number(item.entry_no)))
                                : 0;

                            // Navigate and pass entry_no
                            navigation.navigate('AddStockEntry', { entry_no: lastEntryNumber });
                        }} />
                </View>
            )}

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        {hasCategoryPermissions.Update && (
                            <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
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

export default Stockentrylist