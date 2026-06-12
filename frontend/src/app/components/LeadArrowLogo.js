'use client';
import { motion } from 'framer-motion';

export default function LeadArrowLogo({ className = 'h-10 w-auto' }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 180 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <defs>
          <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60A5FA" ></stop>
            <stop offset="50%" stopColor="#818CF8" ></stop>
            <stop offset="100%" stopColor="#A78BFA" ></stop>
          </linearGradient>
          <linearGradient id="loopGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34D399" ></stop>
            <stop offset="100%" stopColor="#60A5FA" ></stop>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Data loop path */}
        <motion.path
          d="M12 28 C12 16, 28 12, 36 20 C44 28, 52 12, 60 20 C68 28, 76 12, 84 20"
          stroke="url(#loopGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Arrow shaft */}
        <motion.line
          x1="32"
          y1="28"
          x2="156"
          y2="28"
          stroke="url(#arrowGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Arrow head */}
        <motion.polygon
          points="160,28 148,22 148,34"
          fill="url(#arrowGrad)"
          filter="url(#glow)"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        />

        {/* Signal dots along the arrow */}
        {[50, 70, 90, 110, 130].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={28}
            r="2"
            fill="#60A5FA"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.3, 1], scale: [0, 1, 0.8, 1] }}
            transition={{ duration: 1.5, delay: 1.2 + i * 0.15, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}

        {/* Brand text */}
        <motion.text
          x="36"
          y="14"
          fill="white"
          fontSize="13"
          fontWeight="700"
          letterSpacing="3"
          fontFamily="system-ui, sans-serif"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          LEADARROW
        </motion.text>

        {/* Subtitle accent */}
        <motion.text
          x="120"
          y="14"
          fill="#64748B"
          fontSize="8"
          fontWeight="500"
          letterSpacing="1.5"
          fontFamily="system-ui, sans-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          ROUTE
        </motion.text>
      </svg>

      {/* Glow dot */}
      <motion.span
        className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
      </motion.span>
    </motion.div>
  );
}
