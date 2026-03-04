import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useNavigate } from 'react-router-dom';

// Icons
import { Rocket, Search, Users, Code } from 'lucide-react';
import FeatureCard from '@/components/core/FeatureCard';

// Image
import HeroImage from '@/assets/hero-image-placeholder.png';

export default function LandingPage() {
  const faqRef = useRef(null);
  const navigate = useNavigate();

  const handleScrollToFaq = () => {
    if (faqRef.current) faqRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* === HERO SECTION === */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <img
          src={HeroImage}
          alt="Collaboration background"
          className="absolute inset-0 h-full w-full object-cover z-0 blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[250px] bg-gradient-to-b from-transparent to-background z-20" />

        <div className="container relative z-30 mx-auto h-full px-4">
          <div className="flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Build Your Dream Team and Join Your Next Project
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-200">
              Explore thousands of projects or find the perfect teammate.
              DevConnect is where project owners and collaborators find each other to build.
            </p>

            <div className="mt-10 flex gap-4">
              {/* TODO: Replace with auth-aware CTA once auth is implemented */}
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md
                          hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                Get Started Free
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={handleScrollToFaq}
                className="hover:bg-white/80"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Why DevConnect?
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <FeatureCard
            icon={<Rocket className="h-6 w-6" />}
            title="Post Your Idea"
            description="Turn your startup dream into reality by finding the perfect team."
          />
          <FeatureCard
            icon={<Code className="h-6 w-6" />}
            title="Skill-Based Matching"
            description="Match based on the exact tech stack and skills you need."
          />
          <FeatureCard
            icon={<Search className="h-6 w-6" />}
            title="Find Projects"
            description="Explore projects for hackathons, side projects, or your portfolio."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Build Your Profile"
            description="Showcase your skills, GitHub, and LinkedIn to project owners."
          />
        </div>
      </section>

      {/* === FAQ SECTION === */}
      <section ref={faqRef} className="container mx-auto px-4 py-24 text-left">
        <h2 className="text-3xl font-bold mb-10">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              What is DevConnect?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                DevConnect is a tech collaboration platform for developers,
                designers, and students to find teammates or join meaningful projects.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              How do I post a project?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                After creating a free account, click "Post a Project" and fill in
                details like title, description, and required skills.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              How do I apply for a project?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Browse public projects, click "Apply", and the project owner will
                receive your profile instantly.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
