import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MyButton from '../Commoncomponent/MyButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Calculatorlist = ({ navigation }) => {
    const [mainloading, setMainloading] = useState(false);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [dynamicData, setDynamicData] = useState([]);
    const [rowHeights, setRowHeights] = useState({});

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
            listcalculation();
        }, [])
    );
    const hasPermissions = permissions['Calculator'] || {};

    const labels = [
        'SKU',
        'Price',
        'Box Qty',
        'Free Box',
        'Preform KG Rate',
        'Preform Weight',
        'Preform 1Kg Qty',
        'one Preform rate',
        'cap rate',
        'Label',
        'Shrink box Rate',
        'Material 1 pc Cost',
        'Material Box Cost',
        'Margin include free box Per PCS',
        'Profit 1 Box',
        'Margin %',
        'Free total 1 box cost',

        'GST',
        'Material 1 pc Cost',
        'Material Box Cost',
        'Margin include free box Per PCS',
        'Profit 1 Box',
        'Margin %',
        'Margin After Gst',
    ];

    const listcalculation = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list}`;
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
            setDynamicData(result.payload);
        } else {
            setDynamicData([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    const getDataByLabel = (label, item, rowIndex) => {
        switch (label) {
            case 'SKU': return item.prodcut_name;
            case 'Price': return item.product_price;
            case 'Box Qty': return item.product_boxqty;
            case 'Free Box': return item.free_box;
            case 'Preform KG Rate': return item.preform_rate;
            case 'Preform Weight': return item.preform_number;
            case 'Preform 1Kg Qty': return item.preform_kg_qty;
            case 'one Preform rate': return item.one_preform_rate;
            case 'cap rate': return item.cap_rate;
            case 'Label': return item.label_rate;
            case 'Shrink box Rate': return item.shrink_box_rate;

            // Before GST (rows 11-16)
            case 'Material 1 pc Cost':
                return rowIndex < 17 ? item.material_pcs_cost : item.gst_material_pcs_cost;

            case 'Material Box Cost':
                return rowIndex < 17 ? item.material_box_cost : item.gst_material_box_cost;

            case 'Margin include free box Per PCS':
                return rowIndex < 17 ? item.margin_free_box_per_pcs : item.gst_margin_free_box_per_pcs;

            case 'Profit 1 Box':
                return rowIndex < 17 ? item.profit_one_box : item.gst_profit_one_box;

            case 'Margin %':
                return rowIndex < 17 ? item.margin : item.gst_margin;

            case 'Free total 1 box cost':
                return item.free_total_one_box_cost;

            case 'GST':
                return item.gst;

            case 'Margin After Gst':
                return item.margin_after_gst;

            default: return '';
        }
    };


    const confirmDelete = (id) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete Calculation?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(id)
                }
            ]
        );
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete}`;
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
            listcalculation();
        }
        setMainloading(false);
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
            <Subheader headername="Calculator" />
            <View style={{ flex: 1, padding: 10 }}>
                <ScrollView>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ backgroundColor: '#f0f0f0' }}>
                            {labels.map((label, index) => {
                                const height = rowHeights[index];
                                if (!height) return <View key={index} style={{ height: 0 }} />;
                                return (
                                    <View key={index} style={[styles.labelCell, { height, borderWidth: 1, borderColor: '#ccc' }]}>
                                        <Text style={[
                                            styles.labelText,
                                            (label == 'SKU' || label == 'GST') && { textTransform: 'uppercase' }
                                        ]}>
                                            {
                                                label.split(' ').map((word, i) => {
                                                    const isGST = word.toLowerCase() == 'gst';
                                                    return (
                                                        <Text
                                                            key={i}
                                                            style={isGST ? { textTransform: 'uppercase' } : undefined}
                                                        >
                                                            {word + (i < label.split(' ').length - 1 ? ' ' : '')}
                                                        </Text>
                                                    );
                                                })
                                            }
                                        </Text>
                                    </View>
                                );
                            })}

                        </View>
                        <ScrollView horizontal>
                            <View style={{ borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ccc' }}>
                                {labels.map((label, rowIndex) => (
                                    <View key={rowIndex} style={[styles.row, { height: rowHeights[rowIndex] || 'auto' }]}
                                        onLayout={(event) => {
                                            const { height } = event.nativeEvent.layout;
                                            setRowHeights((prev) => ({
                                                ...prev,
                                                [rowIndex]: Math.max(prev[rowIndex] || 0, height)
                                            }));
                                        }}>
                                        {dynamicData.map((data, colIndex) => (
                                            <View key={colIndex} style={styles.cell}>
                                                {label == 'SKU' ? (
                                                    <View style={{ flexDirection: 'row', width: 120 }}>
                                                        <Text
                                                            style={[styles.cellText, { width: 75, fontSize: 12 }]}
                                                        >
                                                            {getDataByLabel(label, data, rowIndex)}
                                                        </Text>

                                                        {hasPermissions.Update && (
                                                            <TouchableOpacity onPress={() => { navigation.navigate('AddCalculator', { calculatordata: data }) }} style={{ flexDirection: 'row', paddingRight: 3 }}>
                                                                <Image source={require('../../assets/Edit1.png')} style={{ height: 18, width: 18, tintColor: '#173161' }} />
                                                            </TouchableOpacity>
                                                        )}
                                                        {hasPermissions.Delete && (
                                                            <TouchableOpacity onPress={() => { confirmDelete(data.id); }} style={{ flexDirection: 'row', paddingRight: 3 }}>
                                                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                                            </TouchableOpacity>
                                                        )}

                                                        <TouchableOpacity onPress={() => { navigation.navigate('AddCalculator', { calculatordata: data, forcopy: 'copy' }) }} style={{ flexDirection: 'row', paddingRight: 3 }}>
                                                            <Ionicons name="copy-outline" size={18} color="#173161" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <Text style={styles.cellText}>{getDataByLabel(label, data, rowIndex)}</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>

            {hasPermissions.Add && (
                <View style={{ margin: 10 }}>
                    <MyButton btnname="Add Calculation" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('AddCalculator')} />
                </View>
            )}
        </View>
    )
}

export default Calculatorlist
const styles = StyleSheet.create({
    labelText: {
        fontFamily: 'Inter-SemiBold',
        color: '#173161',
        textTransform: 'capitalize'
    },
    cellText: {
        color: '#000',
        fontFamily: 'Inter-Regular',
    },

    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        minHeight: 50,
    },

    labelCell: {
        width: 150,
        padding: 4,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        minHeight: 50,
    },

    cell: {
        width: 145,
        padding: 3,
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderColor: '#ccc',
    },

});