import { MaintenanceRecord } from '@/types/property';

export const dummyMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'main1',
    property_id: '1',
    user_id: 'user1',
    title: '給湯器の修理',
    description: '水漏れ',
    status: 'completed',
    scheduled_date: '2024-01-09',
    completed_date: '2024-01-10',
    cost: 50000,
    created_at: '2024-01-10T10:00:00.000Z',
  },
  // ... 他のデータ
];