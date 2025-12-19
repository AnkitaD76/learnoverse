import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
    fetchNotifications,
    markNotificationRead,
} from '../../api/notifications';
import { respondSkillSwap } from '../../api/skillSwap';

const NotificationsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            const res = await fetchNotifications();
            setItems(res.notifications || []);
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleRead = async id => {
        await markNotificationRead(id);
        load();
    };

    const handleRespond = async (swapId, action) => {
        await respondSkillSwap(swapId, action);
        load();
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">
                Notifications
            </h1>

            {loading && <p className="text-sm text-[#4A4A4A]">Loading...</p>}
            {err && <p className="text-sm text-red-600">{err}</p>}

            {(items || []).map(n => (
                <Card key={n._id}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold">{n.title || n.type}</p>
                            <p className="text-sm text-[#4A4A4A]">
                                {n.message}
                            </p>
                            <p className="mt-1 text-xs text-[#4A4A4A]">
                                {new Date(n.createdAt).toLocaleString()}{' '}
                                {n.readAt ? '• Read' : '• Unread'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {!n.readAt && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleRead(n._id)}
                                >
                                    Mark Read
                                </Button>
                            )}

                            {n.type === 'skill_swap_request' &&
                                n.data?.skillSwapRequestId && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                                            onClick={() =>
                                                handleRespond(
                                                    n.data.skillSwapRequestId,
                                                    'accept'
                                                )
                                            }
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="border border-red-500 text-red-500 hover:bg-red-50"
                                            onClick={() =>
                                                handleRespond(
                                                    n.data.skillSwapRequestId,
                                                    'reject'
                                                )
                                            }
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                        </div>
                    </div>
                </Card>
            ))}

            {!loading && items.length === 0 && (
                <p className="text-sm text-[#4A4A4A]">No notifications yet.</p>
            )}
        </div>
    );
};

export default NotificationsPage;
