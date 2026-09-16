// import { Star } from 'lucide-react';
// import Image from 'next/image';

// const products = [
//   {
//     brand: 'Vender Rame',
//     name: 'Unique vases',
//     price: '$140.00',
//     originalPrice: '$140.00',
//     rating: 4.7,
//     image: '/assets/products/product.png',
//     avatar: '/images/avatars/vender-rame.jpg',
//   },
//   {
//     brand: 'Ecorlame',
//     name: 'Distinctive Lighting',
//     price: '$140.00',
//     originalPrice: '$140.00',
//     rating: 4.8,
//     image: '/assets/products/product.png',
//     avatar: '/images/avatars/ecorlame.jpg',
//   },
//   {
//     brand: 'AuroBeauty',
//     name: 'Handcrafted Home Tech',
//     price: '$140.00',
//     originalPrice: '$140.00',
//     rating: 4.6,
//     image: '/assets/products/product.png',
//     avatar: '/images/avatars/aurobeauty.jpg',
//   },
//   {
//     brand: 'AuroBeauty',
//     name: 'Artisanal Apparel',
//     price: '$120.00',
//     originalPrice: '$140.00',
//     rating: 4.7,
//     image: '/assets/products/product.png',
//     avatar: '/images/avatars/aurobeauty.jpg',
//   },
//   {
//     brand: 'AuroBeauty',
//     name: 'Unique Bags',
//     price: '$120.00',
//     originalPrice: '$140.00',
//     rating: 4.8,
//     image: '/assets/products/product.png',
//     avatar: '/images/avatars/aurobeauty.jpg',
//   },
//   {
//     brand: 'AuroBeauty',
//     name: "Flower' Vase",
//     price: '$160.00',
//     originalPrice: '$140.00',
//     rating: 4.5,
//     image: '/assets/products/product.png',
//     avatar: '/images/avatars/aurobeauty.jpg',
//   },
// ];

// function Rating({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-1">
//       <div className="flex gap-px">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             size={10}
//             strokeWidth={1.5}
//             fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
//             className={star <= Math.round(rating) ? 'text-warning' : 'text-border-strong'}
//           />
//         ))}
//       </div>
//       <span className="text-[8px] text-text-tertiary">{rating.toFixed(1)}</span>
//     </div>
//   );
// }

// export default function TopPicks() {
//   return (
//     <section className="w-full bg-background py-14 sm:py-16">
//       <div className="mx-auto max-w-6xl px-5 sm:px-6">
//         {/* Section title */}
//         <h2 className="mb-8 text-center text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
//           Top Picks: What&apos;s Hot
//         </h2>

//         {/* Products grid */}
//         <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
//           {products.map((product) => (
//             <article
//               key={`${product.brand}-${product.name}`}
//               className="group overflow-hidden rounded-lg border border-border-default bg-surface-raised transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out will-change-transform hover:scale-105 hover:border-border-strong hover:bg-surface-hover hover:shadow-lg motion-reduce:transition-none"
//             >
//               {/* Product image */}
//               <div className="relative aspect-[1.15/1] overflow-hidden bg-surface-subtle">
//                 <Image
//                   src={product.image}
//                   alt={product.name}
//                   fill
//                   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                   className="object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
//                 />

//                 {/* Best seller badge */}
//                 <div className="absolute top-3 left-3 rounded-xs bg-warning px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-white shadow-xs">
//                   Best Seller
//                 </div>
//               </div>

//               {/* Product details */}
//               <div className="px-3.5 pt-3 pb-4">
//                 <div className="flex items-center justify-between gap-2">
//                   <div className="flex min-w-0 items-center gap-1.5">
//                     <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-surface-subtle">
//                       <Image
//                         src={product.avatar}
//                         alt={product.brand}
//                         fill
//                         sizes="20px"
//                         className="object-cover"
//                       />
//                     </div>
//                     <span className="truncate text-[9px] font-medium text-text-secondary">
//                       {product.brand}
//                     </span>
//                   </div>

//                   <Rating rating={product.rating} />
//                 </div>

//                 <h3 className="mt-1.5 text-xs font-semibold leading-snug text-text-primary">
//                   {product.name}
//                 </h3>

//                 <div className="mt-2 flex items-center gap-2">
//                   <span className="text-xs font-bold text-text-primary">{product.price}</span>
//                   <span className="text-[8px] text-text-tertiary line-through">
//                     {product.originalPrice}
//                   </span>
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
