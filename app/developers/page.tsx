'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Github, Linkedin, Terminal, Database, 
  Layers, Cpu, Server, Sparkles, Code
} from 'lucide-react';
import { Navbar } from "@components/Landing/navbar";
import { Footer } from "@components/Landing/footer";


const DEVELOPERS = [
  {
    name: "Monama TK",
    role: "Back-End & Database Engineer",
    status: "TUT Scholar",
    description: "Architecting the unseen engine. Monama builds the robust, secure, and scalable server-side infrastructure that powers Kiddies Town ECD.",
    tech: ["Node.js", "PostgreSQL", "REST APIs", "System Architecture"],
    icon: <Server className="text-emerald-400" size={24} />,
    gradient: "from-emerald-500/20 to-transparent",
    borderGlow: "group-hover:border-emerald-500/50"
  },
  {
    name: "Mohatli M",
    role: "Front-End & UI/UX Specialist",
    status: "Creative Developer",
    description: "Crafting the visual layer. Mohatli translates complex logic into fluid, intuitive, and welcoming interfaces for parents and staff.",
    tech: ["React.js", "Tailwind CSS", "Framer Motion", "UX Engineering"],
    icon: <Layers className="text-indigo-400" size={24} />,
    gradient: "from-indigo-500/20 to-transparent",
    borderGlow: "group-hover:border-indigo-500/50"
  }
];

export default function ModernDevsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-100 selection:text-blue-900 pb-24">
      <Navbar />
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 pt-32">
        
        {/* Minimalist Header */}
        <header className="mb-24 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-mono mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Online
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-6"
          >
            Meet the Engineers.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            The digital infrastructure of Kiddies Town ECD is proudly engineered by local tech talent, combining robust back-end logic with fluid user interfaces.
          </motion.p>
        </header>

        {/* Developer Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEVELOPERS.map((dev, idx) => (
            <motion.div
              key={dev.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className={`group relative overflow-hidden rounded-[2rem] bg-card/50 backdrop-blur-md border border-border/50 p-8 transition-all duration-500 hover:bg-card ${dev.borderGlow}`}
            >
              {/* Subtle internal gradient */}
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${dev.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

              <div className="relative z-10">
                {/* Top Row: Icon & Socials */}
                <div className="flex justify-between items-start mb-12">
                  <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
                    {dev.icon}
                  </div>
                  <div className="flex gap-3">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                      <Github size={20} />
                    </button>
                    <button className="text-zinc-500 hover:text-white transition-colors">
                      <Linkedin size={20} />
                    </button>
                  </div>
                </div>

                {/* Identity */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">{dev.name}</h2>
                  <div className="flex items-center gap-2 text-sm font-mono text-zinc-400">
                    <Terminal size={14} />
                    {dev.role}
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-1 bg-zinc-800/50 text-zinc-300 text-xs rounded-md border border-zinc-700/50">
                    {dev.status}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
                  {dev.description}
                </p>

                {/* Tech Stack Pills */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
                    <Code size={14} /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dev.tech.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-3 py-1.5 bg-card border border-border text-foreground text-xs font-medium rounded-lg group-hover:border-border/70 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Architecture Teaser / Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-8 rounded-[2rem] border border-border/50 bg-card/30 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              <Cpu className="text-zinc-400" size={20} />
            </div>
            <div>
              <p className="text-white font-medium">Built for Performance</p>
              <p className="text-sm text-zinc-500">React Front-End seamlessly integrated with a Node.js API.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2">
            <Sparkles size={16} /> View Source / Hire Us
          </button>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
}