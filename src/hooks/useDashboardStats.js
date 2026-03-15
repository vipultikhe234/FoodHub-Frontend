import { useState, useEffect } from 'react';
import { orderService } from '../services/api';

export const useDashboardStats = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, statsRes] = await Promise.all([
                    orderService.getAllOrders(),
                    orderService.getStats(),
                ]);
                setOrders(ordersRes.data.data || []);
                setStats(statsRes.data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.response?.data?.message || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const prev = orders.find(o => o.id === orderId)?.status;
        // Optimistic update
        setOrders(all => all.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            await orderService.updateStatus(orderId, newStatus);
        } catch (err) {
            // Revert on failure, show real error
            setOrders(all => all.map(o => o.id === orderId ? { ...o, status: prev } : o));
            const msg = err.response?.data?.message
                || err.response?.data?.errors?.status?.[0]
                || 'Status update failed';
            alert(`❌ ${msg}  (HTTP ${err.response?.status || 'Network error'})`);
        }
    };

    return { orders, stats, loading, error, handleStatusChange };
};
