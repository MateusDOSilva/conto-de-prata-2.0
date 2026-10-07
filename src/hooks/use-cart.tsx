'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { MAX_QUANTITY_PER_PRODUCT } from '@/lib/validations/order';

/** Carrinho guarda só id + quantidade (+ dados de exibição). Preço real é recalculado no servidor. */
export type CartItem = {
  product_id: string;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
};

type State = { items: CartItem[]; checkoutKey: string | null };
type Action =
  | { type: 'hydrate'; state: State }
  | { type: 'add'; item: Omit<CartItem, 'quantity'>; quantity: number }
  | { type: 'setQuantity'; product_id: string; quantity: number }
  | { type: 'remove'; product_id: string }
  | {
      type: 'sync';
      products: Pick<CartItem, 'product_id' | 'name' | 'slug' | 'price' | 'image_url'>[];
    }
  | { type: 'ensureCheckoutKey' }
  | { type: 'clear' };

const STORAGE_KEY = 'cart:v1';
const clamp = (q: number) => Math.min(MAX_QUANTITY_PER_PRODUCT, Math.max(1, Math.trunc(q) || 1));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'add': {
      const existing = state.items.find((i) => i.product_id === action.item.product_id);
      const items = existing
        ? state.items.map((i) =>
            i.product_id === action.item.product_id
              ? { ...i, ...action.item, quantity: clamp(i.quantity + action.quantity) }
              : i,
          )
        : [...state.items, { ...action.item, quantity: clamp(action.quantity) }];
      return { items, checkoutKey: null };
    }
    case 'setQuantity':
      return {
        items: state.items.map((i) =>
          i.product_id === action.product_id ? { ...i, quantity: clamp(action.quantity) } : i,
        ),
        checkoutKey: null,
      };
    case 'remove':
      return {
        items: state.items.filter((i) => i.product_id !== action.product_id),
        checkoutKey: null,
      };
    case 'sync': {
      // remove produtos que ficaram indisponíveis e atualiza nome/preço exibidos
      const byId = new Map(action.products.map((p) => [p.product_id, p]));
      const items = state.items
        .filter((i) => byId.has(i.product_id))
        .map((i) => ({ ...i, ...byId.get(i.product_id)! }));
      const changed = items.length !== state.items.length;
      return { items, checkoutKey: changed ? null : state.checkoutKey };
    }
    case 'ensureCheckoutKey':
      return state.checkoutKey ? state : { ...state, checkoutKey: crypto.randomUUID() };
    case 'clear':
      return { items: [], checkoutKey: null };
  }
}

function isValidState(value: unknown): value is State {
  if (!value || typeof value !== 'object') return false;
  const v = value as State;
  return (
    Array.isArray(v.items) &&
    v.items.every(
      (i) =>
        typeof i.product_id === 'string' &&
        typeof i.quantity === 'number' &&
        typeof i.name === 'string',
    )
  );
}

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  totalQuantity: number;
  estimatedTotal: number;
  checkoutKey: string | null;
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (product_id: string, quantity: number) => void;
  remove: (product_id: string) => void;
  sync: Extract<Action, { type: 'sync' }>['products'] extends infer P
    ? (products: P) => void
    : never;
  ensureCheckoutKey: () => void;
  clear: () => void;
  quantityOf: (product_id: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], checkoutKey: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      // localStorage: itens; sessionStorage: chave de idempotência (vale só para esta aba/sessão)
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const items = isValidState({ items: parsed?.items ?? [] })
        ? (parsed?.items as CartItem[]).map((i) => ({ ...i, quantity: clamp(i.quantity) }))
        : [];
      dispatch({
        type: 'hydrate',
        state: { items, checkoutKey: sessionStorage.getItem(`${STORAGE_KEY}:key`) },
      });
    } catch {
      // storage indisponível/corrompido: começa vazio
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
      if (state.checkoutKey) sessionStorage.setItem(`${STORAGE_KEY}:key`, state.checkoutKey);
      else sessionStorage.removeItem(`${STORAGE_KEY}:key`);
    } catch {
      // ignora (modo privado, cota)
    }
  }, [state, hydrated]);

  const add = useCallback<CartContextValue['add']>(
    (item, quantity = 1) => dispatch({ type: 'add', item, quantity }),
    [],
  );
  const setQuantity = useCallback(
    (product_id: string, quantity: number) =>
      dispatch({ type: 'setQuantity', product_id, quantity }),
    [],
  );
  const remove = useCallback((product_id: string) => dispatch({ type: 'remove', product_id }), []);
  const sync = useCallback<CartContextValue['sync']>(
    (products) => dispatch({ type: 'sync', products }),
    [],
  );
  const ensureCheckoutKey = useCallback(() => dispatch({ type: 'ensureCheckoutKey' }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      hydrated,
      checkoutKey: state.checkoutKey,
      totalQuantity: state.items.reduce((s, i) => s + i.quantity, 0),
      estimatedTotal:
        state.items.reduce((s, i) => s + Math.round(i.price * 100) * i.quantity, 0) / 100,
      add,
      setQuantity,
      remove,
      sync,
      ensureCheckoutKey,
      clear,
      quantityOf: (id) => state.items.find((i) => i.product_id === id)?.quantity ?? 0,
    }),
    [state, hydrated, add, setQuantity, remove, sync, ensureCheckoutKey, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}

export { reducer as cartReducer, type State as CartState };
