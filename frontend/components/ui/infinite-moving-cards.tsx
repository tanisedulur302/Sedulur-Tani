"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  
  useEffect(() => {
    const getDirection = () => {
      if (containerRef.current) {
        if (direction === "left") {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "forwards",
          );
        } else {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "reverse",
          );
        }
      }
    };
    
    const getSpeed = () => {
      if (containerRef.current) {
        if (speed === "fast") {
          containerRef.current.style.setProperty("--animation-duration", "20s");
        } else if (speed === "normal") {
          containerRef.current.style.setProperty("--animation-duration", "40s");
        } else {
          containerRef.current.style.setProperty("--animation-duration", "80s");
        }
      }
    };

    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setTimeout(() => setStart(true), 0);
    }
  }, [direction, speed]);
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl mx-auto overflow-hidden mask-[linear-linear(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-emerald-100 bg-white shadow-lg hover:shadow-xl transition-shadow px-8 py-8 md:w-[450px]"
            key={item.name}
          >
            <blockquote>
              {/* Quote Icon */}
              <div className="mb-4">
                <svg className="w-10 h-10 text-emerald-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              {/* Quote Text */}
              <p className="relative z-20 text-base leading-relaxed text-gray-700 mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              
              {/* Author Info */}
              <div className="relative z-20 flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {item.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-900">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.title}
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfiniteMovingCards;