"use client";

import Masonry from "./Masonry";

const newsItems = [
    {
        id: "1",
        title: "Announcing Microsoft Copilot Studio",
        category: "Announcement",
        img: "https://images.unsplash.com/photo-1633419461186-7d40a23933a7?q=80&w=1000&auto=format&fit=crop",
        height: 600,
    },
    {
        id: "2",
        title: "The future of AI is here",
        category: "Research",
        img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
        height: 400,
    },
    {
        id: "3",
        title: "Responsible AI: Our commitment",
        category: "Policy",
        img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        height: 400,
    },
    {
        id: "4",
        title: "New AI tools for developers",
        category: "Product",
        img: "https://images.unsplash.com/photo-1676299081847-824916de030a?q=80&w=1000&auto=format&fit=crop",
        height: 600,
    },
];

export default function NewsGrid() {
    return (
        <section className="py-20 container mx-auto px-6 min-h-screen">
            <h2 className="text-4xl font-serif mb-12 text-charcoal">Latest News</h2>
            <div className="h-[800px] w-full">
                <Masonry
                    items={newsItems}
                    ease="power3.out"
                    duration={0.6}
                    stagger={0.05}
                    animateFrom="bottom"
                    scaleOnHover={true}
                    hoverScale={0.95}
                    blurToFocus={true}
                    colorShiftOnHover={false}
                />
            </div>
        </section>
    );
}
