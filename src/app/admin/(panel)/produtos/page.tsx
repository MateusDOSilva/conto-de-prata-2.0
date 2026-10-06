import Image from 'next/image';
import Link from 'next/link';
import { DeleteProductButton } from '@/components/admin/delete-product-button';
import { toggleProductAction } from '@/lib/actions/product.actions';
import { formatBRL } from '@/lib/format/currency';
import { listProducts } from '@/lib/services/product.service';

export const metadata = { title: 'Produtos' };

export default async function AdminProductsPage() {
  const products = await listProducts();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Novo produto
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-neutral-500">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                      {p.image_url && (
                        <Image
                          src={p.image_url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <Link href={`/admin/produtos/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="p-3">{p.category?.name}</td>
                <td className="p-3 tabular-nums">{formatBRL(p.price)}</td>
                <td className="p-3">
                  <form action={toggleProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(!p.active)} />
                    <button
                      className={`rounded-full px-2 py-0.5 text-xs ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'}`}
                      title={p.active ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      {p.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/produtos/${p.id}`} className="text-xs hover:underline">
                      Editar
                    </Link>
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-center text-neutral-500">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
}
