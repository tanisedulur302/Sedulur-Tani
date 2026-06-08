import Link from 'next/link';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
        <div className="aspect-square bg-gray-200 relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-bold text-xl">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span className="text-sm text-gray-500">
              Stock: {product.stock}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Weight: {product.weight}g
          </p>
        </div>
      </div>
    </Link>
  );
}
