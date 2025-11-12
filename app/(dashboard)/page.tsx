import { StatisticsCards } from '@/components/dashboard/StatisticsCards';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Kiosk Backoffice</p>
      </div>
      <StatisticsCards />
    </div>
  );
}
