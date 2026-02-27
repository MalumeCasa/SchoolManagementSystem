'use client';
import React, { useState } from 'react';

const faqData = [
  {
    question: "What age groups do you cater to at Kiddies Town ECD?",
    answer: "We provide specialized care and education for children from 3 months (infants) up to 6 years old (Grade R). Our classrooms are divided by age to ensure age-appropriate stimulation and safety."
  },
  {
    question: "Where exactly is the school located in Polokwane?",
    answer: "Our campus is conveniently located at 7 Grimm St, Polokwane. We offer a secure and central environment that is easy for parents to access during morning drop-offs and afternoon pick-ups."
  },
  {
    question: "What are your operating hours?",
    answer: "We open at 06:30 AM and close at 17:30 PM, Monday through Friday. We understand the schedule of working parents and ensure children are supervised in a productive environment throughout the day."
  },
  {
    question: "Does Kiddies Town provide meals for the children?",
    answer: "Yes! We provide a balanced, nutritious breakfast and lunch, along with healthy snacks. Our menu is designed to support the physical and cognitive growth of developing toddlers and preschoolers."
  },
  {
    question: "What is your approach to early childhood education?",
    answer: "We focus on 'holistic development.' This means we don't just teach ABCs; we focus on social skills, emotional intelligence, physical coordination, and creative play to ensure your child is fully school-ready."
  },
  {
    question: "How can I enroll my child or book a viewing?",
    answer: "You are welcome to visit our facility at 7 Grimm St. To ensure we give you a full tour, we recommend calling ahead. Enrollment requires a completed application form, birth certificate, and immunization records."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-5 text-left flex justify-between items-center focus:outline-none"
        onClick={onClick}
      >
        <span className={`text-lg font-medium ${isOpen ? 'text-blue-600' : 'text-gray-900'}`}>
          {question}
        </span>
        <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-600 leading-relaxed text-base">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  return (
    <section id="faq" className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Parents' Common Questions
          </h2>
          <div className="mt-4 h-1 w-20 bg-blue-600 mx-auto rounded"></div>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to know about starting your child's journey at Kiddies Town ECD.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm px-6 py-2">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600">
            Have more questions? <a href="#contact" className="text-blue-600 font-bold hover:underline">Contact our office directly.</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;