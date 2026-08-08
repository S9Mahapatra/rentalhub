import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';

interface CategoryTile {
  name: string;
  slug: string;
  description: string;
  image: string;
}

async function getCategories(): Promise<CategoryTile[]> {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isActive: true })
      .select('name slug description image')
      .sort({ createdAt: 1 })
      .lean();

    return categories.map((c: any) => ({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
    }));
  } catch (error) {
    console.error('BentoCategoryGrid: failed to load categories', error);
    return [];
  }
}

/**
 * Calculates responsive grid column spans automatically based on total count.
 * If the total count is odd, the last category expands to fill the entire bottom row (12 columns).
 */
function getCategoryTileSpan(index: number, total: number) {
  const isLast = index === total - 1;
  const isOddTotal = total % 2 !== 0;

  // Auto-expand last item if orphaned on an odd-numbered row
  if (isLast && isOddTotal) {
    return 'lg:col-span-12';
  }

  // Standard paired Bento rhythms
  const rhythms = [
    'lg:col-span-8',
    'lg:col-span-4',
    'lg:col-span-5',
    'lg:col-span-7',
    'lg:col-span-7',
    'lg:col-span-5',
  ];

  return rhythms[index % rhythms.length];
}

export default async function BentoCategoryGrid() {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  const totalCategories = categories.length;

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 py-8">
      {/* SECTION HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight">
          Browse By Category
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Select equipment suited for your weekend trip, shoot, or project duration
        </p>
      </div>

      {/* AUTO-RESPONSIVE BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {categories.map((cat, index) => {
          const colSpan = getCategoryTileSpan(index, totalCategories);

          return (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`group relative rounded-[24px] overflow-hidden bg-neutral-950 ${colSpan} h-[220px] sm:h-[260px] flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-neutral-800/40`}
            >
              {/* BACKGROUND IMAGE WITH SMOOTH ZOOM */}
              {cat.image && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-65 group-hover:opacity-80"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              )}

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

              {/* TOP RIGHT ARROW BADGE */}
              <div className="relative z-10 flex justify-end">
                <span className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-2xs">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              {/* BOTTOM TITLE & SMALL DESCRIPTION */}
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase leading-tight mb-1.5 group-hover:text-neutral-100">
                  {cat.name}
                </h3>

                {cat.description && (
                  <p className="text-[11px] sm:text-xs text-neutral-300/90 font-medium leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}