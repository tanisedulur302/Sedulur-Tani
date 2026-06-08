export default function features() {
  const features = [
    {
      title: "Kualitas Terbaik",
      desc: "Pupuk pilihan langsung dari supplier terpercaya untuk hasil maksimal.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      ),
    },
    {
      title: "Harga Terjangkau",
      desc: "Promo menarik setiap bulan dan harga khusus pembelian besar.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      title: "Pengiriman Cepat",
      desc: "Pengiriman cepat ke seluruh Indonesia dengan ekspedisi terpercaya.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
    },
  ];
  return (
    <section className="py-8 lg:py-13">
      <div className="text-center mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-bounce-in">
          Keunggulan Sedulur Tani
        </h2>
        <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto animate-fade-in-delay-1">
          Solusi terpercaya untuk kebutuhan pertanian modern dengan layanan
          terbaik
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {features.map((item, index) => (
          <div
            key={index}
            className={`bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-500 group hover:-translate-y-2 animate-scale-in`}
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg
                className="w-8 h-8 lg:w-10 lg:h-10 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {item.icon}
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center group-hover:text-emerald-700 transition-colors duration-300">
              {item.title}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
