"use client";

import { useState, useEffect } from "react";

const MyOrder = () => {
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const [itemName, setItemName] = useState('');

    const handleAddOrder = async () => {
        if (!itemName) {
            alert("Please enter an item name.");
            return;
        }

        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item: itemName }),
            });
            setItemName('');
        } catch (error) {
            console.error('Error adding order:', error);
        }
    };

    useEffect(() => {
        const es = new EventSource('/api/orders');

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setOrderCount(data.orderCount || 0);
            setOrderDetails(data.orders || []);
        };

        es.onerror = (error) => {
            console.error('SSE Error:', error);
            es.close();
        };

        return () => {
            es.close();
        };
    }, []);

    return (
        <div>
            <input 
                type="text" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                className="border-2 border-slate-400 rounded-md h-10 p-2"
            />
            <br />
            <button 
                onClick={handleAddOrder}
                className="mt-2 bg-blue-500 h-10 px-2 text-white rounded-md"
            >
                Add Order
            </button>
            <div>
                <h1 className="mt-4 text-xl font-bold">Total Orders: {orderCount}</h1>
                <h2 className="mt-2 text-xl font-bold">Order List:</h2>
                <ul>
                    {orderDetails.map((order) => (
                        <li key={order.id}>{order.item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MyOrder;
