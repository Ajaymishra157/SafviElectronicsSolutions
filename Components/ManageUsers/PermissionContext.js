import React, { createContext, useState, useEffect } from 'react';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PermissionsContext = createContext();

const PermissionsProvider = ({ children }) => {
    const [permissionsList, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState({});

    const listPermissions = async () => {
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id:id }),
        });
        const result = await response.json();
        if (result.code === "200") {
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
    };

    useEffect(() => {
        listPermissions(); // Fetch permissions when component mounts
    }, []);

    return (
        <PermissionsContext.Provider value={{ permissionsList, permissions }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export default PermissionsProvider;
