import React from 'react';
import { Heart, Star, ShieldCheck, Instagram, Facebook, ArrowRight, Briefcase } from 'lucide-react';

// 1. Separate sub-components for better readability
const TeamMember = ({ name, role, tags, image }: { name: string, role: string, tags: string[], image: string }) => (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-md border border-white/40 p-3 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200/50">
        <div className="relative h-72 w-full overflow-hidden rounded-[1.5rem]">
            <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Social Links on Hover */}
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-blue-600 transition-colors">
                    <Facebook size={18} />
                </button>
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-pink-600 transition-colors">
                    <Instagram size={18} />
                </button>
            </div>
        </div>

        <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, i) => (
                    <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                        {tag}
                    </span>
                ))}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1 leading-tight">{name}</h3>
            <p className="text-slate-500 font-medium text-sm tracking-wide">{role}</p>
        </div>
    </div>
);

// 2. Move static data outside the function to optimize performance
const STAFF_MEMBERS = [
    {
        name: "Teacher [Name]",
        role: "Grade R Educator",
        tags: ["Academics", "School Prep"],
        image: "https://images.unsplash.com/photo-1580894732230-2838963bc3c3?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: "Aunty [Name]",
        role: "Early Years Nurturer",
        tags: ["Toddler Care", "Sensory"],
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: "Coach [Name]",
        role: "Physical Dev Coach",
        tags: ["Sports", "Wellness"],
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: "[Name]",
        role: "Campus Chef",
        tags: ["Nutrition", "Health"],
        image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=400"
    }
];

// 3. Directly export the default function
export default async function CompleteTeam() {
    return (
        <section id="CompleteTeam" className="py-20 md:py-28 bg-muted">
            <div className="min-h-screen bg-[#FDFCF8] selection:bg-orange-200 pb-20">
                {/* Decorative Background Accents */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">

                    {/* Header Section */}
                    <header className="text-center mb-20">
                        <span className="inline-block text-orange-600 font-bold tracking-[0.2em] text-sm mb-4 uppercase">
                            The Heart of Kiddies Town
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Family.</span>
                        </h1>
                    </header>

                    {/* Principal's Message Section */}
                    <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 mb-20 flex flex-col md:flex-row gap-10 items-center border border-slate-100">
                        <div className="w-full md:w-1/3 relative">
                            <div className="absolute inset-0 bg-orange-400 rounded-full translate-x-4 translate-y-4 opacity-20"></div>
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                                alt="Principal"
                                className="relative rounded-full aspect-square object-cover border-8 border-white shadow-lg"
                            />
                        </div>
                        <div className="w-full md:w-2/3">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Message from the Principal</h2>
                            <p className="text-orange-500 font-medium mb-6">Mma [Name] - Founder & Visionary</p>
                            <blockquote className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-orange-200 pl-6 mb-6">
                                "Welcome to Kiddies Town! When I started this ECD center, my dream was to create a sanctuary where every child feels seen, loved, and inspired. The incredible educators you see below are hand-picked not just for their qualifications, but for the immense capacity of their hearts."
                            </blockquote>
                        </div>
                    </section>

                    {/* Staff Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                        {STAFF_MEMBERS.map((member, index) => (
                            <TeamMember key={index} {...member} />
                        ))}
                    </section>

                    {/* Join Our Team (Careers) Section */}
                    <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                                <Briefcase className="text-orange-400" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Passionate about ECD?</h2>
                            <p className="text-slate-300 text-lg mb-10">
                                We are always looking for dedicated educators, assistants, and support staff to join our growing family in Polokwane.
                            </p>
                            <button className="bg-white hover:bg-orange-50 text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 mx-auto group">
                                View Open Roles
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </section>
    );
}