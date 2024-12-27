import { Property } from "@/types/property";

export const dummyProperties: Property[] = [
  {
    id: "1",
    user_id: "user-A",
    created_at: new Date().toISOString(),
    name: "桜木町の庭付き一戸建て",
    description: "日当たりの良い南向きの庭が魅力的な一戸建てです。家族でのびのびと暮らしたい方におすすめです。",
    price: 85000000,
    address: "神奈川県横浜市中区桜木町1-1-1",
    bedrooms: 4,
    bathrooms: 2,
    square_footage: 150,
    status: "運用中",
  },
  {
    id: "2",
    user_id: "user-B",
    created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), // 3日前の日付
    name: "代官山のデザイナーズマンション",
    description: "代官山駅から徒歩 5 分の好立地にある、洗練されたデザインのマンションです。シングルやカップルに最適です。",
    price: 62000000,
    address: "東京都渋谷区代官山町10-10",
    bedrooms: 1,
    bathrooms: 1,
    square_footage: 55,
    status: "運用中",
  },
  {
    id: "3",
    user_id: "user-C",
    created_at: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), // 7日前の日付
    name: "豊洲のタワーマンション",
    description: "豊洲のランドマークタワーにある、眺望が自慢のマンションです。夜景は息をのむ美しさです。",
    price: 120000000,
    address: "東京都江東区豊洲2-2-2",
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 100,
    status: "検討中",
  },
  {
    id: "4",
    user_id: "user-D",
    created_at: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(), // 14日前の日付
    name: "自由が丘のペット可テラスハウス",
    description: "ペットと一緒に暮らせる、緑豊かな自由が丘のテラスハウスです。専用庭付きで、ペットも快適に過ごせます。",
    price: 78000000,
    address: "東京都世田谷区自由が丘3-3-3",
    bedrooms: 2,
    bathrooms: 1,
    square_footage: 80,
    status: "契約済",
  },
  {
    id: "5",
    user_id: "user-E",
    created_at: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), // 30日前の日付
    name: "鎌倉のリノベーション古民家",
    description: "趣のある古民家を современный にリノベーションしました。落ち着いた雰囲気の中で、ゆったりとした時間を過ごしたい方におすすめです。",
    price: 95000000,
    address: "神奈川県鎌倉市由比ヶ浜4-4-4",
    bedrooms: 3,
    bathrooms: 1,
    square_footage: 130,
    status: "運用中",
  },
];