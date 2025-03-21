export interface Storage<T> {
  set(key: string, value: T): void;
  get(key: string): T;
  remove(key: string): void;
}

export const useStorage = () => {
  const set = <T,>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const get = <T,>(key: string) => {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  };

  const remove = (key: string) => {
    localStorage.removeItem(key);
  };

  return {
    set,
    get,
    remove,
  };
};
