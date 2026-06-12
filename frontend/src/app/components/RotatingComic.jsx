'use client';
import { useState, useEffect } from 'react';

const comics = [
  {
    id: 1,
    question: "What if a $2,500 lead sits in the CRM for 10 minutes?",
    panels: [
      { emoji: "😰", title: "Lead arrives", text: "Ravi filled a Facebook form. CRM has the lead." },
      { emoji: "⏳", title: "No response", text: "Rep doesn't see it. 12 min passed. Lead moves on." },
      { emoji: "💸", title: "Deal lost", text: "Without speed-to-lead, this high‑ticket deal is gone." },
      { emoji: "✅", title: "With LeadArrow", text: "Rep gets instant call + Chrome alert. Lead connected in 4s." },
    ],
  },
  {
    id: 2,
    question: "How fast can you really respond?",
    panels: [
      { emoji: "⚡", title: "0.2 seconds", text: "Lead enters CRM. LeadArrow detects it instantly." },
      { emoji: "📞", title: "Simultaneous alert", text: "Rep's phone rings + Chrome extension pings." },
      { emoji: "🔢", title: "Press 1 to Accept", text: "DTMF or click accepts. SMS/link sent immediately." },
      { emoji: "📊", title: "Manager sees stats", text: "Avg response: 4.2 seconds. Pickup rate tracked." },
    ],
  },
  {
    id: 3,
    question: "What if your rep is on a call?",
    panels: [
      { emoji: "🤙", title: "Rep busy", text: "John is already talking to a prospect." },
      { emoji: "🚫", title: "He cannot pick up", text: "Without routing, lead waits or is missed." },
      { emoji: "🔄", title: "LeadArrow routes", text: "System sees John busy → immediately rings next rep." },
      { emoji: "👌", title: "Seamless fallback", text: "Second rep accepts. No lead left behind." },
    ],
  },
  {
    id: 4,
    question: "Does your team work across time zones?",
    panels: [
      { emoji: "🌍", title: "Global team", text: "Reps in EST, PST, and IST." },
      { emoji: "🕒", title: "Different shifts", text: "Manager sets working hours & days off per rep." },
      { emoji: "⏰", title: "Only available reps ring", text: "LeadArrow respects availability schedules." },
      { emoji: "😴", title: "No more wake‑up calls", text: "Reps only get alerts during their work hours." },
    ],
  },
  {
    id: 5,
    question: "Is your manager blind to team performance?",
    panels: [
      { emoji: "📉", title: "Without data", text: "Manager doesn't know who picks up or how fast." },
      { emoji: "🧐", title: "LeadArrow dashboard", text: "Pickup rate, response time, declined leads – all visible." },
      { emoji: "📋", title: "Drill down", text: "Click any stat → see lead history and attempts." },
      { emoji: "🏆", title: "Performance improves", text: "Managers coach based on data. Close rates rise 35%." },
    ],
  },
];

export default function RotatingComic() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % comics.length);
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  const comic = comics[current];

  return (
    <div className="max-w-lg w-full">
      <h3 className="text-2xl font-bold text-white text-center mb-6">{comic.question}</h3>
      <div className="grid grid-cols-2 gap-4">
        {comic.panels.map((panel, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl border-2 border-black shadow-lg p-4 transform ${
              idx % 2 === 0 ? 'rotate-1' : '-rotate-1'
            } hover:rotate-0 transition-transform`}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{panel.emoji}</div>
              <p className="text-xs font-bold text-gray-800">{panel.title}</p>
              <p className="text-xs text-gray-500 mt-1">{panel.text}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {comics.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? 'bg-blue-500 scale-125' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}