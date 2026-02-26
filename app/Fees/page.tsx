'use client';
import React, { useState } from 'react';
import { Navbar } from "@components/Landing/navbar"
import { Footer } from "@components/Landing/footer"
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, MapPin, Phone, Mail, 
  Copy, Check, Info, ArrowRight,
  Sun, Moon, Star
} from 'lucide-react';

const FEE_DATA = {
  registration: { new: 650, returning: 400 },
  fullDay: { babies: 2500, gradeR: 2200, aftercare: 1300 },
  halfDay: { babies: 1950, gradeR: 1750, aftercare: 800 },
  other: { stationery: 850, tShirt: 180 }
};

export default function RefinedFeesPage() {
  const [view, setView] = useState<'fullDay' | 'halfDay'>('fullDay');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("1234567890"); // Actual account number here
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] text-[#1A202C] selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      
      

      <main className="max-w-6xl mx-auto px-6">
        {/* 1. Navigation/Header */}
        <Navbar />
        {/* 2. Hero Section */}
        <section className="text-center mt-12 mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
          >
            Invest in their <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">brightest future.</span>
          </motion.h1>
          
          {/* View Switcher */}
          <div className="flex justify-center mt-10">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
              <button 
                onClick={() => setView('fullDay')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'fullDay' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Full Day
              </button>
              <button 
                onClick={() => setView('halfDay')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'halfDay' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Half Day
              </button>
            </div>
          </div>
        </section>

        {/* 3. Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Pricing Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="contents"
              >
                {/* Babies Card */}
                <PriceCard 
                  title="Babies & Toddlers" 
                  price={view === 'fullDay' ? FEE_DATA.fullDay.babies : FEE_DATA.halfDay.babies}
                  icon={<Star className="text-amber-400" />}
                  features={["Diaper changing service", "Napping facilities", "Sensory play activities"]}
                />
                
                {/* Grade R Card */}
                <PriceCard 
                  title="Grade RR & R" 
                  price={view === 'fullDay' ? FEE_DATA.fullDay.gradeR : FEE_DATA.halfDay.gradeR}
                  icon={<Sun className="text-blue-500" />}
                  features={["School readiness program", "Educational workshops", "Sports & Playground"]}
                />
              </motion.div>
            </AnimatePresence>

            {/* Registration Summary */}
            <div className="md:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-wrap gap-8 justify-between items-center shadow-sm">
              <div>
                <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-2">Registration (Once-off)</h4>
                <div className="flex gap-6">
                  <p className="text-lg font-bold">New: <span className="text-blue-600">R{FEE_DATA.registration.new}</span></p>
                  <p className="text-lg font-bold">Returning: <span className="text-blue-600">R{FEE_DATA.registration.returning}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                <Info size={16} />
                Payable annually in January
              </div>
            </div>
          </div>

          {/* 4. Sidebar: Banking & Contact */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-8">Secure Payment</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Account Number</p>
                      <p className="text-xl font-mono tracking-wider">1234567890</p>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition active:scale-90"
                    >
                      {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <CreditCard size={20} className="text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">Kiddies Town ECD</p>
                      <p className="text-slate-400 font-mono">FNB | 250655</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6">Contact Us</h3>
              <div className="space-y-4 text-sm opacity-90">
                <p className="flex items-center gap-3"><MapPin size={18} /> 7 Grimm St, Polokwane</p>
                <p className="flex items-center gap-3"><Mail size={18} /> admin@kiddiestown.co.za</p>
              </div>
              <a 
                href="https://www.facebook.com/p/Kiddies-Town-ECD-100084221528687/" 
                target="_blank"
                className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:shadow-lg transition-all"
              >
                Visit Facebook <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
        <div>
            <Footer />
        </div>
        
      </main>
    </div>
  );
}

function PriceCard({ title, price, icon, features }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
      <div className="mb-6 flex justify-between items-start">
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-slate-900">R{price}</span>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Per Month</p>
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-6 tracking-tight">{title}</h3>
      <ul className="space-y-4 mb-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {f}
          </li>
        ))}
      </ul>
      <div className="pt-6 border-t border-slate-50">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-relaxed">
          *Includes Breakfast, Lunch & Snacks
        </p>
      </div>
    </div>
  );
}