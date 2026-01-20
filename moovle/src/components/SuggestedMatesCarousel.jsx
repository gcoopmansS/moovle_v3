import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, UserSearch } from "lucide-react";
import SuggestedMateCard from "./SuggestedMateCard";
import SuggestedMateCardSkeleton from "./SuggestedMateCardSkeleton";
import EmptyState from "./EmptyState";

export default function SuggestedMatesCarousel({
  items,
  onAddMate,
  isLoading = false,
}) {
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
  }, [items, isLoading]);

  // Only show scroll arrows when we have actual content (not loading or empty)
  const showScrollArrows = !isLoading && items.length > 0;

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
      {showScrollArrows && canScrollLeft && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {showScrollArrows && canScrollRight && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      )}
      {isLoading ? (
        // Loading state: show 3 skeletons with matching layout
        <div
          ref={scrollRef}
          className="flex gap-0 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="carousel-card snap-center shrink-0 w-[80vw] max-w-[170px] flex items-center justify-center"
            >
              <SuggestedMateCardSkeleton />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        // Empty state: show message
        <div className="mt-4">
          <EmptyState
            title="No suggested mates right now"
            description="Try updating your interests or check back later."
            icon={UserSearch}
            primaryAction={{
              label: "Complete Profile",
              to: "/app/profile",
            }}
            secondaryAction={{
              label: "Search People",
              onClick: () => {
                // Focus the search input
                const searchInput = document.querySelector(
                  'input[placeholder*="Search for people"]',
                );
                if (searchInput) {
                  searchInput.focus();
                }
              },
            }}
          />
        </div>
      ) : (
        // Populated state: show actual suggested mates
        <div
          ref={scrollRef}
          className="flex gap-0 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          {items.map((sugg) => (
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
      )}
    </div>
  );
}
