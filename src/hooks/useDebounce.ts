import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // valueが変更されたら、指定された遅延の後にdebouncedValueを更新
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 次のuseEffectが実行される前、または
    // コンポーネントがアンマウントされるときにタイムアウトをクリア
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
} 