import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Image, RefreshControl, Keyboard } from 'react-native'
import React, { useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker'

const Partyledger = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedParty, setSelectedParty] = useState(null);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [usertype, setUsertype] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [userOpen, setUserOpen] = useState(false); // Controls dropdown visibility
    const [userValue, setUserValue] = useState(null); // Selected state
    const [userItems, setUserItems] = useState([]);
    const [visibleIndex, setVisibleIndex] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [scrollOffset, setScrollOffset] = useState(0);
    const [delivered_by, setDelivered_by] = useState(null);
    const scrollViewRef = useRef(null);
    const initialsRefs = useRef({});
    const modalRef = useRef();

    const listusers = async () => {
        // setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const formattedusers = result.Payload.map((item) => ({
                label: item.user_name,
                value: item.userid,
            }));
            setUserItems(formattedusers);
        } else {
            setUserItems([]);
            console.log('error while listing users');
        }
        // setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listusers();
        }, [])
    );

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

    const fetchusertype = async () => {
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.fetch_usertype}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setUsertype(result.payload.user_type)
        } else {
            console.log('Error fetching permissions');
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
            fetchusertype();
        }, [])
    );

    const openModal = (party) => {
        setSelectedParty(party);
        setModalVisible(true);
    };

    const listdata = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const permissionValue = permissions["Party Ledger"]?.["Full Ledger"] ? 'yes' : '';
        const url = `${Constant.URL}${Constant.OtherURL.party_leadger_api}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userValue ? userValue : id,
                permission: permissionValue
            }),
        });
        console.log('uservale:', userValue, 'id:', id, 'permission:', permissionValue);
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
        } else {
            setData([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setUserValue(null);
        listdata().then(() => setRefreshing(false));
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (permissions["Party Ledger"]?.["Full Ledger"]) {
                listdata();
            }
        }, [permissions, userValue])
    );


    const shareModalScreenshot = async () => {
        try {
            const base64 = await captureRef(modalRef, {
                format: 'jpg',
                quality: 0.8,
                result: 'base64' // Ensure the result is a Base64 string
            });

            console.log('Screenshot captured in Base64');

            // Define a path to store the image
            const filePath = `${RNFS.CachesDirectoryPath}/screenshot.jpg`;

            // Write the Base64 data as an image file
            await RNFS.writeFile(filePath, base64, 'base64');

            const shareOptions = {
                title: 'Party Ledger Details',
                message: `Here are the ledger details for ${selectedParty.company_name}!`,
                url: `file://${filePath}`,
                social: Share.Social.WHATSAPP
            };

            await Share.shareSingle(shareOptions);
        } catch (error) {
            console.error('Error capturing modal screenshot: ', error);
        }
    };

    // show the first letter of first name and last name
    const getInitials = (name) => {
        if (!name) return '';
        const words = name.trim().split(' ');
        if (words.length === 1) return words[0][0].toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
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
            <Subheader headername="Party Ledger" />

            {usertype == 'Admin' &&
                <View style={{ marginVertical: 10, marginHorizontal: 5, flexDirection: 'row', gap: 2 }}>
                    <View style={{ flex: 1, }}>
                        <DropDownPicker
                            placeholder='Select User'
                            listMode='MODAL'
                            open={userOpen}
                            value={userValue}
                            items={userItems}
                            setOpen={(isOpen) => {
                                setUserOpen(isOpen);
                                if (isOpen) {
                                    Keyboard.dismiss();
                                }
                            }}
                            setValue={setUserValue}
                            setItems={setUserItems}
                            style={{ height: 40, borderRadius: 10, borderColor: 'gray', backgroundColor: '#F5F5F5' }}
                            textStyle={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#000', }}
                            placeholderStyle={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'gray', }}
                            dropDownContainerStyle={{ borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, backgroundColor: '#fff', maxHeight: 600 }}
                        />
                    </View>
                    {userValue && (
                        <TouchableOpacity
                            onPress={() => setUserValue(null)}
                            style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 10, width: '10%', justifyContent: 'center', alignItems: 'center', height: 48 }}>
                            <Ionicons name="close-sharp" size={20} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
            }

            <View style={{ flex: 1 }}>
                <ScrollView ref={scrollViewRef}
                    onScroll={(event) => {
                        setScrollOffset(event.nativeEvent.contentOffset.y);
                    }}
                    scrollEventThrottle={16} keyboardShouldPersistTaps='handled' style={{ margin: 10 }} refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }>
                    {/* <View style={{ flexDirection: 'row', width: '97%', marginHorizontal: '3%' }}>
                        <Text style={{ width: "27%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000', textTransform: 'uppercase' }}></Text>
                        <Text style={{ width: "15%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Order No</Text>
                        <Text style={{ width: "15%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Due Days</Text>
                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Order Amt</Text>
                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Due Amt</Text>
                    </View> */}
                    {data.map((userData, index) => {
                        userData.totalAmount = userData.parties.reduce((acc, party) => acc + parseFloat(party.total_price), 0);
                        userData.dueAmount = userData.parties.reduce((acc, party) => acc + parseFloat(party.due_amount), 0);

                        return (
                            <View key={index}>
                                <View style={{ backgroundColor: '#c1d3f0', flexDirection: 'row', marginTop: 5, width: '100%', }}>
                                    <Text style={{ width: '58%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#000', textTransform: 'uppercase' }}>{index + 1}. {userData.user[0].name}</Text>
                                    <Text style={{ width: '20%', textAlign: 'right', fontFamily: 'Inter-Bold', fontSize: 12, color: '#000' }}>{userData.totalAmount}</Text>
                                    <Text style={{ width: '20%', textAlign: 'right', fontFamily: 'Inter-Bold', fontSize: 12, color: '#000', marginRight: "2%" }}>{userData.dueAmount}</Text>
                                </View>

                                <View style={{ borderWidth: 0.5, borderColor: '#173161' }}></View>

                                {userData.parties.map((party, partyIndex) => (
                                    <TouchableOpacity key={partyIndex} onLongPress={() => openModal(party)}>
                                        <View style={{ flexDirection: 'row', marginTop: 5, width: '97%', marginHorizontal: '3%' }}>
                                            <Text style={{ width: "57%", fontFamily: 'Inter-Bold', fontSize: 12, color: '#000', textTransform: 'uppercase' }}>{party.company_name}</Text>
                                            <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Bold', fontSize: 12, color: '#000' }}>{party.total_price}</Text>
                                            <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Bold', fontSize: 12, color: '#000' }}>{party.due_amount}</Text>
                                        </View>

                                        {party.orders.map((order, orderIndex) => (
                                            <View key={orderIndex} style={{ flexDirection: 'row', width: '97%', marginHorizontal: '3%' }}>
                                                <Text style={{ width: "25%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000', textTransform: 'uppercase' }}>{order.date}</Text>
                                                <Text style={{ width: "13%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.order_no}</Text>
                                                <Text style={{ width: "13%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.days_since_entry}</Text>
                                                <TouchableOpacity
                                                    ref={(ref) => initialsRefs.current[`${index}-${partyIndex}-${orderIndex}`] = ref}
                                                    onPress={() => {
                                                        const key = `${index}-${partyIndex}-${orderIndex}`;
                                                        initialsRefs.current[key]?.measureInWindow((x, y, width, height) => {
                                                            setTooltipPosition({ x: x + width / 2 - 60, y: y - 95 }); // 4 = small spacing
                                                            setVisibleIndex(key);
                                                            setDelivered_by(order.deliverd_by);
                                                            setTimeout(() => setVisibleIndex(null), 7000);
                                                        });
                                                    }}
                                                    style={{ width: '6%' }}>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>
                                                        {getInitials(order.deliverd_by)}
                                                    </Text>
                                                </TouchableOpacity>

                                                <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.total_price}</Text>
                                                <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.due_amount}</Text>
                                            </View>
                                        ))}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        );
                    })}
                    <View style={{ flexDirection: 'row', width: '100%', borderTopWidth: 0.5, borderColor: '#000', paddingVertical: 5 }}>
                        <Text style={{ width: "55%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000', textTransform: 'uppercase', marginLeft: '3%' }}>Grand Total</Text>
                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#000' }}>{data.reduce((acc, user) => acc + user.totalAmount, 0)}</Text>
                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#000', marginRight: '3%' }}>{data.reduce((acc, user) => acc + user.dueAmount, 0)}</Text>
                    </View>
                </ScrollView>

                {visibleIndex && tooltipPosition && (
                    <View style={{
                        position: 'absolute',
                        top: tooltipPosition.y,
                        left: tooltipPosition.x,
                        zIndex: 999,
                        backgroundColor: '#333',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 6,
                    }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter-Regular' }}>{delivered_by}</Text>
                    </View>
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} ref={modalRef} style={{ width: '100%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 5, marginBottom: 10, marginRight: 10 }}>
                            <Icon name="share-2" size={20} color="#000" onPress={shareModalScreenshot} style={{ padding: 5 }} />
                            <TouchableOpacity onPress={() => { setModalVisible(false); }} style={{ alignSelf: 'center', padding: 5 }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        {selectedParty && (
                            <>
                                <View style={{ flexDirection: 'row', borderBottomWidth: 1, marginBottom: 10, borderBottomColor: 'gray' }}>
                                    <Text style={{ width: '57%', color: '#000', fontSize: 12, fontFamily: 'Inter-SemiBold', marginBottom: 3 }}>{selectedParty.company_name}</Text>
                                    <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>{selectedParty.total_price}</Text>
                                    <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>{selectedParty.due_amount}</Text>
                                </View>

                                {/* Display Orders */}
                                {selectedParty.orders.map((order, index) => (
                                    <View key={index} style={{ flexDirection: 'row', marginBottom: 5 }}>
                                        <Text style={{ width: "27%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.date}</Text>
                                        <Text style={{ width: "15%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.order_no}</Text>
                                        <Text style={{ width: "15%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.days_since_entry}</Text>
                                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.total_price}</Text>
                                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.due_amount}</Text>
                                    </View>
                                ))}

                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
    )
}

export default Partyledger