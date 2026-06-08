"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cartApi, addressApi, checkoutApi, paymentApi } from "@/lib/api";
import { Cart, Address } from "@/lib/types";
import { toast } from "@/lib/toast";
import SimpleShippingInfo from "@/components/checkout/SimpleShippingInfo";
import PaymentModal from "@/components/checkout/PaymentModal";
import CheckoutConfirmModal from "@/components/checkout/CheckoutConfirmModal";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    show: boolean;
    invoiceUrl: string;
    checkoutId: string;
  }>({ show: false, invoiceUrl: "", checkoutId: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartRes, addressRes] = await Promise.all([
        cartApi.getCart(),
        addressApi.getAll(),
      ]);

      setCart(cartRes.data.data.cart);
      setAddresses(addressRes.data.data.addresses || []);

      const defaultAddr = addressRes.data.data.addresses?.find(
        (a: Address) => a.is_default
      );
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      } else if (addressRes.data.data.addresses?.length > 0) {
        setSelectedAddress(addressRes.data.data.addresses[0].id);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Gagal memuat data checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalWeight = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + item.product.weight * item.quantity;
    }, 0);
  };

  const handleShippingCalculated = (cost: number) => {
    setShippingPrice(cost);
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingPrice;
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Silakan pilih alamat pengiriman");
      return;
    }

    // Show confirmation modal first
    setShowConfirmModal(true);
  };

  const handleConfirmCheckout = async () => {
    setProcessing(true);

    try {
      // Create checkout first
      const checkoutRes = await checkoutApi.create({
        addressId: selectedAddress,
        items:
          cart?.items.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
          })) || [],
        shippingCost: shippingPrice,
        notes: notes,
        shipping_method: "Standard",
      });

      const checkoutId = checkoutRes.data.data.checkout.id;

      // Create payment with correct field name
      const paymentRes = await paymentApi.create({
        checkout_id: checkoutId,
      });

      const invoiceUrl = paymentRes.data.data.invoice_url;

      // Show payment modal instead of redirect
      if (invoiceUrl) {
        setPaymentModal({
          show: true,
          invoiceUrl: invoiceUrl,
          checkoutId: checkoutId,
        });
        setShowConfirmModal(false); // Close confirm modal
        setProcessing(false);
      } else {
        toast.error("Gagal memproses pembayaran");
        setProcessing(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Checkout gagal");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white rounded-2xl"></div>
                <div className="h-48 bg-white rounded-2xl"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 bg-white rounded-2xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-16 pt-32 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Keranjang Kosong
          </h2>
          <p className="text-gray-500 mb-8">Tidak ada item untuk diproses.</p>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            Mulai Belanja
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Alamat Pengiriman
                </h2>
                <button
                  onClick={() => router.push("/profile?tab=addresses")}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Kelola Alamat
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 mb-4">
                    Belum ada alamat tersimpan.
                  </p>
                  <button
                    onClick={() => router.push("/profile?tab=addresses")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none"
                  >
                    Tambah Alamat Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`relative block p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? "border-emerald-600 bg-white"
                          : "border-gray-300 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-900">
                              {address.label}
                            </span>
                            {address.is_default && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {address.recipient_name} • {address.phone}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {address.address_line}, {address.city},{" "}
                            {address.province} {address.postal_code}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Rincian Pesanan
              </h2>
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={
                          item.product.image_url ||
                          "https://via.placeholder.com/150?text=No+Image"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {item.quantity} x Rp{" "}
                        {item.product.price.toLocaleString("id-ID")}
                      </p>
                      <p className="font-bold text-emerald-600">
                        Rp{" "}
                        {(item.product.price * item.quantity).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Calculator */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <SimpleShippingInfo
                weight={calculateTotalWeight()}
                destinationProvince={
                  selectedAddress
                    ? addresses.find((a) => a.id === selectedAddress)?.province
                    : undefined
                }
                onShippingCalculated={handleShippingCalculated}
              />
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Catatan Pesanan
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis catatan untuk penjual (opsional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                Contoh: Kirim saat jam kerja, Jangan dibungkus kardus, dll.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ringkasan Pembayaran
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-start text-gray-600">
                  <div>
                    <span>Total Harga ({cart.total_items} barang)</span>
                  </div>
                  <span>Rp {calculateSubtotal().toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between items-start text-gray-600">
                  <div>
                    <span>Total Berat</span>
                  </div>
                  <span>{(calculateTotalWeight() / 1000).toFixed(2)} kg</span>
                </div>

                <div className="flex justify-between items-start text-gray-600">
                  <div className="flex flex-col">
                    <span>Biaya Pengiriman</span>
                    {shippingPrice > 0 && (
                      <span className="text-xs text-gray-400">
                        Standar • Est. 3-7 hari
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">+</span>
                    <span>
                      {shippingPrice > 0
                        ? `Rp ${shippingPrice.toLocaleString("id-ID")}`
                        : "Pilih alamat"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-start text-gray-600 text-sm">
                  <span>Biaya Layanan</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">+</span>
                    <span>Rp 0</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Tagihan</span>
                  <span className="text-xl font-bold text-gray-900">
                    Rp {calculateTotal().toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={
                  processing || addresses.length === 0 || shippingPrice === 0
                }
                className="w-full bg-emerald-600 text-white py-3.5 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Bayar Sekarang
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan melanjutkan pembayaran, Anda menyetujui Syarat &
                Ketentuan yang berlaku.
              </p>
            </div>
          </div>
        </div>
      </main>

      {showConfirmModal && cart && selectedAddress && (
        <CheckoutConfirmModal
          cart={cart}
          selectedAddress={addresses.find((a) => a.id === selectedAddress)!}
          shippingPrice={shippingPrice}
          notes={notes}
          onConfirm={handleConfirmCheckout}
          onCancel={() => setShowConfirmModal(false)}
          isProcessing={processing}
        />
      )}

      {paymentModal.show && (
        <PaymentModal
          invoiceUrl={paymentModal.invoiceUrl}
          checkoutId={paymentModal.checkoutId}
          onClose={() =>
            setPaymentModal({ show: false, invoiceUrl: "", checkoutId: "" })
          }
        />
      )}
    </div>
  );
}
