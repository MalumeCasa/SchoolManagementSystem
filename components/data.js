import {
} from "@heroicons/react/24/solid";

import benefitOneImg from "../../public/img/benefit-one.png";
import benefitTwoImg from "../../public/img/benefit-two.png";

const GiraffeIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="35" cy="25" r="8" />
    <circle cx="45" cy="20" r="6" />
    <circle cx="55" cy="22" r="6" />
    <line x1="40" y1="35" x2="40" y2="55" />
    <line x1="40" y1="55" x2="35" y2="70" />
    <line x1="40" y1="55" x2="45" y2="70" />
    <line x1="35" y1="25" x2="25" y2="50" />
    <line x1="25" y1="50" x2="20" y2="70" />
    <line x1="25" y1="50" x2="30" y2="70" />
  </svg>
);

const HippoIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="50" cy="45" rx="35" ry="30" />
    <circle cx="40" cy="35" r="4" />
    <circle cx="60" cy="35" r="4" />
    <ellipse cx="50" cy="60" rx="25" ry="15" />
    <line x1="30" y1="70" x2="25" y2="80" />
    <line x1="45" y1="75" x2="45" y2="80" />
    <line x1="55" y1="75" x2="55" y2="80" />
    <line x1="70" y1="70" x2="75" y2="80" />
  </svg>
);

const OwlIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="35" cy="40" r="12" />
    <circle cx="65" cy="40" r="12" />
    <circle cx="32" cy="38" r="5" fill="currentColor" />
    <circle cx="68" cy="38" r="5" fill="currentColor" />
    <path d="M 50 40 L 45 50 L 55 50 Z" />
    <path d="M 30 55 Q 50 70 70 55" />
    <line x1="20" y1="50" x2="15" y2="60" />
    <line x1="80" y1="50" x2="85" y2="60" />
  </svg>
);

const benefitOne = {
  title: "Our Programs",
  desc: "We Offer Tailored Care for Every Age, Our Programs Cater to Your Child's Unique Needs and Developmental Stages.",
  image: benefitOneImg,
  bullets: [
    {
      title: "Babies (0-2 years)",
      desc: "Safe nurturing, sensory play, nap routines, feeding support.",
      icon: <GiraffeIcon />,
    },
    {
      title: "Toddlers (2-4 years)",
      desc: "Exploration, motor skills, early social interaction, themed activities.",
      icon: <HippoIcon />,
    },
    {
      title: "Preschool (4-6 years)",
      desc: "School readiness, basic literacy/numeracy, creative arts, preparation for primary school.",
      icon: <OwlIcon />,
    },
  ],
};

const BirdIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="40" cy="35" r="10" />
    <path d="M 35 40 Q 30 45 28 50" />
    <path d="M 45 40 Q 50 45 52 50" />
    <ellipse cx="40" cy="55" rx="18" ry="20" />
    <line x1="22" y1="45" x2="15" y2="40" />
    <line x1="58" y1="45" x2="65" y2="40" />
    <line x1="30" y1="72" x2="25" y2="80" />
    <line x1="40" y1="75" x2="40" y2="82" />
    <line x1="50" y1="72" x2="55" y2="80" />
  </svg>
);

const FoxIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="40" r="18" />
    <path d="M 35 25 L 30 15 L 38 28" />
    <path d="M 65 25 L 70 15 L 62 28" />
    <circle cx="42" cy="37" r="3" />
    <circle cx="58" cy="37" r="3" />
    <path d="M 50 42 L 48 48 L 52 48 Z" />
    <path d="M 45 50 Q 50 55 55 50" />
    <line x1="30" y1="55" x2="20" y2="65" />
    <line x1="70" y1="55" x2="80" y2="65" />
  </svg>
);

const EagleIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="35" r="10" />
    <circle cx="45" cy="32" r="3" fill="currentColor" />
    <path d="M 15 45 Q 35 40 45 48" />
    <path d="M 85 45 Q 65 40 55 48" />
    <ellipse cx="50" cy="55" rx="15" ry="20" />
    <line x1="38" y1="70" x2="35" y2="80" />
    <line x1="50" y1="75" x2="50" y2="82" />
    <line x1="62" y1="70" x2="65" y2="80" />
    <path d="M 20 50 L 10 48" />
    <path d="M 80 50 L 90 48" />
  </svg>
);

const benefitTwo = {
  title: "Why Choose Us",
  desc: "What Makes Kiddies Town Special",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Parents Involvement is Key",
      desc: "We Strive to have Parents Involved in Their Child's Formative Years. We Ensure that Parents are Involved in the Process of Kids Upbringing.",
      icon: <BirdIcon />,
    },
    {
      title: "Latest Technologies & Tools",
      desc: "Our Highly Trained Staff Use Latest Technologies and Tools to Ensure Quality Care.",
      icon: <FoxIcon />,
    },
    {
      title: "Highly Trained Staff",
      desc: "Our Staff are Highly Trained and Experienced in Childcare and Early Childhood Development.",
      icon: <EagleIcon />,
    },
  ],
};


export {benefitOne, benefitTwo};
