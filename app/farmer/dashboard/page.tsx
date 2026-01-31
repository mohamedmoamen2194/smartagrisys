"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { FarmerDashboardSections } from "@/components/farmer/dashboard-sections"
import { FarmerPageHeader } from "@/components/farmer/page-header"
import { useTranslations } from "@/hooks/useTranslations"

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  inventoryItems: number;
  lowStockItems: number;
};

export default function FarmerDashboardPage() {
  const { t, locale } = useTranslations()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    inventoryItems: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmLocation, setFarmLocation] = useState("Cairo");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          setError('User not authenticated');
          return;
        }

        try {
          const parsedUser = JSON.parse(user);
          const rawAddress = parsedUser?.profile?.farmAddress ?? parsedUser?.profile?.farmaddress;
          if (typeof rawAddress === "string" && rawAddress.trim().length > 0) {
            setFarmLocation(rawAddress.trim());
          } else {
            setFarmLocation("Cairo");
          }
        } catch {
          setFarmLocation("Cairo");
        }

        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'authorization': user
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <FarmerPageHeader title={t("farmer.dashboard")} />

      <FarmerDashboardSections
        stats={stats}
        loading={loading}
        error={error}
        onRefresh={() => window.location.reload()}
        locale={locale}
        defaultLocation={farmLocation}
      />
    </div>
  );
}
