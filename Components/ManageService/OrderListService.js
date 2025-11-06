import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Image
} from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Constant from '../Commoncomponent/Constant'



const OrderListService = ({ navigation, route }) => {
    const { customerid, selectedOrderNo, customerName } = route.params || {}
    const [orderList, setOrderList] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(selectedOrderNo || null);

    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)

    // API call to fetch orders
    const listOrders = async (staffId) => {
        if (!staffId) return
        console.log("staff id ye hai", staffId)
        setLoading(true)
        try {
            const url = `${Constant.URL}${Constant.OtherURL.staff_wise_order_list}`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id: staffId }),
            })
            const result = await response.json()
            if (result.code == '200') {
                const formatted = result.Payload.map(item => ({
                    label: `Order no ${item.order_no}`,
                    value: String(item.order_no),
                    order_no: item.order_no,
                    customer_name: item.customer_name || '',
                    order_date: item.order_date || '',
                    status: item.status || 'Pending'
                }))
                setOrderList(formatted)
                setFilteredOrders(formatted)
            } else {
                setOrderList([])
                setFilteredOrders([])
            }
        } catch (error) {
            console.log('Network error in listOrders:', error)
            setOrderList([])
            setFilteredOrders([])
        } finally {
            setLoading(false)
        }
    }

    // Handle search functionality
    const handleSearchChange = (text) => {
        setSearchTerm(text)

        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const newTimeout = setTimeout(() => {
            if (text.trim() === '') {
                setFilteredOrders(orderList)
            } else {
                const filtered = orderList.filter(order =>
                    order.order_no.toLowerCase().includes(text.toLowerCase())
                    // order.company_name.toLowerCase().includes(text.toLowerCase()) ||
                    // order.label.toLowerCase().includes(text.toLowerCase())
                )
                setFilteredOrders(filtered)
            }
        }, 300)

        setSearchTimeout(newTimeout)
    }

    // Handle order selection
    const handleOrderSelect = (orderNo) => {
        navigation.replace('AddService', {
            orderId: item.order_id,
            orderNo: item.order_no
        })
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FFA500'
            case 'loading': return '#007BFF'
            case 'delivered': return '#28A745'
            case 'cancelled': return '#DC3545'
            case 'on the way': return '#17A2B8'
            case 'advanced': return '#6F42C1'
            default: return '#6C757D'
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (customerid) {
                listOrders(customerid)
            }
        }, [customerid])
    )

    // Render each order item
    const renderOrderItem = ({ item, index }) => (
        <TouchableOpacity
            style={{
                backgroundColor: selectedOrder === item.order_no ? '#e0e9ff' : '#FFFFFF',
                borderRadius: 10,
                padding: 15,
                marginHorizontal: 15,
                marginBottom: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            onPress={() =>
                navigation.navigate('AddService', {
                    orderId: item.order_id,
                    orderNo: item.order_no,
                    customerid: customerid,
                    customerName: item.customer_name,
                    service: route.params?.service || null,
                })
            }
        >
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 16,
                            color: '#173161',
                            marginBottom: 4
                        }}>
                            {item.label}
                        </Text>
                        <Text style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#666',
                            marginBottom: 8
                        }}>
                            {item.company_name}
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: getStatusColor(item.status),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginLeft: 10
                    }}>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontFamily: 'Inter-Medium'
                        }}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                <Text style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 12,
                    color: '#999'
                }}>
                    Order Date: {formatDate(item.order_date)}
                </Text>
            </View>

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('AddService', {
                        orderId: item.order_id,
                        orderNo: item.order_no,
                        customerid: customerid,
                        customerName: item.customer_name,
                        service: route.params?.service || null,
                    })
                }
                style={{
                    marginLeft: 10,
                    backgroundColor: '#17316120',
                    padding: 8,
                    borderRadius: 50
                }}
            >
                <Ionicons name="chevron-forward" size={20} color="#173161" />
            </TouchableOpacity>
        </TouchableOpacity>
    )

    // Render empty state
    const renderEmptyState = () => (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 100
        }}>
            <Ionicons name="document-text-outline" size={80} color="#173161" />
            <Text style={{
                fontFamily: 'Inter-Bold',
                fontSize: 16,
                color: '#173161',
                marginTop: 16,
                marginBottom: 8
            }}>
                No orders available
            </Text>
            <Text style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: '#666',
                textAlign: 'center'
            }}>
                {customerid ? 'No orders found for this customer' : 'Customer ID not provided'}
            </Text>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />

            {/* Header */}
            <View style={{
                backgroundColor: '#173161',
                flexDirection: 'row',
                height: 60,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 15
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={{
                    color: '#FFF',
                    fontFamily: 'Inter-Bold',
                    fontSize: 16,
                    flex: 1,
                    textAlign: 'center'
                }}>
                    Select Order
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={{
                padding: 15,
                backgroundColor: '#FFF',
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0'
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F8F8F8',
                    borderRadius: 10,
                    paddingHorizontal: 15,
                    borderWidth: 1,
                    borderColor: '#E0E0E0'
                }}>
                    <Ionicons name="search" size={18} color="#666" style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="Search by order no"
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                        placeholderTextColor="#999"
                        style={{
                            flex: 1,
                            height: 45,
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#333'
                        }}
                    />
                </View>
            </View>

            {/* Orders Count */}
            {filteredOrders.length > 0 && (
                <View style={{
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    backgroundColor: '#FFF'
                }}>
                    <Text style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: '#666'
                    }}>
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}

            {/* Orders List */}
            <View style={{ flex: 1 }}>
                {loading ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <ActivityIndicator size="large" color="#173161" />
                        <Text style={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 14,
                            color: '#666',
                            marginTop: 10
                        }}>
                            Loading orders...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item, index) => `${item.value}-${index}`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingVertical: 10,
                            paddingBottom: 80
                        }}
                        ListEmptyComponent={renderEmptyState}
                    />
                )}
            </View>
            <View style={{
                position: 'absolute',
                bottom: 15,
                alignSelf: 'center',
                zIndex: 10,
            }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate('AddService', {
                            customerid: customerid,
                            customerName: customerName,
                        })
                    }
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a326e',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 25,
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 3 },
                        shadowRadius: 4,
                    }}>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 16,
                            fontFamily: 'Inter-SemiBold',
                        }}>
                        New Service
                    </Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

export default OrderListService

const styles = StyleSheet.create({})