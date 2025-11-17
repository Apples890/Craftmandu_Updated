import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function WishlistSection() {
  const { items, remove, clear } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-sm text-gray-600 mb-4">Save products you love and move them to your cart anytime.</p>
        <Link to="/browse" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Wishlist ({items.length})</h3>
        <button onClick={clear} className="text-sm text-red-600 hover:text-red-700">Clear All</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
            <img src={it.imageUrl || ''} alt={it.name} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{it.name}</h4>
              <p className="text-sm text-gray-600">{it.vendorName || ''}</p>
              <div className="mt-1 text-primary-600 font-semibold">
                <span className="text-gray-600 mr-1">Nrs</span>{Math.round((it.priceCents || 0)/100).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (!user) { navigate(`/login?redirect=${encodeURIComponent('/dashboard')}`); return; } addToCart({ id: it.id, name: it.name, price: Math.round((it.priceCents||0)/100), image: it.imageUrl, quantity: 1 }); }}
                className="btn-primary flex items-center gap-1"
                title="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add</span>
              </button>
              <button onClick={() => remove(it.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
