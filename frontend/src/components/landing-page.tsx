"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Github, Brain, Clock, Globe, Zap, Layers, Sparkles, Code2, BookOpen, Target, ChevronRight } from "lucide-react";
import { HolographicText, NeonText } from "@/components/Typography";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function LandingPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center overflow-x-hidden bg-background selection:bg-primary/20">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <main className="container relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center md:pt-32 min-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center px-3 py-1 mb-6 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
          <span className="text-xs font-medium text-primary tracking-wider uppercase">
            Elevating Technical Knowledge
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HolographicText
            text="SyntaxRecall"
            size="xl"
            className="mb-6 tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-[800px] text-lg md:text-2xl text-muted-foreground leading-relaxed mb-10"
        >
          The <span className="text-foreground font-bold italic">Technical Librarian</span> protocol for developers.
          Bridge the gap between <span className="text-primary font-mono">Documentation</span> and <span className="text-primary font-mono">Muscle Memory</span>.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:row gap-6 w-full justify-center items-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button 
              size="lg" 
              onClick={() => signIn("github")}
              className="h-14 px-10 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] transition-all duration-300 rounded-xl group"
            >
              <Github className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
              Get Started with GitHub
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-14 px-10 text-lg backdrop-blur-sm bg-background/50 rounded-xl border-primary/20 hover:border-primary/50"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              How it works
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-8 pt-8 grayscale opacity-50">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              <span className="text-sm font-mono tracking-widest uppercase">TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              <span className="text-sm font-mono tracking-widest uppercase">Rust</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              <span className="text-sm font-mono tracking-widest uppercase">Python</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-24 bg-card/30 border-y border-border/50 relative overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic uppercase">
              The Protocol
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-mono">
              From fragmented knowledge to architectural mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-12 z-0" />
            
            <ProtocolStep 
              number="01"
              icon={<BookOpen className="w-10 h-10 text-tech-cyan" />}
              title="Curate"
              description="Identify critical patterns, syntax nuances, or architectural constraints you need to master."
            />
            <ProtocolStep 
              number="02"
              icon={<Brain className="w-10 h-10 text-tech-magenta" />}
              title="Generate"
              description="Let our AI engine synthesize optimized flashcards with code snippets and deep explanations."
            />
            <ProtocolStep 
              number="03"
              icon={<Target className="w-10 h-10 text-tech-lime" />}
              title="Retain"
              description="Review via SM-2 spaced repetition. Convert short-term learning into long-term professional intuition."
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="container relative z-10 py-32 px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 italic uppercase">
            Mastery <span className="text-primary">Engineered</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Standard flashcards are for vocabulary. SyntaxRecall is for <span className="text-foreground font-bold">Complex Logic</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-cyan-400" />}
            title="AI-Powered Synthesis"
            description="Turn documentation, roadmaps, and complex code snippets into high-quality flashcards instantly using the latest LLMs."
            delay={100}
          />
          <FeatureCard 
            icon={<Clock className="w-8 h-8 text-pink-400" />}
            title="Professional SM-2 Logic"
            description="Built on the proven Anki-style algorithm. Review concepts exactly when you're about to forget them for maximum efficiency."
            delay={200}
          />
          <FeatureCard 
            icon={<Globe className="w-8 h-8 text-emerald-400" />}
            title="Engineer Marketplace"
            description="Fork deck repositories from top-tier developers. Contribute your own high-quality knowledge sets back to the community."
            delay={300}
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="Diagnostic Analytics"
            description="Heatmaps and recall accuracy metrics identify exactly where your technical skill gaps are lurking."
            delay={400}
          />
          <FeatureCard 
            icon={<Layers className="w-8 h-8 text-violet-400" />}
            title="Canonical Roadmaps"
            description="Follow structured learning paths for FastAPI, Next.js, and more. Track your progress node by node through the graph."
            delay={500}
          />
          <FeatureCard 
            icon={<Code2 className="w-8 h-8 text-orange-400" />}
            title="Monaco Integration"
            description="Review cards using the same editor you use for work. Syntax highlighting and formatting come standard."
            delay={600}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container relative z-10 pb-32 px-4">
        <div className="relative p-12 md:p-24 rounded-3xl border border-primary/20 bg-card overflow-hidden text-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic uppercase leading-none">
              Ready to <span className="text-primary">Ascend</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 font-mono">
              Join the elite league of Technical Librarians.
            </p>
            <Button 
              size="lg" 
              onClick={() => signIn("github")}
              className="h-16 px-12 text-xl font-bold shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-all duration-300 rounded-xl"
            >
              Start Your Journey Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-12 bg-background/50 backdrop-blur-md relative z-10">
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2">
            <HolographicText text="SyntaxRecall" size="sm" className="font-black italic uppercase tracking-tighter" />
            <p>© 2026 SyntaxRecall. Open Source Knowledge Retention.</p>
          </div>
          <div className="flex gap-8 font-mono uppercase tracking-widest text-xs">
            <span className="hover:text-primary cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Roadmaps</span>
            <span className="hover:text-primary cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProtocolStep({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center relative z-10 group">
      <div className="mb-6 relative">
        <div className="absolute -top-4 -right-4 text-4xl font-black italic text-primary/10 group-hover:text-primary/20 transition-colors">
          {number}
        </div>
        <div className="p-6 rounded-2xl bg-background border border-border shadow-xl group-hover:border-primary/50 transition-all duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed px-4">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="group relative p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-4 rounded-xl bg-background/80 border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-black italic uppercase mb-3 text-foreground group-hover:text-primary transition-colors tracking-tighter">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-lg">{description}</p>
      </div>
    </motion.div>
  );
}

