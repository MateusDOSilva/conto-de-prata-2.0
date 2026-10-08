// Gerado manualmente a partir das migrations. Substituir por `npm run db:types`
// (supabase gen types) quando o Supabase local estiver rodando.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export type OrderStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';
export type ProfileRole = 'admin' | 'manager' | 'customer';

type CategoryRow = Timestamps & { id: string; name: string; slug: string; active: boolean };
type ProductRow = Timestamps & {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
};
type StoreSettingsRow = Timestamps & {
  id: string;
  store_name: string;
  presentation_title: string;
  presentation_images: string[];
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_color: string | null;
  text_color: string | null;
  whatsapp_number: string;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
};
type OrderRow = Timestamps & {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_note: string | null;
  total_amount: number;
  status: OrderStatus;
  idempotency_key: string;
};
type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};
type ProfileRow = Timestamps & { id: string; role: ProfileRole };

type Table<Row, Required extends keyof Row, Rel = []> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: Rel;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'id'>;
      categories: Table<CategoryRow, 'name' | 'slug'>;
      products: Table<
        ProductRow,
        'category_id' | 'name' | 'slug' | 'price',
        [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ]
      >;
      store_settings: Table<StoreSettingsRow, 'store_name' | 'whatsapp_number'>;
      orders: Table<
        OrderRow,
        'customer_name' | 'customer_phone' | 'total_amount' | 'idempotency_key'
      >;
      order_items: Table<
        OrderItemRow,
        'order_id' | 'product_id' | 'product_name' | 'unit_price' | 'quantity' | 'subtotal',
        [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ]
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      create_order: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_note: string | null;
          p_items: Json;
          p_idempotency_key: string;
        };
        Returns: { order_id: string; order_number: number; created: boolean }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
