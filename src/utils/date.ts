/**
 * 指定された日付が属する月の開始日と終了日を取得します
 * @param date 対象の日付
 * @returns 月の開始日と終了日のオブジェクト
 */
export function getMonthRange(date: Date = new Date()): { startDate: Date; endDate: Date } {
  // 月の初日を取得（同じ年・同じ月の1日）
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // 月の最終日を取得（翌月の0日 = 当月の最終日）
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  return { startDate, endDate };
}

/**
 * 日付をYYYY-MM-DD形式の文字列に変換します
 * @param date 変換する日付
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 指定された月数分の過去の日付を取得します
 * @param monthsAgo 過去の月数
 * @returns 指定された月数前の日付
 */
export function getDateMonthsAgo(monthsAgo: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date;
}

/**
 * 指定された日付が含まれる月を「YYYY年MM月」形式で返します
 * @param dateString 日付文字列（YYYY-MM-DD形式）
 * @returns YYYY年MM月形式の文字列
 */
export function formatYearMonth(dateString: string): string {
  const [year, month] = dateString.split('-');
  return `${year}年${month}月`;
}
