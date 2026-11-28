import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, PackageCheck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

const STORY_VIDEO_POSTER = "/images/Rural%20Dairy%20Farm%20Panorama.png";

const storyHighlights = [
  {
    id: "kitchen",
    icon: Leaf,
    title: "For the everyday kitchen",
    description:
      "Pantry staples, spices, snacks and sweets for familiar favourites.",
  },
  {
    id: "tradition",
    icon: Sparkles,
    title: "For moments of tradition",
    description:
      "Pooja and festive essentials for the rituals that matter to you.",
  },
  {
    id: "home",
    icon: PackageCheck,
    title: "For a little more ease",
    description:
      "Browse wellness and household picks alongside everyday favourites.",
  },
] as const;

const storyHeading = {
  eyebrow: "OUR STORY",
  title: "Everyday essentials, with a sense of tradition",
  accent: "sense of tradition",
  description:
    "A thoughtfully curated mix of Indian groceries, spices, pooja essentials and more for the everyday moments that make a home.",
};

export function OurStorySection() {
  return (
    <section
      className="section home-section home-story-section"
      aria-label="Our story"
    >
      <div className="container">
        <SectionHeading {...storyHeading} />

        <div className="home-story-layout">
          <div className="home-story-video-frame">
            <video
              className="home-story-video"
              src="https://videotourl.com/videos/1795802633638-337e9696-816c-4a78-a9bf-6419b4f5615d.mp4"
              poster={STORY_VIDEO_POSTER}
              autoPlay
              controls
              loop
              muted
              playsInline
              aria-label="Vrindavan Rasa story video"
            />
          </div>

          <div className="home-story-content">
            <div className="home-story-copy">
              <p className="home-story-kicker">A little Vrindavan Rasa story</p>
              <h3>Familiar favourites for every part of your day.</h3>
              <p className="home-story-description">
                From kitchen staples to meaningful rituals, discover useful
                finds for daily life, gathered together in one place.
              </p>
            </div>

            <div className="home-story-highlights">
              {storyHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.id} className="home-story-highlight">
                    <span
                      className="home-story-highlight-icon"
                      aria-hidden="true"
                    >
                      <Icon size={21} strokeWidth={1.7} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link href="/about-us" className="home-story-cta">
              Discover our story
              <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
