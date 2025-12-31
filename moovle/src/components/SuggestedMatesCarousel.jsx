import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SuggestedMateCard from "./SuggestedMateCard";

export default function SuggestedMatesCarousel({ items, onAddMate }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position for arrow visibility
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items]);

  // Scroll by one card width
  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector(".carousel-card");
    const amount = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {canScrollRight && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-0 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.length === 0
          ? // Empty state: show 3 skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="carousel-card snap-center shrink-0 w-[80vw] max-w-xs bg-gray-100 rounded-xl border border-gray-200 h-32 animate-pulse flex flex-col items-center justify-center p-3"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full mb-2" />
                <div className="h-3 w-20 bg-gray-300 rounded mb-1" />
                <div className="h-2 w-14 bg-gray-200 rounded mb-1" />
                <div className="flex gap-1 mt-1">
                  <div className="h-3 w-10 bg-gray-200 rounded-full" />
                  <div className="h-3 w-8 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))
          : items.map((sugg) => (
              <div
                key={sugg.profile.id}
                className="carousel-card snap-center shrink-0 w-[80vw] max-w-[170px] flex items-center justify-center"
              >
                <SuggestedMateCard
                  profile={sugg.profile}
                  reasons={sugg.reasons}
                  mutualCount={sugg.metrics?.mutualCount || 0}
                  requested={sugg.requested}
                  loading={sugg.loading}
                  onAdd={() => onAddMate(sugg.profile.id)}
                />
              </div>
            ))}
      </div>
    </div>
  );
}
