import { View, Text, ScrollView, ActivityIndicator, TextInput, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import MyButton from '../Commoncomponent/MyButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddCalculator = ({ navigation, route }) => {
    const { calculatordata, forcopy } = route.params || {};
    const [productlist, setProductList] = useState([]);
    const [selectedproduct, setSelectedProduct] = useState(calculatordata?.product_id || null);
    const [price, setPrice] = useState(calculatordata?.product_price || null);
    const [boxQty, setBoxQty] = useState(calculatordata?.product_boxqty || null);

    const [preformlist, setPreformList] = useState([]);
    const [selectedpreform, setSelectedPreform] = useState(null);
    const [preformrate, setPreformRate] = useState(calculatordata?.preform_rate || null);
    const [onepreformrate, setOnePreformrate] = useState(null);
    const [preformperkg, setPreformperkg] = useState(calculatordata?.preform_kg_qty || null);

    const [caprate, setCaprate] = useState(calculatordata?.cap_rate || null);
    const [labelrate, setLabelrate] = useState(calculatordata?.label_rate || null);
    const [shrinkboxrate, setShrinkboxrate] = useState(calculatordata?.shrink_box_rate || null);

    const [freebox, setFreeBox] = useState(calculatordata?.free_box || '0');
    const [material1pccost, setMaterial1pccost] = useState(null);
    const [gstmaterial1pccost, setGSTmaterial1pccost] = useState(null);

    const [mainloading, setMainloading] = useState(false);
    const [loading, setLoading] = useState(null);
    const [errors, setErrors] = useState({});
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateFields = () => {
        const newErrors = {};

        if (!selectedproduct) newErrors.selectedproduct = 'Please select a product';
        if (!price) newErrors.price = 'Enter product price';
        if (!boxQty) newErrors.boxQty = 'Enter box quantity';
        if (!freebox) newErrors.freebox = 'Enter free box value';
        if (!selectedpreform) newErrors.selectedpreform = 'Please select a preform';
        if (!preformrate) newErrors.preformrate = 'Enter preform rate';
        if (!caprate) newErrors.caprate = 'Enter cap rate';
        if (!labelrate) newErrors.labelrate = 'Enter label rate';
        if (!shrinkboxrate) newErrors.shrinkboxrate = 'Enter shrink box rate';

        setErrors(newErrors);
        return Object.keys(newErrors).length == 0;
    };


    const listproduct = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.product_list}`;
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
            const formattedItems = result.Payload.map((item) => ({
                label: item.product_name,
                value: item.product_id,
                price: item.product_price,
                boxqty: item.product_qty,
            }));
            setProductList(formattedItems);
        } else {
            setProductList([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listproduct();
            listsubcat();
        }, [])
    );

    const listsubcat = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.listpreform}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sub_id: 4
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const formatteddata = result.payload.map((item) => ({
                label: item.preform_number?.toString(),
                value: item.id.toString(),
                perkg: item.per_kg,
            }));
            setPreformList(formatteddata);

            // Auto-select matching preform based on calculatordata
            if (calculatordata?.preform_number) {
                const matchedPreform = formatteddata.find(
                    (item) => item.label == calculatordata.preform_number.toString()
                );
                if (matchedPreform) {
                    setSelectedPreform(matchedPreform);
                }
            }
        } else {
            setPreformList([]);
            console.log('error while listing sub category');
        }
    };

    const Addcalculations = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: selectedproduct,
                product_price: price,
                product_boxqty: boxQty,
                preform_number: selectedpreform?.label,
                preform_rate: preformrate,
                one_preform_rate: onepreformrate,
                preform_kg_qty: preformperkg,
                cap_rate: caprate,
                label_rate: labelrate,
                shrink_box_rate: shrinkboxrate,
                free_box: freebox,
                material_pcs_cost: material1pccost,
                material_box_cost: material_box_cost,
                free_total_one_box_cost: freetotaloneboxcost,
                margin_free_box_per_pcs: marginfreeboxperpcs,
                profit_one_box: profitonebox,
                margin: margin,
                gst_material_pcs_cost: gstmaterial1pccost,
                gst_material_box_cost: GSTmaterial_box_cost,
                gst_margin_free_box_per_pcs: gstmarginfreeboxperpcs,
                gst_profit_one_box: gstprofitonebox,
                gst_margin: gstmargin,
                margin_after_gst: marginaftergst
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            setErrorModalVisible(true);
            setErrorMessage(result.message || 'Error while adding calculation');
        }
        setLoading(false);
    };

    const Updatecalculations = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: calculatordata?.id,
                product_id: selectedproduct,
                product_price: price,
                product_boxqty: boxQty,
                preform_number: selectedpreform?.label,
                preform_rate: preformrate,
                one_preform_rate: onepreformrate,
                preform_kg_qty: preformperkg,
                cap_rate: caprate,
                label_rate: labelrate,
                shrink_box_rate: shrinkboxrate,
                free_box: freebox,
                material_pcs_cost: material1pccost,
                material_box_cost: material_box_cost,
                free_total_one_box_cost: freetotaloneboxcost,
                margin_free_box_per_pcs: marginfreeboxperpcs,
                profit_one_box: profitonebox,
                margin: margin,
                gst_material_pcs_cost: gstmaterial1pccost,
                gst_material_box_cost: GSTmaterial_box_cost,
                gst_margin_free_box_per_pcs: gstmarginfreeboxperpcs,
                gst_profit_one_box: gstprofitonebox,
                gst_margin: gstmargin,
                margin_after_gst: marginaftergst
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            console.log('error while adding calculation');
        }
        setLoading(false);
    };

    const handleProductSelect = (item) => {
        setSelectedProduct(item.value);
        setPrice(item.price?.toString() || '');
        setBoxQty(item.boxqty?.toString() || '');
    };

    const handlePreformSelect = (item) => {
        setSelectedPreform(item);
        setPreformperkg(item.perkg ? item.perkg.toFixed(2).toString() : '');
    };

    useEffect(() => {
        if (preformrate && preformperkg && !isNaN(preformrate) && !isNaN(preformperkg)) {
            const rate = parseFloat(preformrate);
            const perkg = parseFloat(preformperkg);
            if (perkg !== 0) {
                setOnePreformrate((rate / perkg).toFixed(2));
            } else {
                setOnePreformrate('');
            }
        } else {
            setOnePreformrate('');
        }
    }, [preformrate, preformperkg]);

    useEffect(() => {
        if (onepreformrate && caprate && labelrate && shrinkboxrate) {
            const total =
                parseFloat(onepreformrate) +
                parseFloat(caprate) +
                parseFloat(labelrate) +
                parseFloat(shrinkboxrate);
            setMaterial1pccost(total.toFixed(2));

            const gsttotal = total * 1.05
            setGSTmaterial1pccost(gsttotal.toFixed(2));

        } else {
            setMaterial1pccost('');
            setGSTmaterial1pccost('');
        }
    }, [onepreformrate, caprate, labelrate, shrinkboxrate]);

    const priceNum = parseFloat(price);
    const boxQtyNum = parseFloat(boxQty);
    const freeboxNum = parseFloat(freebox);

    const freetotaloneboxcost = parseFloat(((priceNum * boxQtyNum) / (boxQtyNum + freeboxNum)).toFixed(2));

    const marginfreeboxperpcs = parseFloat(((freetotaloneboxcost - (material1pccost * boxQtyNum)) / boxQtyNum).toFixed(2));
    const profitonebox = parseFloat((freetotaloneboxcost - (material1pccost * boxQtyNum)).toFixed(2));
    const margin = parseFloat(((profitonebox / freetotaloneboxcost) * 100).toFixed(2));
    const material_box_cost = (material1pccost * boxQty).toFixed(2);
    const GSTmaterial_box_cost = (gstmaterial1pccost * boxQty).toFixed(2);
    const gstmarginfreeboxperpcs = parseFloat((((freetotaloneboxcost - GSTmaterial_box_cost)) / boxQtyNum).toFixed(2));
    const gstprofitonebox = parseFloat((freetotaloneboxcost - GSTmaterial_box_cost).toFixed(2));
    const marginaftergst = parseFloat(gstmarginfreeboxperpcs / 1.05 * boxQtyNum).toFixed(2);
    const gstmargin = parseFloat(((marginaftergst / priceNum) * 100).toFixed(2));

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Subheader headername={calculatordata?.id ? 'Update Calculation' : 'Add Calculation'} />
            <View style={{ flex: 1, margin: 10 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5, marginTop: 0 }}>Select Product</Text>
                    <Dropdown
                        data={productlist}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Product"
                        autoScroll={false}
                        placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                        selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                        value={selectedproduct}
                        onChange={handleProductSelect}
                        style={{ height: 50, borderColor: errors.selectedproduct ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.selectedproduct ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000' }}
                        renderItem={item => {
                            const isSelected = item.value == selectedproduct;
                            return (
                                <View style={{ padding: 5, paddingHorizontal: 10, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }} >{item.label}</Text>
                                </View>
                            );
                        }}
                    />
                    {errors.selectedproduct && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.selectedproduct}</Text>}

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Product Price</Text>
                            <TextInput placeholder='Enter Price' placeholderTextColor='gray' value={price} onChangeText={setPrice} keyboardType='numeric' style={{ height: 40, borderColor: errors.price ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.price ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.price && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.price}</Text>}
                        </View>

                        {/* Box Quantity Input */}
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Box Quantity</Text>
                            <TextInput placeholder='Enter Box Quantity' placeholderTextColor='gray' value={boxQty} onChangeText={setBoxQty} keyboardType='numeric' style={{ height: 40, borderColor: errors.boxQty ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.boxQty ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.boxQty && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.boxQty}</Text>}
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Free Box</Text>
                            <TextInput placeholder='Enter Free Box' placeholderTextColor='gray' value={freebox} onChangeText={setFreeBox} keyboardType='numeric' style={{ height: 40, borderColor: errors.freebox ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.freebox ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.freebox && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.freebox}</Text>}
                        </View>

                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Free Total 1 Box Cost</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{freetotaloneboxcost ? freetotaloneboxcost : ''}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5, marginTop: 0 }}>Select Preform Weight</Text>
                            <Dropdown
                                data={preformlist}
                                labelField="label"
                                valueField="value"
                                placeholder="Select Preform"
                                autoScroll={false}
                                placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                                selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                                value={selectedpreform}
                                onChange={handlePreformSelect}
                                style={{ height: 40, borderColor: errors.selectedpreform ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.selectedpreform ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000' }}
                                renderItem={item => {
                                    const isSelected = item.value == selectedpreform;
                                    return (
                                        <View style={{ padding: 5, paddingHorizontal: 10, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                            <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }} >{item.label}</Text>
                                        </View>
                                    );
                                }}
                            />
                            {errors.selectedpreform && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.selectedpreform}</Text>}
                        </View>

                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Preform 1KG Quantity</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{preformperkg}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Preform /kg Rate</Text>
                            <TextInput placeholder='Enter Preform Rate' placeholderTextColor='gray' keyboardType='numeric' value={preformrate} onChangeText={setPreformRate} style={{ height: 40, borderColor: errors.preformrate ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.preformrate ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.preformrate && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.preformrate}</Text>}

                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>One Preform Rate</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{onepreformrate}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        <View style={{ width: '32%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Cap Rate</Text>
                            <TextInput placeholder='Enter Cap Rate' placeholderTextColor='gray' keyboardType='numeric' value={caprate} onChangeText={setCaprate} style={{ height: 40, borderColor: errors.caprate ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.caprate ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.caprate && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.caprate}</Text>}
                        </View>
                        <View style={{ width: '32%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Label</Text>
                            <TextInput placeholder='Enter Label Rate' placeholderTextColor='gray' keyboardType='numeric' value={labelrate} onChangeText={setLabelrate} style={{ height: 40, borderColor: errors.labelrate ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.labelrate ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.labelrate && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.labelrate}</Text>}
                        </View>
                        <View style={{ width: '32%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Shrink Box Rate</Text>
                            <TextInput placeholder='Enter Shrink Box Rate' placeholderTextColor='gray' keyboardType='numeric' value={shrinkboxrate} onChangeText={setShrinkboxrate} style={{ height: 40, borderColor: errors.shrinkboxrate ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: errors.shrinkboxrate ? 5 : 10, fontFamily: 'Inter-Regular', color: '#000', }} />
                            {errors.shrinkboxrate && <Text style={{ color: 'red', fontFamily: 'Inter-Regular', fontSize: 12, marginBottom: 5, marginLeft: 5, textTransform: 'capitalize' }}>{errors.shrinkboxrate}</Text>}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Material 1 pc Cost</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{material1pccost}</Text>
                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Material Box Cost</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{material_box_cost}</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Margin Include Free Box per PCS</Text>
                    <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{marginfreeboxperpcs ? marginfreeboxperpcs : ''}</Text>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Profit 1 Box</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{profitonebox ? profitonebox : ''}</Text>
                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Margin %</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{margin ? margin : ''}%</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: '#000', marginLeft: 5, textAlign: 'center' }}>GST</Text>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Material 1 Pc Cost</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{gstmaterial1pccost}</Text>
                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Material Box Cost</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{GSTmaterial_box_cost}</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Margin Include Free Box per PCS</Text>
                    <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{gstmarginfreeboxperpcs ? gstmarginfreeboxperpcs : ''}</Text>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Profit 1 Box</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{gstprofitonebox ? gstprofitonebox : ''}</Text>
                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Margin %</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{gstmargin ? gstmargin : ''}%</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Margin After GST</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{marginaftergst ? marginaftergst : ''}</Text>
                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>Free Total Box</Text>
                            <Text style={{ backgroundColor: '#f2f2f2', height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 10, fontFamily: 'Inter-Regular', color: '#000', textAlignVertical: 'center' }}>{freetotaloneboxcost ? freetotaloneboxcost : ''}</Text>
                        </View>
                    </View>

                    {loading ?
                        <ActivityIndicator size="large" color="#173161" />
                        : <View style={{ marginHorizontal: 5, justifyContent: 'flex-end' }}>
                            <MyButton btnname={"Save"} background="#173161" runFunc={(calculatordata?.id && !forcopy) ? Updatecalculations : Addcalculations} fontsize={18} textcolor="#FFF" />
                        </View>
                    }
                </ScrollView>
            </View>

            <Modal
                visible={errorModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.errorModal}>
                        <View style={styles.errorHeader}>
                            <Ionicons name="warning-outline" size={24} color="#FF6B6B" />
                            <Text style={styles.errorTitle}>message</Text>
                        </View>

                        <Text style={styles.errorMessage}>{errorMessage}</Text>

                        <TouchableOpacity
                            style={styles.errorButton}
                            onPress={() => setErrorModalVisible(false)}
                        >
                            <Text style={styles.errorButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorModal: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    errorTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: '#FF6B6B',
        marginLeft: 8,
        textTransform: 'capitalize'
    },
    errorMessage: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
        textTransform: 'capitalize'
    },
    errorButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 100,
    },
    errorButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        textAlign: 'center',
    },
});
export default AddCalculator