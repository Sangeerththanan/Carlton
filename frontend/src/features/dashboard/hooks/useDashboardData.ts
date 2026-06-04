import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';

export const useDashboardData = () => {
  const [user, setUser] = useState<any | null>(null);
  const [nextTrip, setNextTrip] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [uRes, nRes, notifRes, routesRes, promosRes] = await Promise.all([
          fetch(API_ENDPOINTS.DASHBOARD.USER),
          fetch(API_ENDPOINTS.DASHBOARD.NEXT_TRIP),
          fetch(API_ENDPOINTS.DASHBOARD.NOTIFICATIONS),
          fetch(API_ENDPOINTS.DASHBOARD.ROUTES),
          fetch(API_ENDPOINTS.DASHBOARD.PROMOTIONS),
        ]);

        if (uRes.ok) setUser(await uRes.json());
        if (nRes.ok) setNextTrip(await nRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
        if (routesRes.ok) setRoutes(await routesRes.json());
        if (promosRes.ok) setPromotions(await promosRes.json());
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { user, nextTrip, notifications, routes, promotions, loading, error };
};
