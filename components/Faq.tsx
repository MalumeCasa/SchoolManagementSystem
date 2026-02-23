"use client";
import React from "react";
import { Container } from "@/components/Container";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

export const Faq = () => {
  return (
    <Container className="!p-0">
      <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
        {faqdata.map((item, index) => (
          <div key={item.question} className="mb-5">
            <Disclosure>
              {({ open }) => (
                <>
                  <DisclosureButton className="flex items-center justify-between w-full px-4 py-4 text-lg text-left text-gray-800 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-100 focus-visible:ring-opacity-75 dark:bg-trueGray-800 dark:text-gray-200">
                    <span>{item.question}</span>
                    <ChevronUpIcon
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5 text-blue-600`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="px-4 pt-4 pb-2 text-gray-500 dark:text-gray-300">
                    {item.answer}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Container>
  );
}

const faqdata = [
  {
    question: "How old should my child be, for enrollment at KIDDIES TOWN ECD?",
    answer: "Children between 0-6 years old are eligible for enrollment.",
  },
  {
    question: "When is the enrollment period KIDDIES TOWN ECD?",
    answer: "Enrollment is open all year round.",
  },
  {
    question: "What is needed for enrollment document KIDDIES TOWN ECD?",
    answer:
      "You are required to bring the following documents: 1. Birth certificate 2. Parent's identification card 3. Proof of residence.",
  },

  {
    question: "What is the knock-off time for aftercare at KIDDIES TOWN ECD?",
    answer:
    "The knock-off time for aftercare is 6:00 PM. Parents are expected to pick up their children by this time.",
  },
];
