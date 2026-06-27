import React from "react";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "custom";
  customWidth?: number;
  customHeight?: number;
  animated?: boolean;
  glow?: boolean;
  hideText?: boolean;
}

export function LogoIcon({
  className = "",
  size = "md",
  customWidth,
  customHeight,
  animated = false,
  glow = true,
}: Omit<LogoProps, "hideText">) {
  // Dimensions based on size
  const dims = {
    xs: { w: 24, h: 24 },
    sm: { w: 36, h: 36 },
    md: { w: 48, h: 48 },
    lg: { w: 64, h: 64 },
    xl: { w: 120, h: 120 },
    custom: { w: customWidth || 48, h: customHeight || 48 },
  }[size];

  return (
    <svg
      width={dims.w}
      height={dims.h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "animate-float" : ""}`}
      style={{
        filter: glow ? "drop-shadow(0 0 12px rgba(59, 130, 246, 0.45)) drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))" : "none",
      }}
    >
      <defs>
        {/* Main Blue-Purple Diagonal Gradient */}
        <linearGradient id="shieldGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Outer Glow Radial Gradient for the Center Nucleus */}
        <radialGradient id="centerOrb" cx="50" cy="50" r="10" fx="50" fy="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </radialGradient>

        {/* Subtle Neon Drop Shadows */}
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Glow Ring Aura if animated */}
      {animated && (
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#shieldGrad)"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          className="animate-[spin_40s_linear_infinite] opacity-30"
        />
      )}

      {/* Outer Shield Path */}
      <path
        d="M50 15 L78 22 C78 48 70 72 50 85 C30 72 22 48 22 22 Z"
        stroke="url(#shieldGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "animate-pulse" : ""}
      />

      {/* Cybernetic Mesh Network on Left Half */}
      <g stroke="url(#shieldGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
        {/* Nodes and Connection Lines */}
        <line x1="50" y1="50" x2="32" y2="38" />
        <line x1="32" y1="38" x2="28" y2="52" />
        <line x1="28" y1="52" x2="35" y2="66" />
        <line x1="35" y1="66" x2="50" y2="50" />
        <line x1="32" y1="38" x2="45" y2="28" />
        <line x1="45" y1="28" x2="50" y2="50" />
        <line x1="28" y1="52" x2="42" y2="52" />
        <line x1="42" y1="52" x2="35" y2="66" />
        <line x1="35" y1="66" x2="44" y2="76" />
        <line x1="44" y1="76" x2="50" y2="50" />

        {/* Mesh Circle Nodes (dots) */}
        <circle cx="32" cy="38" r="2.5" fill="#3B82F6" className={animated ? "animate-ping origin-center" : ""} style={{ animationDuration: "3s" }} />
        <circle cx="32" cy="38" r="2" fill="#E0F2FE" />
        
        <circle cx="28" cy="52" r="2" fill="#60A5FA" />
        <circle cx="35" cy="66" r="2" fill="#8B5CF6" />
        <circle cx="45" cy="28" r="2" fill="#3B82F6" />
        <circle cx="42" cy="52" r="2" fill="#E0F2FE" />
        <circle cx="44" cy="76" r="2.5" fill="#8B5CF6" />
      </g>

      {/* Radar/Concentric Waves on Right Half */}
      <g stroke="url(#shieldGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        {/* Conic radiating helper lines */}
        <line x1="50" y1="50" x2="72" y2="34" strokeDasharray="1 3" />
        <line x1="50" y1="50" x2="75" y2="60" strokeDasharray="1 3" strokeWidth="1" />

        {/* Right Radar concentric arcs centered on (50, 50) */}
        {/* R=16 Arc */}
        <path d="M50 34 A16 16 0 0 1 66 50 A16 16 0 0 1 50 66" fill="none" />
        {/* R=28 Arc */}
        <path d="M50 22 A28 28 0 0 1 78 50 A28 28 0 0 1 50 78" fill="none" />
      </g>

      {/* Glowing Central Nucleus / Orb */}
      <circle cx="50" cy="50" r="7.5" fill="url(#centerOrb)" />
      <circle cx="50" cy="50" r="10" stroke="#60A5FA" strokeWidth="1" strokeOpacity="0.4" className={animated ? "animate-pulse" : ""} />

      {/* Laser Arrow Pointing Right out of the center */}
      <g stroke="url(#shieldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Shaft */}
        <line x1="50" y1="50" x2="85" y2="50" />
        {/* Arrow head */}
        <path d="M80 45 L85 50 L80 55" />
      </g>
    </svg>
  );
}

export function LogoWithText({
  className = "",
  size = "md",
  animated = false,
  glow = true,
}: Omit<LogoProps, "hideText">) {
  const iconSizes = {
    xs: "xs" as const,
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
    xl: "xl" as const,
    custom: "custom" as const,
  };

  const textSizes = {
    xs: "text-xs tracking-tight",
    sm: "text-sm tracking-tight",
    md: "text-base tracking-normal",
    lg: "text-xl tracking-wide",
    xl: "text-3xl tracking-widest",
    custom: "text-md",
  }[size];

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <LogoIcon size={iconSizes[size]} animated={animated} glow={glow} />
      <div>
        <h1 className={`font-extrabold text-white leading-none uppercase font-sans ${textSizes} flex items-center`}>
          DEADLINE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-500 ml-1.5 shadow-sm">DEFENDER</span>
          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono tracking-tight normal-case">AI</span>
        </h1>
        <span className="text-[8.5px] font-mono tracking-widest text-slate-500 block uppercase mt-0.5">
          Autonomous Resilience Engine
        </span>
      </div>
    </div>
  );
}

export default function Logo(props: LogoProps) {
  if (props.hideText) {
    return <LogoIcon {...props} />;
  }
  return <LogoWithText {...props} />;
}
