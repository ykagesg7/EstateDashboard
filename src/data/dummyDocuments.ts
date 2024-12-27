import { Document } from '@/types/property'; // 正しいパスからインポート

export const dummyDocuments: Document[] = [
  {
    id: 'doc1',
    property_id: '1', // string に修正
    user_id: 'user1', // 仮の user_id
    name: '間取り図',
    url: 'https://example.com/plan1.pdf',
    file_type: 'pdf',
    size: 1024,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'doc2',
    property_id: '1', // string に修正
    user_id: 'user1', // 仮の user_id
    name: '重要事項説明書',
    url: 'https://example.com/important1.pdf',
    file_type: 'pdf',
    size: 2048,
    created_at: '2024-01-02T00:00:00.000Z',
  },
  // ... 他のデータ
];