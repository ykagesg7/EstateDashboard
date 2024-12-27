import { FinancialRecord } from '@/types/property';

export const dummyFinancialRecords: FinancialRecord[] = [
  {
    id: 'fin1',
    property_id: '1',
    user_id: 'user1',
    type: '収入',
    amount: 100000,
    date: '2024-01-15',
    description: '家賃収入',
    created_at: '2024-01-15T12:00:00.000Z',
  },
  // ... 他のデータ
];