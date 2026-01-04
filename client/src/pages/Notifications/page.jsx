import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchNotifications, markNotificationRead } from '../../api/notifications';
import { respondSkillSwap } from '../../api/skillSwap';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchNotifications();
      setNotifications(res.notifications || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isRead = n => !!n.readAt;

  const handleMarkRead = async notifId => {
    try {
      await markNotificationRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n._id === notifId ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwap = async (notif, action) => {
    const swapId = notif?.data?.skillSwapRequestId;
    if (!swapId) return;

    try {
      setBusyId(notif._id);
      setError(null);

      await respondSkillSwap(swapId, action);

      await markNotificationRead(notif._id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to respond to skill swap');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6">Loading...</Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          {error}
        </Card>
      )}

      {notifications.length === 0 ? (
        <Card className="p-6 text-center text-sm opacity-70">
          No notifications yet.
        </Card>
      ) : (
        notifications.map(n => {
          const skillSwapRequest = n.type === 'skill_swap_request';
          const swapId = n.data?.skillSwapRequestId;

          return (
            <Card
              key={n._id}
              className={`p-4 space-y-2 ${
                isRead(n) ? 'opacity-70' : 'border border-[#FF6A00]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">{n.title || 'Notification'}</h2>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {!isRead(n) && (
                  <Button
                    onClick={() => handleMarkRead(n._id)}
                    className="bg-gray-200 text-black hover:bg-gray-300"
                  >
                    Mark Read
                  </Button>
                )}
              </div>

              {/* ✅ Skill Swap Actions */}
              {skillSwapRequest && swapId && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleSwap(n, 'accept')}
                    isLoading={busyId === n._id}
                    className="bg-[#00A86B] text-white hover:bg-[#008f5a]"
                  >
                    Accept
                  </Button>

                  <Button
                    onClick={() => handleSwap(n, 'reject')}
                    isLoading={busyId === n._id}
                    className="bg-[#E74C3C] text-white hover:bg-[#cf3f31]"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
