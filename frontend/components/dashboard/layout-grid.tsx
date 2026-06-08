"use client";
import { LayoutGrid } from "../ui/layout-grid";

export default function LayoutGridDemo() {
  return (
    <div className="h-screen w-full">
      <LayoutGrid cards={cards} />
    </div>
  );
}
const SkeletonOne = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Pupuk NPK 16-16-16
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Pupuk majemuk seimbang yang membantu pertumbuhan daun, batang, dan akar.
        Cocok untuk berbagai jenis tanaman seperti jagung, cabai, padi, dan sayuran.
      </p>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">Pupuk Urea</p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Mengandung nitrogen tinggi untuk merangsang pertumbuhan vegetatif tanaman.
        Sangat efektif digunakan pada tanaman padi, jagung, dan sayuran hijau.
      </p>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">Pupuk Organik</p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Pupuk alami ramah lingkungan yang memperbaiki struktur tanah.
        Baik untuk pertanian organik dan meningkatkan kesuburan jangka panjang.
      </p>
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">Pupuk Kandang & Kompos</p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Sumber nutrisi lengkap yang memperbaiki kualitas tanah dan meningkatkan
        aktivitas mikroorganisme. Cocok untuk semua jenis tanaman.
      </p>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: <SkeletonOne />,
    className: "md:col-span-2",
    thumbnail:
      "https://kontainerindonesia.co.id/blog/wp-content/uploads/2024/01/Menilik-Potensi-Ekspor-Pupuk-di-Indonesia-dan-8-Jenisnya-1-scaled.jpg",
  },
  {
    id: 2,
    content: <SkeletonTwo />,
    className: "col-span-1",
    thumbnail:
      "https://lh7-rt.googleusercontent.com/docsz/AD_4nXeuqFtJL7IisUksc98AIvvfwzQtCWzNrPF8aKxaMLbWfAGFZAjdj8OWwaJK-AhkByndrtQxhGgdE5oqoII9AbLzUDsOK-4Yirp-8IdnMQ_VGylFC92y_M6pn5fvDGNmwHFl3jbV3N3zbQWD2Sm0PZk?key=Q2BNe3fEkGzLNzM5Bbt2wcoQ",
  },
  {
    id: 3,
    content: <SkeletonThree />,
    className: "col-span-1",
    thumbnail:
      "https://id-live-01.slatic.net/p/ff387b65534959b46c3508b32ac5c6d4.jpg",
  },
  {
    id: 4,
    content: <SkeletonFour />,
    className: "md:col-span-2",
    thumbnail:
      "https://asset.kompas.com/crops/6ovyj-I75t3AkyS2KvYMmNKf_3Y=/77x47:1000x662/1200x800/data/photo/2021/04/11/60731d7aaa4f4.jpg",
  },
];
