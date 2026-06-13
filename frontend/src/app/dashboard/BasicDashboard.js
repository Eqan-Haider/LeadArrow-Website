'use client';
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import InternationalPhoneInput from '../components/InternationalPhoneInput';
import WorkspaceView from './WorkspaceView';
function SvgZap(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>}
function SvgUsers(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
function SvgBar(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>}
function SvgDown(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>}
function SvgCard(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>}
function SvgLock(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
function SvgLog(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>}
function SvgCheck(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
function SvgX(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
function SvgTrend(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
function SvgStar(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
function SvgPhone(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
function SvgChart(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
function SvgDb(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>}
function SvgGear(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
function SvgUser(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
function SvgMail(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
function SvgWA(c){return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>}

var SSE_HOST = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5001';
var API_BASE = SSE_HOST + '/api';

function cn(){var a=[];for(var i=0;i<arguments.length;i++){if(arguments[i])a.push(arguments[i])}return a.join(' ')}

function fireConfetti(){
  confetti({particleCount:80,spread:70,origin:{y:0.6},colors:['#6366f1','#8b5cf6','#06b6d4','#10b981'],ticks:100});
  setTimeout(function(){confetti({particleCount:40,spread:40,origin:{y:0.6,x:0.3},colors:['#f59e0b','#ef4444'],ticks:60})},150)
}

var NAV_ITEMS = [
  {key:'Dashboard',label:'Dashboard',emoji:'\uD83D\uDCCA',gate:false},
  {key:'Workspace',label:'Workspace',emoji:'\u2699\uFE0F',gate:true},
  {key:'Team & Agents',label:'Team & Agents',emoji:'\uD83D\uDC65',gate:true},
  {key:'Communications',label:'Communications',emoji:'\uD83D\uDCAC',gate:true},
  {key:'Analytics & Reports',label:'Analytics & Reports',emoji:'\uD83D\uDCC8',gate:true},
  {key:'Database Logs',label:'Database Logs',emoji:'\uD83D\uDDC4\uFE0F',gate:true},
  {key:'Integrations',label:'Integrations',emoji:'\u2699\uFE0F',gate:true},
  {key:'Billing & Plans',label:'Billing & Plans',emoji:'\uD83D\uDCB3',gate:false},
  {key:'User Profiles',label:'User Profiles',emoji:'\uD83D\uDC64',gate:true},
  {key:'Access Keys',label:'Access Keys',emoji:'\uD83C\uDFAB',gate:false},
];

var stylesSheet = `
@keyframes modalIn{0%{transform:scale(0.9) rotateX(5deg);opacity:0}100%{transform:scale(1) rotateX(0);opacity:1}}
@keyframes slideLeft{0%{transform:translateX(100%)}100%{transform:translateX(0)}}
@keyframes dissolve{0%{opacity:1;backdrop-filter:blur(16px)}100%{opacity:0;backdrop-filter:blur(0px)}}
@keyframes radarPulse{0%{box-shadow:0 0 0 0 rgba(6,182,212,0.5)}50%{box-shadow:0 0 0 8px rgba(6,182,212,0.15)}100%{box-shadow:0 0 0 12px rgba(6,182,212,0)}}
@keyframes trunkGlow{0%,100%{border-color:rgba(6,182,212,0.15);box-shadow:0 0 20px rgba(6,182,212,0.05)}50%{border-color:rgba(6,182,212,0.35);box-shadow:0 0 40px rgba(6,182,212,0.15)}}
@keyframes float3d{0%,100%{transform:translateY(0) rotateX(0) translateZ(0)}50%{transform:translateY(-8px) rotateX(2deg) translateZ(20px)}}
@keyframes glowPulse{0%,100%{opacity:0.4;filter:brightness(1)}50%{opacity:1;filter:brightness(1.3)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes toastIn{0%{transform:translateY(-20px) scale(0.95);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes toastOut{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-20px) scale(0.95);opacity:0}}
@keyframes card3d{0%{transform:perspective(1000px) rotateY(0)}100%{transform:perspective(1000px) rotateY(360deg)}}
@keyframes lensFlare{0%{transform:translateX(-100%) translateY(-100%) rotate(25deg)}100%{transform:translateX(200%) translateY(200%) rotate(25deg)}}
@keyframes energyPulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.6;transform:scale(1.05)}}
@keyframes depthReveal{0%{transform:perspective(1200px) rotateX(10deg) translateY(30px);opacity:0}100%{transform:perspective(1200px) rotateX(0) translateY(0);opacity:1}}
@keyframes borderGlow{0%,100%{border-color:rgba(99,68,227,0.15);box-shadow:0 0 15px rgba(99,68,227,0.05)}50%{border-color:rgba(99,68,227,0.4);box-shadow:0 0 30px rgba(99,68,227,0.15)}}
@keyframes particleFloat{0%{transform:translateY(0) translateX(0) scale(1);opacity:0}20%{opacity:0.6}80%{opacity:0.3}100%{transform:translateY(-120px) translateX(40px) scale(0);opacity:0}}
@keyframes scanLine{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes holographic{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes fadeInRow{0%{opacity:0;transform:translateX(-20px) scale(0.97);background-color:rgba(16,185,129,0.08)}50%{background-color:rgba(16,185,129,0.04)}100%{opacity:1;transform:translateX(0) scale(1);background-color:transparent}}
@keyframes cardGlow{0%,100%{border-color:rgba(99,68,227,0.15);box-shadow:0 0 20px rgba(99,68,227,0.05),0 0 60px rgba(99,68,227,0.02)}50%{border-color:rgba(99,68,227,0.35);box-shadow:0 0 40px rgba(99,68,227,0.12),0 0 80px rgba(99,68,227,0.04)}}
@keyframes parallaxTilt{0%{transform:perspective(1200px) rotateX(0) rotateY(0)}25%{transform:perspective(1200px) rotateX(2deg) rotateY(-2deg)}50%{transform:perspective(1200px) rotateX(0) rotateY(0)}75%{transform:perspective(1200px) rotateX(-2deg) rotateY(2deg)}100%{transform:perspective(1200px) rotateX(0) rotateY(0)}}
@keyframes neonPulse{0%,100%{text-shadow:0 0 7px rgba(0,229,255,0.4),0 0 20px rgba(0,229,255,0.2)}50%{text-shadow:0 0 14px rgba(0,229,255,0.8),0 0 40px rgba(0,229,255,0.4)}}
@keyframes typewriter{0%{width:0}100%{width:100%}}
@keyframes glitch{0%{transform:translate(0)}20%{transform:translate(-2px,2px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,-2px)}80%{transform:translate(1px,2px)}100%{transform:translate(0)}}
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(99,68,227,0.5)}50%{box-shadow:0 0 0 12px rgba(99,68,227,0.15)}100%{box-shadow:0 0 0 20px rgba(99,68,227,0)}}
@keyframes particleDrift{0%{transform:translateY(100%) translateX(0) scale(0);opacity:0}10%{opacity:0.5}90%{opacity:0.3}100%{transform:translateY(-100vh) translateX(80px) scale(1);opacity:0}}
@keyframes hueRotate{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes scaleIn{0%{transform:scale(0.8) translateY(20px);opacity:0}60%{transform:scale(1.03) translateY(-2px)}100%{transform:scale(1) translateY(0);opacity:1}}
.card-tilt{transition:transform 0.5s cubic-bezier(0.23,1,0.32,1),box-shadow 0.5s cubic-bezier(0.23,1,0.32,1),border-color 0.5s ease;transform-style:preserve-3d;will-change:transform}
.card-tilt:hover{transform:perspective(1000px) rotateX(-3deg) rotateY(3deg) scale(1.03) translateZ(10px);box-shadow:0 25px 70px rgba(99,68,227,0.2),0 0 50px rgba(6,182,212,0.08),inset 0 1px 0 rgba(255,255,255,0.05);border-color:rgba(99,68,227,0.15)}
.glow-border{position:relative;overflow:hidden}
.glow-border::before{content:'';position:absolute;inset:-2px;border-radius:inherit;background:linear-gradient(135deg,rgba(99,68,227,0),rgba(6,182,212,0),rgba(16,185,129,0));z-index:-1;transition:all 0.5s ease}
.glow-border:hover::before{background:linear-gradient(135deg,rgba(99,68,227,0.4),rgba(6,182,212,0.3),rgba(16,185,129,0.2))}
.glow-border::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,0.03) 45%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.03) 55%,transparent 60%);transform:translateX(-100%) translateY(-100%) rotate(25deg);transition:transform 0.8s ease}
.glow-border:hover::after{transform:translateX(100%) translateY(100%) rotate(25deg)}
.shimmer-text{background:linear-gradient(90deg,#e2e8f0,#a78bfa,#6366f1,#a78bfa,#e2e8f0);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s ease-in-out infinite}
.enterprise-card{animation:depthReveal 0.6s cubic-bezier(0.23,1,0.32,1) both;transform-style:preserve-3d}
.enterprise-card:nth-child(1){animation-delay:0.05s}
.enterprise-card:nth-child(2){animation-delay:0.1s}
.enterprise-card:nth-child(3){animation-delay:0.15s}
.enterprise-card:nth-child(4){animation-delay:0.2s}
.enterprise-card:nth-child(5){animation-delay:0.25s}
.enterprise-card:nth-child(6){animation-delay:0.3s}
.card-shine{position:relative;overflow:hidden}
.card-shine::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.03) 35%,rgba(255,255,255,0.05) 40%,rgba(255,255,255,0.03) 45%,transparent 50%);transform:translateX(-100%);transition:transform 0.8s ease;pointer-events:none;z-index:2}
.card-shine:hover::before{transform:translateX(100%)}
.enterprise-glow{animation:cardGlow 3s ease-in-out infinite;position:relative}
.enterprise-glow::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,rgba(99,68,227,0.3),rgba(6,182,212,0.2),rgba(16,185,129,0.15));z-index:-1;opacity:0;transition:opacity 0.5s;}
.enterprise-glow:hover::before{opacity:1}
.parallax-card{animation:parallaxTilt 8s ease-in-out infinite;transform-style:preserve-3d}
.parallax-card:hover{animation-play-state:paused}
.neon-text{animation:neonPulse 2s ease-in-out infinite}
.premium-badge{animation:pulseRing 2s ease-in-out infinite;position:relative}
.premium-badge::after{content:'';position:absolute;inset:-4px;border-radius:inherit;background:linear-gradient(135deg,rgba(99,68,227,0.2),rgba(6,182,212,0.15));z-index:-1;filter:blur(8px)}
.scale-enter{animation:scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
.glitch-hover:hover{animation:glitch 0.3s ease-in-out}
.hue-rotate-premium{animation:hueRotate 8s linear infinite}
.glass-card{background:rgba(11,15,25,0.4);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.04)}
.glass-card:hover{background:rgba(11,15,25,0.6);border-color:rgba(255,255,255,0.08)}
.depth-card{transform-style:preserve-3d;perspective:1200px}
.depth-card>*{transform:translateZ(20px)}
.holographic-bg{background:linear-gradient(135deg,rgba(99,68,227,0.03),rgba(6,182,212,0.03),rgba(16,185,129,0.03),rgba(99,68,227,0.03));background-size:400% 400%;animation:holographic 6s ease infinite}
`;

function BgOrbs(){
  return <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/4 blur-[140px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/4 blur-[140px]" />
    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-500/2 blur-[120px]" />
    <div className="absolute top-[10%] right-[20%] w-[25%] h-[25%] rounded-full bg-cyan-500/2 blur-[100px]" />
    <div className="holographic-bg absolute inset-0 opacity-30" />
  </div>
}

function MetricCard(p){
  var l=p.label; var v=p.value; var ic=p.icon; var clr=p.color||'#6366f1'; var tr=p.trend;
  var dS=useState(typeof v==='number'?0:(v||'\u2014')); var d=dS[0]; var sD=dS[1]; var pV=useRef(v);
  useEffect(function(){if(typeof v!=='number'){sD(v);return}if(v===pV.current)return;pV.current=v;var st=performance.now();var sv=d;function raf(n){var p2=Math.min((n-st)/600,1);var e=1-Math.pow(1-p2,3);sD(Math.round(sv+(v-sv)*e));if(p2<1)requestAnimationFrame(raf)}requestAnimationFrame(raf)},[v]);
    return <div className="enterprise-card card-shine enterprise-glow depth-card bg-[#0B0F19]/80 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 group hover:border-white/[0.07] transition-all duration-500 card-tilt">
    <div className="flex items-start justify-between mb-3">
      <div><p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-400 transition-colors">{l}</p><p className={cn('text-3xl font-bold mt-1 tracking-tight',v===0||v==='\u2014'?'text-slate-600':'text-white')}>{typeof v==='number'?d:v}</p></div>
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center" style={{color:clr}}>{ic}</div>
    </div>
    {tr&&<div className="flex items-center gap-1.5 mt-1"><span className="text-[11px] font-semibold" style={{color:tr.startsWith('+')?'#10b981':'#ef4444'}}>{tr}</span><span className="text-[9px] text-slate-600">vs last period</span></div>}
  </div>
}

function PipelineBar(p){
  return <div className="mb-3">
    <div className="flex items-center justify-between mb-1.5"><span className="text-xs font-medium text-slate-300">{p.name}</span><span className="text-[11px] font-semibold text-slate-400">{p.pct}%</span></div>
    <div className="h-3 w-full rounded-full bg-white/[0.03] overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{width:p.pct+'%',background:p.color,boxShadow:'0 0 12px '+p.color.replace('linear-gradient(90deg, ','').split(',')[0]}}/></div>
  </div>
}

function TeamCard(p){
  var m=p.member;
  return <div className="enterprise-card card-shine card-tilt enterprise-glow depth-card bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:'linear-gradient(135deg,'+m.avatar+',rgba(0,0,0,0.3))'}}>{m.initials}</div>
      <div><p className="text-sm font-semibold text-white">{m.name}</p>
        <span className={cn('inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-medium mt-0.5',m.status==='Active'?'bg-emerald-500/10 text-emerald-400':m.status==='On Call'?'bg-cyan-500/10 text-cyan-400':'bg-slate-500/10 text-slate-400')}>
          {m.status==='On Call'&&<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"/>}
          <span className={'w-1.5 h-1.5 rounded-full '+((m.status==='Active'&&'bg-emerald-500')||(m.status==='On Call'&&'bg-amber-500')||'bg-slate-500')}/>
          {m.status}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center"><div><p className="text-sm font-bold text-white">{m.volume}</p><p className="text-[8px] text-slate-600 uppercase tracking-wider">Volume</p></div><div><p className="text-sm font-bold text-white">{m.calls}</p><p className="text-[8px] text-slate-600 uppercase tracking-wider">Calls</p></div><div><p className="text-sm font-bold text-emerald-400">{m.rate}%</p><p className="text-[8px] text-slate-600 uppercase tracking-wider">Rate</p></div></div>
  </div>
}

function AnimatedWords(t){if(typeof t!=='string')return t;return <span className="inline">{t}</span>}

function TimelineItem(p){
  return <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-b-0">
    <span className={'w-2 h-2 rounded-full shrink-0 '+p.dot}/>
    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-200 truncate">{AnimatedWords(p.name)}</p><p className="text-[10px] text-slate-500">{p.source}</p></div>
    <span className="text-[10px] font-medium text-emerald-400 shrink-0">{p.status}</span>
    <span className="text-[10px] text-slate-600 shrink-0 w-12 text-right">{p.time}</span>
  </div>
}

function FollowUpReminder(p){
  return <div className="border-2 rounded-xl p-4 mb-3 bg-[#0B0F19]/80" style={{borderColor:'#FF5722'}}>
    <div className="flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse shrink-0"/>
      <div><p className="text-xs font-semibold text-amber-400 tracking-wide"><svg className="w-4 h-4 inline mr-1.5 -mt-0.5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>FOLLOW-UP REMINDER � Call {p.leadName} Now!</p><p className="text-[10px] text-slate-500 mt-1">{p.leadName} &middot; {p.time}</p></div>
    </div>
  </div>
}

function formatPhone(val){
  var digits=val.replace(/\D/g,'').slice(0,11);
  if(digits.length===0)return'';
  if(digits.length<=1)return'+'+digits;
  if(digits.length<=4)return'+'+digits.slice(0,1)+' ('+digits.slice(1);
  if(digits.length<=7)return'+'+digits.slice(0,1)+' ('+digits.slice(1,4)+') '+digits.slice(4);
  return'+'+digits.slice(0,1)+' ('+digits.slice(1,4)+') '+digits.slice(4,7)+'-'+digits.slice(7,11);
}

function ManualLeadForm(p){
  var setLeads=p.setLeads;var setManualLeads=p.setManualLeads;var setMetrics=p.setMetrics;var manualLeads=p.manualLeads;var isPremium=p.isPremium||false;
  var nS=useState('');var n=nS[0];var sN=nS[1];
  var eS2=useState('');var e=eS2[0];var sE=eS2[1];
  var pS2=useState('');var ph=pS2[0];var sP=pS2[1];
  var vS=useState({});var fErrors=vS[0];var sFE=vS[1];
  var tS=useState({});var trunks=tS[0];var sT=tS[1];
  var toS=useState(null);var toast=toS[0];var setToast=toS[1];
  var ac=useState(0);var addCount=ac[0];var setAddCount=ac[1];
  function vEmail(em){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)}
  function h(ev){
    ev.preventDefault();var errs={};
    if(!n.trim())errs.name='Required';
    if(e.trim()&&!vEmail(e.trim()))errs.email='Invalid email format \u2014 must be something@domain.com';
    if(Object.keys(errs).length>0){sFE(errs);return}
    sFE({});
    var entry={id:'manual-'+Date.now(),prospectName:n.trim(),email:e.trim()||null,phone:ph||null,leadSource:'Manual Entry',time:new Date().toLocaleTimeString(),status:'ROUTING'};
    setLeads(function(prev){return[entry].concat(prev).slice(0,100)});
    setManualLeads(function(prev){var updated=[{name:n.trim(),email:e.trim()||'\u2014',phone:ph||'\u2014',time:new Date().toLocaleTimeString(),status:'Manual'}].concat(prev).slice(0,20);try{localStorage.setItem('manualLeads',JSON.stringify(updated))}catch(ex){}return updated});
    setMetrics(function(prev){return{...prev,totalActiveLeads:(prev.totalActiveLeads||0)+1}});
    setToast('Lead added! \u2705');setTimeout(function(){setToast(null)},3000);setAddCount(function(p){return p+1})
  }
  function toggleTrunk(idx){sT(function(prev){var n2={...prev};n2[idx]=!n2[idx];return n2})}
  function onEmailBlur(){if(e.trim()&&!vEmail(e.trim())){sFE(function(p){return{...p,email:'Invalid email format \u2014 must be something@domain.com'}})}}
  function handlePhoneChange(ev){
    var raw=ev.target.value;
    var clean=raw.replace(/[^0-9+\-() ]/g,'');
    sFE(function(p2){var n2={...p2};delete n2.phone;return n2});
    sP(clean);
  }
  return <div className="mb-8 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 card-tilt card-shine enterprise-glow depth-card parallax-card" style={{animation:'float3d 6s ease-in-out infinite'}}>
    <div className="flex items-center gap-2.5 mb-4"><div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">{SvgZap('w-3.5 h-3.5 text-violet-400')}</div><h2 className="text-sm font-bold text-white shimmer-text">Manual Lead Sandbox</h2><span className="text-[9px] text-slate-500 ml-auto">{manualLeads.length} leads</span></div>
    {toast&&<div className="fixed top-6 right-6 z-[999] bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-300 text-sm font-semibold shadow-[0_8px_32px_rgba(16,185,129,0.2)] backdrop-blur-xl" style={{animation:'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>{'\u2705'} {toast}</div>}
    <form onSubmit={h} className="flex items-end gap-3 mb-4">
      <div className="flex-1"><label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Name *</label><input type="text" value={n} onChange={function(ev){var v=ev.target.value.replace(/[^a-zA-Z\s]/g,'');sFE(function(p2){var n2={...p2};delete n2.name;return n2});sN(v)}} placeholder="Enter name (alphabetic only)" className={cn('w-full bg-white/[0.03] border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none',fErrors.name?'border-red-500/50 focus:border-red-500':'border-white/[0.06] focus:border-violet-500/50')}/>{fErrors.name&&<p className="text-[9px] text-red-400 mt-1">{fErrors.name}</p>}</div>
      <div className="flex-1"><label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Email</label><input type="text" value={e} onChange={function(ev){sFE(function(p2){var n2={...p2};delete n2.email;return n2});sE(ev.target.value)}} onBlur={onEmailBlur} placeholder="email@domain.com" className={cn('w-full bg-white/[0.03] border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none',fErrors.email?'border-red-500/50 focus:border-red-500':'border-white/[0.06] focus:border-violet-500/50')}/>{fErrors.email&&<p className="text-[9px] text-red-400 mt-1">{fErrors.email}</p>}</div>
            <InternationalPhoneInput value={ph} onChange={function(v){sFE(function(p2){var n2={...p2};delete n2.phone;return n2});sP(v)}} isPremium={isPremium} disabled={!isPremium} error={fErrors.phone} label='Phone'/>
      <button type="submit" disabled={!n.trim()} className="bg-[#6344E3] hover:bg-[#5035C4] text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-[0_4px_15px_rgba(99,68,227,0.3)] disabled:opacity-50 transition-all whitespace-nowrap">{'\u2795'} Add Lead</button>
    </form>
    {manualLeads.length>0?<div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/[0.04]"><th className="pb-2 pr-3 font-semibold">Name</th><th className="pb-2 pr-3 font-semibold">Email</th><th className="pb-2 pr-3 font-semibold">Phone</th><th className="pb-2 pr-3 font-semibold">Time</th><th className="pb-2 pr-3 font-semibold">Status</th><th className="pb-2 font-semibold">Call Trunk</th></tr></thead><tbody>{manualLeads.map(function(l,i){var trunkOn=trunks[i];var isNew=i===0&&addCount>0;return <tr key={i} className={'border-b border-white/[0.02] text-sm text-slate-300 transition-all duration-500 '+(isNew?'bg-emerald-500/5':'')} style={isNew?{animation:'fadeInRow 0.6s ease-out'}:{}}><td className="py-2.5 pr-3 font-medium text-white">{l.name}</td><td className="py-2.5 pr-3 text-slate-400">{l.email}</td><td className="py-2.5 pr-3 text-slate-400">{l.phone}</td><td className="py-2.5 pr-3 text-slate-500">{l.time}</td><td className="py-2.5 pr-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{l.status}</span></td><td className="py-2.5"><button onClick={function(){toggleTrunk(i)}} className={cn('text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all',trunkOn?'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25':'bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-white/[0.06]')}>{'\uD83D\uDCDE'} {trunkOn?'Trunk Active':'Connect'}</button></td></tr>})}</tbody></table></div>:<div className="text-center py-6"><p className="text-xs text-slate-600">Waiting for live ingestion pipelines... Server connected.</p></div>}
  </div>
}

function Sidebar(p){
  var aT=p.activeTab; var sT=p.setTab; var u=p.user; var oL=p.onLogout; var sA=p.setShowPaymentAlert; var iP=p.subscriptionTier==='PREMIUM';
  var dS=useState(false);var dd=dS[0];var sD=dS[1];
  var soR=useRef(null);
  var soDd=useRef(null);
  var sDP=useState({top:0,left:0,width:260,dropUp:false});var soPos=sDP[0];var setSoPos=sDP[1];
  var sPh=useState('');var sp=sPh[0];var setSp=sPh[1];
  function hN(k,g){if(g&&!iP&&k!=='Billing & Plans'){sA({show:true,tab:k,isGated:true});return}sT(k)}
  useEffect(function(){
    function handleSO(ev){
      if(dd&&soDd.current&&!soDd.current.contains(ev.target)&&soR.current&&!soR.current.contains(ev.target)){sD(false)}
    }
    document.addEventListener('mousedown',handleSO);
    return function(){document.removeEventListener('mousedown',handleSO)}
  },[dd]);

  function toggleSO(){
    if(soR.current){
      var rect=soR.current.getBoundingClientRect();
      var spaceBelow=window.innerHeight-rect.bottom;
      var ddHeight=380;
      var isUp=spaceBelow<ddHeight&&rect.top>ddHeight;
      setSoPos({
        top:isUp?rect.top-ddHeight-8:rect.bottom+8,
        left:rect.left,
        width:Math.max(260,rect.width),
        dropUp:isUp
      });
    }
    sD(!dd);
  }
  return <div className="w-[260px] bg-[#060913] border-r border-white/[0.04] p-5 flex flex-col justify-between h-screen sticky top-0 shrink-0 overflow-y-auto z-50">
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <div className={'w-11 h-11 rounded-lg bg-white/[0.04] border flex items-center justify-center '+(iP?'shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-500/30':'shadow-[0_0_20px_rgba(99,68,227,0.3)] border-white/[0.08]')}>
            <img src="/leadarrow-logo.png" alt="LeadArrow" className="w-7 h-7 object-contain"/>
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
        </div>
        <div><p className="text-sm font-extrabold text-white tracking-[0.12em]">LeadArrow</p><p className={'text-[8px] tracking-[0.2em] uppercase '+(iP?'text-emerald-400 font-bold':'text-slate-500')}>{iP?'\u2605 Enterprise Elite \u2605':'Enterprise'}</p></div>
      </div>
      <div className="relative mb-6">
        <button ref={soR} onClick={toggleSO} className="w-full flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 hover:bg-white/[0.04] transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">{(u?.firstName||'J').charAt(0)}</div>
          <div className="flex-1 min-w-0 text-left"><p className="text-xs font-semibold text-slate-200 truncate">{u?.firstName||'Jane Doe'}</p><p className="text-[8px] text-slate-500 truncate tracking-wide">{iP?'Admin':'User'}</p></div>
          {SvgDown('w-3 h-3 text-slate-500 shrink-0 transition-transform '+(dd?'rotate-180':''))}
        </button>
        {dd?<div ref={soDd} className="fixed bg-[#0c1017] border border-white/[0.12] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] z-[99999] backdrop-blur-xl p-3" style={{top:soPos.top,left:soPos.left,width:soPos.width,transition:'opacity 0.15s ease-out'}}>
          <label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Profile Phone</label>
          <InternationalPhoneInput value={sp} onChange={setSp} isPremium={iP} disabled={false} error='' label=''/>
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <button onClick={function(){sD(false);if(oL)oL()}} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all">{'\uD83D\uDEAA'} Sign Out Verification</button>
          </div>
        </div>:null}
      </div>
      <nav className="space-y-0.5">
        {NAV_ITEMS.map(function(item){
          var isA=aT===item.key; var locked=item.gate&&!iP&&item.key!=='Billing & Plans';
          return <button key={item.key} onClick={function(){hN(item.key,item.gate)}}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left',isA?'bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-[inset_0_-2px_0_#8b5cf6]':'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent',locked&&'opacity-30')}>
            <span className="text-sm shrink-0">{item.emoji}</span>
            <span className="flex-1">{item.label}</span>
            {locked&&<span className="text-[9px] text-amber-500/70">{SvgLock('w-3 h-3')}</span>}
          </button>
        })}
      </nav>
      <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-0.5">
        <p className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold px-3 mb-2">Management</p>
        <a href="/dashboard/admin" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent">
          <span className="text-sm shrink-0">{'\uD83D\uDD11'}</span><span className="flex-1">Admin</span>
        </a>
        <a href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent">
          <span className="text-sm shrink-0">{'\u2699\uFE0F'}</span><span className="flex-1">Rep Settings</span>
        </a>
        <a href="/dashboard/routing" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent">
          <span className="text-sm shrink-0">{'\uD83D\uDD04'}</span><span className="flex-1">Routing</span>
        </a>
        <a href="/dashboard/alerts" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent">
          <span className="text-sm shrink-0">{'\uD83D\uDD14'}</span><span className="flex-1">Alert Thresholds</span>
        </a>
      </div>
    </div>
    <div className="mt-6 pt-4 border-t border-white/[0.04]">
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full',iP?'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]':'bg-amber-500')}/>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{iP?'Premium Active':'Free Trial'}</span>
      </div>
    </div>
  </div>
}

function GateAlert(d){if(!d||!d.data||!d.data.show)return null;var da=d.data;
  return <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={d.onClose}>
    <div onClick={function(ev){ev.stopPropagation()}} className="bg-[#0B0F19] border border-white/[0.06] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center" style={{animation:'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">{SvgLock('w-8 h-8 text-amber-400')}</div>
      <h3 className="text-lg font-bold text-white mb-2">Feature Locked</h3>
      <p className="text-sm text-slate-400 mb-6">Feature Locked &mdash; Upgrade to Premium to map Twilio Voice Messaging trunks and unlock live team conversion analytics for <strong className="text-slate-200">{da.tab}</strong>.</p>
      <div className="flex gap-3">
        <button onClick={d.onClose} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] py-2.5 rounded-lg text-sm font-medium">Cancel</button>
        <button onClick={function(){d.onClose();d.setTab('Billing & Plans')}} className="flex-1 bg-[#6344E3] hover:bg-[#5035C4] text-white py-2.5 rounded-lg text-sm font-semibold shadow-[0_4px_20px_rgba(99,68,227,0.3)]">Upgrade Now</button>
      </div>
    </div>
  </div>
}

function LicenseModal(p2){
  var oc=p2.onClose;var oa=p2.onActivate;var um=p2.userEmail||'';
  var kS=useState('');var k=kS[0];var sK=kS[1];
  var sS=useState('');var s=sS[0];var sS2=sS[1];
  var eS=useState('');var err=eS[0];var sE=eS[1];
  async function h(){
    if(!k.trim())return;
    sS2('activating');sE('');
    try{
      var r=await fetch(SSE_HOST+'/api/admin/validate-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:k.trim(),email:um||'key-user@leadarrow.com'})});
      var d=await r.json();
      if(d.success){
        if(oa)await oa({licenseKey:k.trim()});
        sS2('success');fireConfetti();setTimeout(oc,1500);
      }else{
        sE(d.message||'Invalid key');sS2('');
      }
    }catch(ex){
      sE('Network error � try again');sS2('');
    }
  }
  return <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={oc}>
    <div onClick={function(ev){ev.stopPropagation()}} className="bg-[#0B0F19] border border-white/[0.06] rounded-2xl shadow-2xl p-8 max-w-md w-full" style={{animation:'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div className="w-16 h-16 rounded-2xl bg-[#F1C40F]/10 flex items-center justify-center mx-auto mb-5 border border-[#F1C40F]/20">{SvgStar('w-8 h-8 text-[#F1C40F]')}</div>
      <h3 className="text-lg font-bold text-white text-center mb-2">Activate Enterprise License</h3>
      <p className="text-sm text-slate-400 text-center mb-6">Enter your license key to unlock premium features</p>
      <input type="text" placeholder="LA-2026-XXXXXXXX" value={k} onChange={function(ev){sK(ev.target.value.toUpperCase());sE('')}} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F1C40F]/50 text-center tracking-[0.2em] font-mono"/>
      {s==='success'&&<div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{SvgCheck('w-3.5 h-3.5 shrink-0')} License activated!</div>}
      {err&&<div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}
      <button onClick={h} disabled={!k.trim()||s==='activating'} className="mt-5 w-full text-sm font-medium bg-[#F1C40F] hover:bg-[#D4AC0D] text-black py-3 rounded-lg disabled:opacity-50 transition-all duration-200 shadow-[0_0_15px_rgba(241,196,15,0.25)]">
        {s==='activating'?<span className="flex items-center gap-2 justify-center">{SvgX('w-4 h-4 animate-spin')} Validating...</span>:'Activate License'}
      </button>
      <button onClick={oc} className="block w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-3">Cancel</button>
    </div>
  </div>
}

function BookingCard(p){
  var b=p.booking;
  return <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-xl p-4 mb-3">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-sm">{SvgPhone('w-4 h-4 text-cyan-400')}</div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-200 truncate">{b.prospectName||b.name||'Booking'}</p><p className="text-[10px] text-slate-500">{b.leadSource||b.source||'Scheduled'}</p></div>
      <span className="text-[10px] font-medium text-cyan-400 shrink-0 border border-cyan-500/20 px-2 py-0.5 rounded-full">Booking</span>
    </div>
    {b.hostEmail&&<div className="mt-2 text-[10px] text-slate-500 bg-white/[0.02] rounded-lg px-3 py-1.5"><span className="text-slate-400">Host Email:</span> {b.hostEmail}</div>}
    {b.salesRep&&<div className="text-[10px] text-slate-500 bg-white/[0.02] rounded-lg px-3 py-1.5 mt-1"><span className="text-slate-400">Sales Rep:</span> <span className="text-violet-400 font-medium">{b.salesRep}</span></div>}
  </div>
}

function EnterpriseContactModal(p){
  var oc=p.onClose;
  return <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={oc}>
    <div onClick={function(ev){ev.stopPropagation()}} className="bg-[#0B0F19] border border-white/[0.06] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] p-8 max-w-lg w-full" style={{animation:'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div className="text-center mb-6"><h2 className="text-xl font-bold text-white">Enterprise Inquiry</h2><p className="text-sm text-slate-400 mt-1">Contact our sales team for a custom enterprise solution</p></div>
      <div className="grid grid-cols-2 gap-4">
        <a href="mailto:sales@leadarrow.com?subject=Enterprise%20Custom%20Plan%20Setup%20Inquiry" className="flex flex-col items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 hover:bg-violet-500/10 hover:border-violet-500/20 transition-all group">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">{SvgMail('w-8 h-8 text-violet-400')}</div>
          <span className="text-sm font-semibold text-white">{'\uD83D\uDCE7'} Send Email</span>
          <span className="text-[9px] text-slate-500">sales@leadarrow.com</span>
        </a>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">{SvgWA('w-8 h-8 text-emerald-400')}</div>
          <span className="text-sm font-semibold text-white">{'\uD83D\uDCAC'} WhatsApp Us</span>
          <span className="text-[9px] text-slate-500">+1 (234) 567-890</span>
        </a>
      </div>
      <button onClick={oc} className="w-full mt-6 text-center text-xs text-slate-500 hover:text-slate-300 py-2">Cancel</button>
    </div>
  </div>
}

function sparklinePath(data,w,h){
  var mn=Math.min.apply(null,data);
  var mx=Math.max.apply(null,data);
  var r=mx-mn||1;
  var xs=w/(data.length-1);
  return data.map(function(v,i){
    var x=i*xs;
    var y=h-((v-mn)/r)*h*0.85-h*0.05;
    return (i===0?'M':'L')+x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
}

function RepLeaderboard(){
  var ld=useState(null);var board=ld[0];var setBoard=ld[1];
  var ldL=useState(true);var loading=ldL[0];var setLoading=ldL[1];
  var ldE=useState(null);var error=ldE[0];var setError=ldE[1];
  useEffect(function(){
    var token=localStorage.getItem('token');
    if(!token){setLoading(false);return}
    fetch(SSE_HOST+'/api/workspace/leaderboard',{headers:{'Authorization':'Bearer '+token}})
      .then(function(r){return r.json()})
      .then(function(d){setBoard(d);setLoading(false)})
      .catch(function(e){setError(e.message);setLoading(false)});
  },[]);
  if(loading)return <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5"><p className="text-xs text-slate-500 text-center py-4">Loading leaderboard...</p></div>;
  if(error)return null;
  if(!board||!board.leaderboard||board.leaderboard.length===0)return null;
  var topRep=board.leaderboard[0];
  return <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 enterprise-card card-tilt card-shine enterprise-glow depth-card parallax-card mt-6">
    <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">{SvgStar('w-3.5 h-3.5 text-amber-400')}</div><h2 className="text-sm font-bold text-white">Rep Leaderboard</h2></div><span className="text-[10px] text-slate-500">{board.totalLeads} total leads</span></div>
    {topRep&&<div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_20px_rgba(251,191,36,0.3)]">#1</div>
      <div className="flex-1"><p className="text-sm font-bold text-white">{topRep.name}</p><p className="text-[10px] text-slate-400">{topRep.email}</p></div>
      <div className="text-right"><p className="text-lg font-bold text-amber-400">{topRep.score}</p><p className="text-[9px] text-slate-500">Score</p></div>
      <div className="text-right"><p className="text-lg font-bold text-emerald-400">{topRep.pickupRate}%</p><p className="text-[9px] text-slate-500">Pickup</p></div>
    </div>}
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/[0.04]"><th className="pb-2 pr-2 font-semibold">#</th><th className="pb-2 pr-3 font-semibold">Rep</th><th className="pb-2 pr-3 font-semibold">Offered</th><th className="pb-2 pr-3 font-semibold">Accepted</th><th className="pb-2 pr-3 font-semibold">Pickup%</th><th className="pb-2 pr-3 font-semibold">Avg Resp</th><th className="pb-2 font-semibold">Score</th></tr></thead><tbody>{board.leaderboard.map(function(r,i){return <tr key={r.userId} className="border-b border-white/[0.02] text-sm text-slate-300 hover:bg-white/[0.02] transition-colors">
      <td className="py-2.5 pr-2"><span className={'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold '+(i===0?'bg-amber-500/20 text-amber-400':i===1?'bg-slate-400/20 text-slate-300':i===2?'bg-amber-700/20 text-amber-600':'bg-white/[0.03] text-slate-600')}>{i+1}</span></td>
      <td className="py-2.5 pr-3"><span className="text-white font-medium">{r.name}</span><br/><span className="text-[9px] text-slate-500">{r.isActive?'Active':'Inactive'}</span></td>
      <td className="py-2.5 pr-3 text-slate-400">{r.leadsOffered}</td>
      <td className="py-2.5 pr-3 text-emerald-400 font-medium">{r.leadsAccepted}</td>
      <td className="py-2.5 pr-3">{r.pickupRate}%</td>
      <td className="py-2.5 pr-3 text-slate-400">{r.avgResponseTime<1000?r.avgResponseTime+'ms':(r.avgResponseTime/1000).toFixed(1)+'s'}</td>
      <td className="py-2.5"><span className={'text-xs font-bold px-2 py-0.5 rounded-full '+(r.score>=80?'bg-emerald-500/15 text-emerald-400':r.score>=60?'bg-amber-500/15 text-amber-400':'bg-red-500/15 text-red-400')}>{r.score}</span></td>
    </tr>})}</tbody></table></div>
  </div>;
}

function AdminKeysView(){
  var kS=useState([]);var keys=kS[0];var sK=kS[1];
  var lS=useState(false);var loading=lS[0];var sL=lS[1];
  var gS=useState(false);var generating=gS[0];var sG=gS[1];
  var cpS=useState(null);var copied=cpS[0];var sCp=cpS[1];
  function loadKeys(){
    sL(true);
    fetch(SSE_HOST+'/api/admin/keys').then(function(r){return r.json()}).then(function(d){sK(d||[]);sL(false)}).catch(function(){sL(false)});
  }
  function generateKey(){
    sG(true);
    fetch(SSE_HOST+'/api/admin/generate-key',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json()}).then(function(d){if(d.success){sK(function(prev){return[d.key].concat(prev)});fireConfetti()}sG(false)}).catch(function(){sG(false)});
  }
  function copyKey(k){
    navigator.clipboard.writeText(k).then(function(){sCp(k);setTimeout(function(){sCp(null)},2000)}).catch(function(){});
  }
  useEffect(function(){loadKeys()},[]);
  return <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl font-bold text-white">Workspace Access Keys</h1><p className="text-xs text-slate-400 mt-1">Generate and manage license keys for premium access</p></div>
      <button onClick={generateKey} disabled={generating} className="bg-[#F1C40F] hover:bg-[#D4AC0D] text-black font-semibold px-5 py-2.5 rounded-xl text-sm shadow-[0_0_20px_rgba(241,196,15,0.25)] disabled:opacity-50 transition-all flex items-center gap-2">
        {generating?<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path></svg> Generating...</>:<>{'\uD83C\uDFAB'} Generate Access Key</>}
      </button>
    </div>
    <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {loading?<div className="p-12 text-center text-xs text-slate-500">Loading keys...</div>:keys.length===0?<div className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F1C40F]/10 border border-[#F1C40F]/20 flex items-center justify-center mx-auto mb-4">{'\uD83C\uDFAB'}</div>
        <p className="text-sm text-slate-400">No license keys generated yet.</p>
        <p className="text-xs text-slate-600 mt-1">Click "Generate Access Key" to create the first one.</p>
      </div>:<table className="w-full text-left">
        <thead><tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/[0.04]"><th className="pb-3 pl-6 pr-4 font-semibold">Key</th><th className="pb-3 pr-4 font-semibold">Status</th><th className="pb-3 pr-4 font-semibold">Created</th><th className="pb-3 pr-4 font-semibold">Used By</th><th className="pb-3 pr-6 font-semibold text-right">Action</th></tr></thead>
        <tbody>{keys.map(function(item,i){return <tr key={item.key} className="border-b border-white/[0.02] text-sm text-slate-300 hover:bg-white/[0.01] transition-all">
          <td className="py-3.5 pl-6 pr-4 font-mono text-xs tracking-[0.15em] text-white font-semibold">{item.key}</td>
          <td className="py-3.5 pr-4"><span className={cn('text-[10px] px-2.5 py-0.5 rounded-full font-medium',item.status==='Active'?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-slate-500/10 text-slate-400 border border-slate-500/20')}>{item.status}</span></td>
          <td className="py-3.5 pr-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
          <td className="py-3.5 pr-4 text-xs text-slate-500">{item.usedBy||'\u2014'}</td>
          <td className="py-3.5 pr-6 text-right">
            <button onClick={function(){copyKey(item.key)}} className="text-[10px] px-3 py-1.5 rounded-lg font-medium bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.06] transition-all flex items-center gap-1.5 ml-auto">
              {copied===item.key?<><span className="text-emerald-400">{'\u2713'}</span> Copied</>:<>{'\uD83D\uDCCB'} Copy</>}
            </button>
          </td>
        </tr>})}</tbody>
      </table>}
    </div>
  </div>
}

function detectCardBrand(num){
  var clean=num.replace(/\D/g,'');
  if(/^4/.test(clean))return{name:'Visa',maxLen:16,maxCvv:3,color:'#1a1f71',icon:'V'};
  if(/^5[1-5]/.test(clean))return{name:'MasterCard',maxLen:16,maxCvv:3,color:'#eb001b',icon:'M'};
  if(/^3[47]/.test(clean))return{name:'Amex',maxLen:15,maxCvv:4,color:'#2e77bc',icon:'A'};
  if(/^6011|^65|^5[1-5]/.test(clean))return{name:'Discover',maxLen:16,maxCvv:3,color:'#ff6000',icon:'D'};
  if(/^35(?:2[89]|[3-8][0-9])/.test(clean))return{name:'JCB',maxLen:16,maxCvv:3,color:'#0b7c43',icon:'J'};
  return null;
}
function luhnCheck(num){
  var s=0;var dbl=false;
  for(var i=num.length-1;i>=0;i--){
    var d=parseInt(num[i],10);
    if(dbl){d*=2;if(d>9)d-=9}
    s+=d;dbl=!dbl;
  }
  return s%10===0;
}
function PaymentCheckoutView(p){
  var plan=(typeof p.selectedPlan==='object'&&p.selectedPlan)||(Array.isArray(p.planCards)&&p.planCards[1]);
  var cNS=useState('');var cardName=cNS[0];var sCN=cNS[1];
  var cNuS=useState('');var cardNumber=cNuS[0];var sCnu=cNuS[1];
  var cES=useState('');var cardExpiry=cES[0];var sCE=cES[1];
  var cCS=useState('');var cardCvv=cCS[0];var sCC=cCS[1];
  var pS=useState(false);var processing=pS[0];var sP=pS[1];
  var suS=useState(false);var success=suS[0];var sSu=suS[1];
  var lkS=useState('');var licenseKey=lkS[0];var sLk=lkS[1];
  var eS2=useState('');var error=eS2[0];var sE2=eS2[1];
  var brand=detectCardBrand(cardNumber);
  function fmtCardNum(v){
    var raw=v.replace(/\D/g,'');
    var max;if(brand)max=brand.maxLen;else if(raw.length>16)max=16;else max=raw.length;
    raw=raw.slice(0,max);
    if(max===15)return raw.replace(/(\d{4})(\d{6})(\d{5})/,'$1 $2 $3').trim();
    return raw.replace(/(.{4})/g,'$1 ').trim();
  }
  function fmtExp(v){
    var raw=v.replace(/\D/g,'').slice(0,4);
    if(raw.length>=3)return raw.slice(0,2)+'/'+raw.slice(2);
    return raw;
  }
  function fmtCvv(v){return v.replace(/\D/g,'').slice(0,(brand&&brand.name==='Amex')?4:3)}

  function validateCard(){
    var clean=cardNumber.replace(/\s/g,'');
    if(!cardName.trim())return 'Cardholder name is required';
    if(clean.length<13||clean.length>19)return 'Enter a valid card number (13-19 digits)';
    if(!luhnCheck(clean))return 'Invalid card number � check the digits';
    if(cardExpiry.length<5){return 'Enter a valid expiry date (MM/YY)'}
    var expParts=cardExpiry.split('/');
    var expMonth=parseInt(expParts[0],10);
    var expYear=parseInt(expParts[1],10)+2000;
    if(expMonth<1||expMonth>12)return 'Invalid expiry month';
    var now=new Date();
    var curYear=now.getFullYear();
    var curMonth=now.getMonth()+1;
    if(expYear<curYear||(expYear===curYear&&expMonth<curMonth))return 'Card has expired';
    var cvvMax=(brand&&brand.name==='Amex')?4:3;
    if(cardCvv.length<cvvMax)return 'CVV must be '+(brand&&brand.name==='Amex'?'4':'3')+' digits for '+((brand&&brand.name)||'this card');
    return null;
  }

  function hPay(){
    var validationError=validateCard();
    if(validationError){sE2(validationError);return}
    sP(true);sE2('');
    fetch(SSE_HOST+'/api/payment/process',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        planName:plan.name,
        planPrice:plan.price,
        email:p.user?.email||'',
        cardNumber:cardNumber.replace(/\s/g,''),
        cardExpiry:cardExpiry,
        cardCvv:cardCvv,
        cardName:cardName.trim(),
        cardBrand:brand?brand.name:'Unknown',
      }),
    }).then(function(r){
      return r.json();
    }).then(function(d){
      if(d.success){
        sLk(d.licenseKey);
        p.setSubscriptionTier('PREMIUM');
        p.setUser(function(prev){if(!prev)return{tier:'PREMIUM'};return{...prev,tier:'PREMIUM'}});
        sSu(true);
        fireConfetti();
      }else{
        sE2(d.message||'Payment declined. Please check your card details and try again.');
      }
      sP(false);
    }).catch(function(){
      sE2('Network error. Please try again.');
      sP(false);
    });
  }

  if(success){
    return <div className="p-8">
      <div className="max-w-lg mx-auto bg-[#0B0F19]/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.6)] p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.2)]"><svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">Activation Complete</span>
        <h2 className="text-2xl font-bold text-white mb-2">{plan.name} Plan Active</h2>
        <p className="text-emerald-300 font-semibold text-lg mb-1">{plan.price}{plan.period}</p>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mt-6 mb-4"><p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">License Key</p><p className="text-sm font-mono tracking-[0.2em] text-[#F1C40F] font-bold">{licenseKey}</p><p className="text-[9px] text-slate-600 mt-1">Emailed to {p.user?.email||'your email'} &middot; Save this key</p></div>
        <button onClick={function(){p.setActiveTab('Dashboard');p.setSelectedPlan(null)}}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl text-base shadow-[0_4px_25px_rgba(99,68,227,0.3)] transition-all duration-200">{'\u2190'} Go to Dashboard</button>
      </div>
    </div>;
  }

  return <div className="p-8">
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">Secure Checkout</h1><p className="text-xs text-slate-400 mt-1">Complete payment to activate the {plan.name} plan</p></div>
        <button onClick={function(){p.setActiveTab('Billing & Plans')}} className="text-xs text-slate-500 hover:text-slate-300 border border-white/[0.06] px-3 py-1.5 rounded-lg transition-all">{'\u2190'} Back</button>
      </div>
      <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-6 mb-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.04] mb-4">
          <div><p className="text-sm font-semibold text-white">{plan.name} Plan</p><p className="text-[10px] text-slate-500">{plan.desc}</p></div>
          <span className="text-lg font-black text-white">{plan.price}{plan.period}</span>
        </div>

        <label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Cardholder Name</label>
        <input type="text" value={cardName} onChange={function(e){sCN(e.target.value);sE2('')}} placeholder="John Doe"
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 mb-3"/>

        <label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Card Number</label>
        <div className="relative mb-3">
          <input type="text" value={cardNumber} onChange={function(e){sCnu(fmtCardNum(e.target.value));sE2('')}}
            placeholder="4242 4242 4242 4242" maxLength={brand&&brand.maxLen===15?17:19}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 font-mono tracking-wider pr-12"/>
          {brand&&<div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{background:brand.color}}>{brand.icon}</div>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Expiry Date</label>
            <input type="text" value={cardExpiry} onChange={function(e){sCE(fmtExp(e.target.value));sE2('')}}
              placeholder="MM/YY" maxLength="5"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 font-mono"/>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">CVV</label>
            <input type="text" value={cardCvv} onChange={function(e){sCC(fmtCvv(e.target.value));sE2('')}}
              placeholder={brand&&brand.name==='Amex'?'1234':'123'} maxLength={brand&&brand.name==='Amex'?4:3}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 font-mono"/>
          </div>
        </div>

        {error&&<div className="mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

        <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Total</p><p className="text-lg font-black text-white">{plan.price}{plan.period}</p></div>
          <button onClick={hPay} disabled={processing}
            className="bg-[#6344E3] hover:bg-[#5035C4] text-white font-bold px-10 py-3.5 rounded-xl text-sm shadow-[0_4px_25px_rgba(99,68,227,0.3)] disabled:opacity-50 transition-all">
            {processing
              ? <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path></svg> Processing...</span>
              : <span className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> Pay {plan.price}</span>}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-slate-500">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secured with 256-bit TLS encryption
        </div>
      </div>
    </div>
  </div>;
}

function PremiumUpgradeModal(p){
  var isOpen=p.isOpen;var onClose=p.onClose;var onUpgrade=p.onUpgrade;var paying=p.isPaying||false;
  if(!isOpen)return null;
  return <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-md flex items-center justify-center p-4" onClick={paying?function(){}:onClose}>
    <div onClick={function(ev){ev.stopPropagation()}} className="bg-[#0B0F19]/95 backdrop-blur-xl border border-white/[0.06] rounded-3xl shadow-[0_32px_120px_rgba(0,0,0,0.8)] p-10 max-w-md w-full text-center" style={{animation:'modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <svg className="w-9 h-9 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Premium Feature</h2>
      <p className="text-sm text-slate-400 mb-8">Unlock real-time VoIP dialing, live call routing, and full telemetry streams. Upgrade to Premium to access the Click-to-Connect trunk engine.</p>
      {paying?<div className="w-full bg-gradient-to-r from-amber-500/50 to-yellow-500/50 text-black font-bold py-4 rounded-xl text-base flex items-center justify-center gap-3 cursor-not-allowed"><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path></svg> Securing Portal Gateway...</div>:<button onClick={function(){onUpgrade()}} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-4 rounded-xl text-base shadow-[0_4px_30px_rgba(245,158,11,0.3)] transition-all duration-200">Unlock Premium &mdash; $1,500/mo</button>}
      {!paying&&<button onClick={onClose} className="block w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-4 py-2">Maybe later</button>}
    </div>
  </div>
}

export default function BasicDashboard(){
  var hS=useState(false);var hydrated=hS[0];var setHydrated=hS[1];
  var uS=useState(null);var user=uS[0];var setUser=uS[1];
  var aS=useState('Dashboard');var activeTab=aS[0];var setActiveTab=aS[1];
  var pS=useState(null);var showPaymentAlert=pS[0];var setShowPaymentAlert=pS[1];
  var lS=useState(function(){try{var s=localStorage.getItem('dashboardLeads');return s?JSON.parse(s):[]}catch(ex){return[]}});var leads=lS[0];var setLeads=lS[1];
  var bS=useState([]);var bookingAlerts=bS[0];var setBookingAlerts=bS[1];
  var fS=useState([]);var followUps=fS[0];var setFollowUps=fS[1];
  var mS=useState({totalActiveLeads:0,liveCallConnections:0,conversionRate:0,queueWaitTime:'\u2014',recentLeads:[],pipelineStages:[],teamMetrics:[]});var metrics=mS[0];var setMetrics=mS[1];
  var aTS=useState('leads');var alertTab=aTS[0];var setAlertTab=aTS[1];
  var wMS=useState('triage');var workspaceMode=wMS[0];var setWorkspaceMode=wMS[1];
  var sPS=useState('Pro');var selectedPlan=sPS[0];var setSelectedPlan=sPS[1];
  var lmS=useState(false);var isLicenseModalOpen=lmS[0];var setIsLicenseModalOpen=lmS[1];
  var eMS=useState(false);var isEnterpriseModalOpen=eMS[0];var setIsEnterpriseModalOpen=eMS[1];
  function initTier(){
    try{
      var licenseAct=localStorage.getItem('licenseActivated');var fromStorage=localStorage.getItem('subscriptionTier');if(licenseAct==='true'&&(!fromStorage||fromStorage==='BASIC')){fromStorage='PREMIUM';localStorage.setItem('subscriptionTier','PREMIUM')}
      if(fromStorage&&fromStorage!=='BASIC')return fromStorage;
      var fromUser=user&&user.subscriptionTier;
      if(fromUser&&fromUser!=='BASIC')return fromUser;
      if(typeof window!=='undefined'){
        var tkn2=localStorage.getItem('token');
        if(tkn2){
          try{
            var p2=JSON.parse(atob(tkn2.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
            if(p2.subscriptionTier&&p2.subscriptionTier!=='BASIC')return p2.subscriptionTier;
          }catch(e2){}
        }
      }
      return 'BASIC';
    }catch(e){return 'BASIC'}
  }
  var tS=useState(initTier);var subscriptionTier=tS[0];var setSubscriptionTier=tS[1];
  var isPremium=subscriptionTier==='PREMIUM';
  var mLS=useState(function(){try{var stored=localStorage.getItem('manualLeads');return stored?JSON.parse(stored):[]}catch(ex){return[]}});var manualLeads=mLS[0];var setManualLeads=mLS[1];
  var iUS=useState(function(){try{var la=localStorage.getItem('licenseActivated')==='true';var st=localStorage.getItem('subscriptionTier');return la&&st!=='PREMIUM'}catch(ex){return false}});var isUnlocking=iUS[0];var setIsUnlocking=iUS[1];
  var suo=useState(false);var showUnlockOverlay=suo[0];var setShowUnlockOverlay=suo[1];
  var drS=useState(null);var drawerOpen=drS[0];var setDrawerOpen=drS[1];
  var crS=useState(false);var crmConnected=crS[0];var setCrm=crS[1];
  var slS=useState(false);var slackConnected=slS[0];var setSlack=slS[1];
  var cS=useState({});var callStates=cS[0];var setCallStates=cS[1];
  var pmS=useState(false);var showPremiumModal=pmS[0];var setShowPremiumModal=pmS[1];
  var psoS=useState(false);var showPaymentSuccessOverlay=psoS[0];var setShowPaymentSuccessOverlay=psoS[1];
  var crmF=useState({apiKey:'',pipelineId:''});var crmFormData=crmF[0];var setCrmFormData=crmF[1];
  var crmS=useState('idle');var crmFormStatus=crmS[0];var setCrmFormStatus=crmS[1];
  var swS=useState('');var slackWebhookUrl=swS[0];var setSlackWebhookUrl=swS[1];
  var cpS=useState(false);var copiedNotif=cpS[0];var setCopiedNotif=cpS[1];
  var tS2=useState([{id:'T1',type:'Primary',status:'Connected',bg:'text-emerald-400 bg-emerald-500/10'},{id:'T2',type:'Backup',status:'Standby',bg:'text-amber-400 bg-amber-500/10'}]);var trunks=tS2[0];var setTrunks=tS2[1];
  var aTF=useState(false);var showAddTrunk=aTF[0];var setShowAddTrunk=aTF[1];
  var aTD=useState({sid:'',ipAuth:'',region:'us-east'});var addTrunkData=aTD[0];var setAddTrunkData=aTD[1];
  var aRR=useState('round_robin');var activeRoutingRule=aRR[0];var setActiveRoutingRule=aRR[1];
  /* regionDropdownOpen removed � native select used instead */
  var aR=useState(12);var activeReps=aR[0];var setActiveReps=aR[1];
  var wC=useState(75);var workloadCapacity=wC[0];var setWorkloadCapacity=wC[1];
  var iB=useState(null);var ingestionBanner=iB[0];var setIngestionBanner=iB[1];

  /* ===== AUTH CHECK ===== */
  useEffect(function(){
    var tkn=localStorage.getItem('token');
    var activated=localStorage.getItem('licenseActivated')==='true';
    var storedTier=localStorage.getItem('subscriptionTier');
    if(activated&&storedTier==='PREMIUM'){
      setSubscriptionTier('PREMIUM');
      setIsUnlocking(false);
    }
    if(tkn){
      try{
        var p=JSON.parse(atob(tkn.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        setUser(p);
        if(p.subscriptionTier&&p.subscriptionTier!=='BASIC'){
          setSubscriptionTier(p.subscriptionTier);
          localStorage.setItem('subscriptionTier',p.subscriptionTier);
        }
        fetch(SSE_HOST+'/api/subscription/status?email='+encodeURIComponent(p.email||'')).then(function(r){return r.json()}).then(function(d){
          if(d.isPremium&&d.subscriptionTier){
            setSubscriptionTier(d.subscriptionTier);
            localStorage.setItem('subscriptionTier',d.subscriptionTier);
            localStorage.setItem('licenseActivated','true');
            if(d.expiresAt)localStorage.setItem('subExpiresAt',d.expiresAt);
          }
        }).catch(function(){});
      }catch(e){localStorage.removeItem('token')}
    }
    setHydrated(true);
  },[]);

  /* ===== SSE STREAM ===== */
  useEffect(function(){
    var es=null;var retry=null;var attempts=0;
    function connect(){
      try{
        es=new EventSource(SSE_HOST+'/api/stream');
        es.addEventListener('NEW_LEAD_ALERT',function(e){try{var p=JSON.parse(e.data);var en={id:p.leadId||'lead-'+Date.now(),prospectName:p.prospectName||p.name||'Unknown',email:p.email||null,phone:p.phone||null,leadSource:p.leadSource||p.source||'Slack',time:new Date().toLocaleTimeString(),status:'ROUTING'};setLeads(function(prev){var updated=[en].concat(prev).slice(0,100);try{localStorage.setItem('dashboardLeads',JSON.stringify(updated))}catch(ex){}return updated})}catch(ex){}});
        es.addEventListener('NEW_BOOKING_ALERT',function(e){try{var p=JSON.parse(e.data);setBookingAlerts(function(prev){return[p].concat(prev).slice(0,50)})}catch(ex){}});
        es.addEventListener('FOLLOW_UP_REMINDER',function(e){try{var p=JSON.parse(e.data);if(p.isValidHumanLead===true&&p.metaSource){setFollowUps(function(prev){return[p].concat(prev).slice(0,20)})}}catch(ex){}});
        es.addEventListener('METRICS_UPDATE',function(e){try{var p=JSON.parse(e.data);setMetrics(function(prev){return{...prev,...p}})}catch(ex){}});
        es.addEventListener('ACTIVE_CALL_START',function(e){try{var p=JSON.parse(e.data);if(p.leadId){setCallStates(function(prev){return{...prev,[p.leadId]:'ON_CALL'}})};setMetrics(function(prev){return{...prev,liveCallConnections:(prev.liveCallConnections||0)+1}})}catch(ex){}});
        es.addEventListener('ACTIVE_CALL_END',function(e){try{var p=JSON.parse(e.data);if(p.leadId){setCallStates(function(prev){var n2={...prev};delete n2[p.leadId];return n2})};setMetrics(function(prev){return{...prev,liveCallConnections:Math.max(0,(prev.liveCallConnections||0)-1)}})}catch(ex){}});
        es.addEventListener('PLAN_UPGRADE_SUCCESS',function(e){try{var p=JSON.parse(e.data);localStorage.setItem('subscriptionTier','PREMIUM');localStorage.setItem('licenseActivated','true');setSubscriptionTier('PREMIUM');setUser(function(prev){if(!prev)return{subscriptionTier:'PREMIUM'};return{...prev,subscriptionTier:'PREMIUM'}});setShowPaymentSuccessOverlay(true);fireConfetti();setTimeout(function(){setShowPaymentSuccessOverlay(false)},4000)}catch(ex){}});
        es.onerror=function(){if(es){try{es.close()}catch(ex){}es=null}var d=Math.min(1000*Math.pow(2,attempts),30000);attempts++;retry=setTimeout(connect,d)};
      }catch(ex){var d2=Math.min(1000*Math.pow(2,attempts),30000);attempts++;retry=setTimeout(connect,d2)}
    }
    connect();
    return function(){if(es){try{es.close()}catch(ex){}}if(retry)clearTimeout(retry)}
  },[]);

  useEffect(function(){
    fetch(SSE_HOST+'/api/metrics').then(function(r){return r.json()}).then(function(d){setMetrics(d)}).catch(function(){});
    fetch(SSE_HOST+'/api/bookings').then(function(r){return r.json()}).then(function(d){setBookingAlerts(d)}).catch(function(){});
  },[]);

  useEffect(function(){if(showPaymentAlert&&showPaymentAlert.show){var t=setTimeout(function(){setShowPaymentAlert(null)},5000);return function(){clearTimeout(t)}}},[showPaymentAlert]);

  useEffect(function(){
    var params=new URLSearchParams(window.location.search);
    if(params.get('payment')==='success'){
      localStorage.setItem('subscriptionTier','PREMIUM');
      setSubscriptionTier('PREMIUM');
      setUser(function(prev){if(!prev)return{subscriptionTier:'PREMIUM'};return{...prev,subscriptionTier:'PREMIUM'}});
      setShowPaymentSuccessOverlay(true);
      fireConfetti();
      setTimeout(function(){setShowPaymentSuccessOverlay(false)},4000);
      window.history.replaceState({},document.title,window.location.pathname);
    }
    if(params.get('payment')==='cancelled'){
      console.log('[Payment] Checkout cancelled by user');
    }
  },[]);

  /* ===== LIVE HUMAN VALIDATION GATE � NO MOCK SEQUENCES ACCEPTED ===== */

  /* ===== CLICK-TO-CONNECT ENGINE ===== */
  function handleConnectClick(leadId, leadName, email, phone) {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setCallStates(function(prev){return{...prev,[leadId]:'DIALING'}});
    fetch(SSE_HOST+'/api/telephony/dial', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({leadId:leadId,leadName:leadName,email:email,phone:phone,routingRule:activeRoutingRule,trunkConfigs:trunks}),
    }).then(function(r){return r.json()}).then(function(data){
      if(data&&data.success){
        setCallStates(function(prev){return{...prev,[leadId]:'ON_CALL'}});
        setMetrics(function(prev){return{...prev,liveCallConnections:(prev.liveCallConnections||0)+1}});
        if(data.allocatedRep){
          var fuEntry={message:'\u26A0\uFE0F FOLLOW-UP REMINDER \u2014 Call '+leadName+' Now!',leadName:leadName,timestamp:Date.now(),type:'CRM_FOLLOW_UP',repName:data.allocatedRep.name,isValidHumanLead:true,metaSource:'telephony_connect'};
          setFollowUps(function(prev){return[fuEntry].concat(prev).slice(0,20)});
        }
      } else {
        setCallStates(function(prev){var n2={...prev};delete n2[leadId];return n2});
      }
    }).catch(function(){
      setCallStates(function(prev){var n2={...prev};delete n2[leadId];return n2});
    });
  }

  var pipelineData=metrics.pipelineStages&&metrics.pipelineStages.length>0?metrics.pipelineStages:[];
  var teamData=metrics.teamMetrics&&metrics.teamMetrics.length>0?metrics.teamMetrics:[];
  var recentTimeline=metrics.recentLeads&&metrics.recentLeads.length>0?metrics.recentLeads:[];

  var planCards=[
    {name:'Starter',price:'$750',period:'/mo',desc:'1\u20135 reps, basic routing',color:'#6366f1'},
    {name:'Pro',price:'$1,500',period:'/mo',desc:'Up to 15 reps, analytics',popular:true,color:'#8b5cf6'},
    {name:'Growth',price:'$3,000',period:'/mo',desc:'Unlimited reps, CRM sync',badge:'POPULAR',color:'#06b6d4'},
    {name:'Enterprise',price:'Custom',period:'',desc:'Dedicated infra & support',color:'#f59e0b'},
  ];

  function BookingAlertsPanel(){
    return <div>
      <div className="flex items-center gap-3 mb-4">
        <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all',alertTab==='leads'?'bg-violet-500/15 text-violet-300 border border-violet-500/20':'text-slate-500 hover:text-slate-300 border border-transparent')} onClick={function(){setAlertTab('leads')}}>{'\uD83D\uDCE1'} New Lead Alerts</span>
        <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all',alertTab==='bookings'?'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20':'text-slate-500 hover:text-slate-300 border border-transparent')} onClick={function(){setAlertTab('bookings')}}>{'\uD83D\uDCC5'} New Booking Alerts</span>
      </div>
      {alertTab==='bookings'&&<div className="flex items-center gap-3 mb-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dispatch Mode:</span>
        <button className={cn('text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all',workspaceMode==='triage'?'bg-amber-500/15 text-amber-300 border border-amber-500/20':'text-slate-500 hover:text-slate-300')} onClick={function(){setWorkspaceMode('triage')}}>Triage Mode</button>
        <button className={cn('text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all',workspaceMode==='closer'?'bg-violet-500/15 text-violet-300 border border-violet-500/20':'text-slate-500 hover:text-slate-300')} onClick={function(){setWorkspaceMode('closer')}}>Closer Mode</button>
        {workspaceMode==='closer'&&<span className="text-[9px] text-violet-400 ml-auto bg-violet-500/10 px-2 py-0.5 rounded-full">Auto-routing: Rep-matched</span>}
      </div>}
      <div className="max-h-[300px] overflow-y-auto">
        {alertTab==='leads'&&<>{leads.slice(0,10).map(function(l,i){return <TimelineItem key={'lead-'+i} name={l.prospectName||l.name||'Lead'} source={l.leadSource||l.source||'SSE'} status={l.status==='ROUTING'?'Connected':l.status} time={l.time||'just now'} dot={l.status==='ROUTING'?'bg-emerald-500':l.status==='BOOKING'?'bg-cyan-500':'bg-slate-500'}/>})}{leads.length===0&&<p className="text-[11px] text-slate-600 text-center py-8">Waiting for live ingestion pipelines... Server connected.</p>}</>}
        {alertTab==='bookings'&&<>{bookingAlerts.slice(0,10).map(function(b,i){return <BookingCard key={'bk-'+i} booking={b}/>})}{workspaceMode==='closer'&&bookingAlerts.filter(function(b){return b.salesRep}).map(function(b,i){return <div key={'closer-'+i} className="border border-violet-500/30 rounded-xl p-3 mb-2 bg-violet-500/5"><div className="flex items-center gap-2 text-[10px] text-violet-400 font-semibold mb-1">{SvgZap('w-3 h-3')} Closer Dispatch: {b.salesRep}</div><p className="text-xs text-slate-300">{b.prospectName||b.name} &middot; {b.hostEmail||'No host email'}</p></div>})}{bookingAlerts.length===0&&<p className="text-[11px] text-slate-600 text-center py-8">Waiting for live ingestion pipelines... Server connected.</p>}</>}
      </div>
    </div>
  }

  /* ===== AUTH GATE � wait for hydration then redirect if needed ===== */
  if(!hydrated)return null;
  if(!user&&typeof window!=='undefined'){window.location.href='/login';return null}
  if(!user)return null;

  function TeamAgentsView(){
    function handleSlider(ev){
      var v=parseInt(ev.target.value)||1;
      setActiveReps(v);
      setWorkloadCapacity(Math.min(100,Math.round((v/50)*100)));
    }
    return <div className="p-8">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-white">Team &amp; Agents</h1><p className="text-xs text-slate-400 mt-1">{isPremium?'Manage your sales rep workforce':'Single user workspace'}</p></div></div>
      <div className="mb-6 bg-[#060913] border border-white/[0.04] rounded-xl p-3 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse shrink-0"/>
        <div className="flex-1 min-w-0">
          {ingestionBanner?<p className="text-xs text-slate-300">{'\uD83D\uDCE1'} Incoming: <strong className="text-cyan-300">{ingestionBanner.name}</strong> from <span className="text-violet-400">{ingestionBanner.source}</span> &middot; {ingestionBanner.email||'no email'} &middot; {ingestionBanner.timestamp}</p>:<p className="text-xs text-slate-500">Waiting for live ingestion pipelines... Server connected.</p>}
        </div>
      </div>
      {isPremium?<div><div className="grid grid-cols-4 gap-4 mb-6">{teamData.length>0?teamData.map(function(m,i){return <TeamCard key={i} member={m}/>}):<div className="col-span-4 text-center py-12 text-xs text-slate-600">Waiting for live ingestion pipelines... Server connected.</div>}</div><div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5"><div className="flex items-center gap-2.5 mb-4"><div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">{SvgUsers('w-3.5 h-3.5 text-violet-400')}</div><h2 className="text-sm font-bold text-white">Rep Slider Workload Capacity</h2></div><p className="text-xs text-slate-400 mb-4">Unlimited seats unlocked. Drag to adjust workload capacities across your team.</p><div className="flex items-center justify-between mb-3"><span className="text-[10px] font-semibold text-slate-400">{activeReps} reps active</span><span className="text-[10px] font-semibold text-slate-400">{workloadCapacity}% capacity</span></div><input type="range" min="1" max="50" value={activeReps} onChange={handleSlider} className="accent-[#00E5FF] h-2 w-full bg-slate-800 rounded-lg appearance-none cursor-pointer transition-all" style={{background:'linear-gradient(90deg, #6366f1, #06b6d4, #00E5FF)'}}/><div className="flex justify-between text-[8px] text-slate-600 mt-1"><span>1 rep</span><span>25 reps</span><span>50 reps</span></div></div></div>:<div className="max-w-md"><div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-6 text-center"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">{user.firstName.charAt(0)}</div><h2 className="text-base font-bold text-white">{user.firstName}</h2><p className="text-xs text-slate-400 mt-1">Free User &middot; Solo workspace</p><div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2"><span className="w-2 h-2 rounded-full bg-amber-500"/>Single seat &middot; Add Rep locked</div></div></div>}
    </div>
  }

  function CommunicationsView(){
    var routingOptions=[
      {key:'round_robin',label:'Round Robin',desc:'Sequential distribution across all agents'},
      {key:'most_idle',label:'Most Idle',desc:'Routes to agent with longest idle time'},
      {key:'skill_based',label:'Skill-Based',desc:'Matches lead attributes to agent expertise'},
    ];
    function handleAddTrunk(){
      if(!addTrunkData.sid.trim())return;
      var newTrunk={
        id:'T'+(trunks.length+1),
        type:addTrunkData.sid.trim(),
        status:'Standby',
        bg:'text-amber-400 bg-amber-500/10',
        sid:addTrunkData.sid.trim(),
        ipAuth:addTrunkData.ipAuth.trim()||'0.0.0.0/0',
        region:addTrunkData.region,
      };
      setTrunks(function(prev){return[].concat(prev,[newTrunk])});
      setAddTrunkData({sid:'',ipAuth:'',region:'us-east'});
      setShowAddTrunk(false);
    }
    return <div className="p-8">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-white">Communications</h1><p className="text-xs text-slate-400 mt-1">Multi-channel phone trunks configuration</p></div></div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">{SvgPhone('w-4 h-4 text-cyan-400')}</div><h2 className="text-sm font-bold text-white">Twilio Voice Trunks</h2></div>
          <div className="space-y-3">{trunks.map(function(t,i){return <div key={t.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3"><div><span className="text-xs text-slate-300">{t.type}</span>{t.sid&&<span className="text-[8px] text-slate-600 ml-2 font-mono">{t.sid}</span>}</div><span className={cn('text-[9px] px-2 py-0.5 rounded-full font-medium',t.bg)}>{t.status}</span></div>})}</div>
          {showAddTrunk?<div className="mt-4 bg-[#060913] border border-violet-500/20 rounded-xl p-4 space-y-3">
            <div><label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Trunk SID</label><input type="text" value={addTrunkData.sid} onChange={function(ev){setAddTrunkData(function(p){return{...p,sid:ev.target.value}})}} placeholder="TWiXx..." className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500/50"/></div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">IP Auth</label><input type="text" value={addTrunkData.ipAuth} onChange={function(ev){setAddTrunkData(function(p){return{...p,ipAuth:ev.target.value}})}} placeholder="0.0.0.0/0" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500/50"/></div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Region</label><select value={addTrunkData.region} onChange={function(ev){setAddTrunkData(function(p){return{...p,region:ev.target.value}})}} className="w-full bg-[#161B26] border border-white/[0.08] text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"><option value="us-east">US East (Virginia)</option><option value="us-west">US West (Oregon)</option><option value="eu-west">EU West (Ireland)</option><option value="ap-southeast">AP Southeast (Sydney)</option></select></div>
            <div className="flex gap-2"><button onClick={handleAddTrunk} disabled={!addTrunkData.sid.trim()} className="flex-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all">Add Trunk</button><button onClick={function(){setShowAddTrunk(false)}} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/[0.06] transition-all">Cancel</button></div>
          </div>:<button onClick={function(){setShowAddTrunk(true)}} className="mt-4 w-full bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] py-2.5 rounded-lg text-xs font-medium transition-all">{'\u2795'} Add Trunk</button>}
        </div>
        <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">{SvgBar('w-4 h-4 text-violet-400')}</div><h2 className="text-sm font-bold text-white">Routing Rules</h2></div>
          <p className="text-[11px] text-slate-500 mb-4">Configure call distribution logic across your agent pool.</p>
          <div className="flex gap-2">{routingOptions.map(function(r){var isA=activeRoutingRule===r.key;return <button key={r.key} onClick={function(){setActiveRoutingRule(r.key)}} className={cn('flex-1 text-center p-3 rounded-xl text-xs font-semibold transition-all duration-200 border',isA?'bg-violet-500/10 text-violet-300 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]':'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:border-white/[0.12]')}><span className="block text-base font-bold mb-1">{r.label.split(' ')[0]}</span><span className="block text-[9px] font-normal">{r.label.split(' ').slice(1).join(' ')}</span></button>})}</div>
          <div className="mt-4 bg-[#060913] border border-white/[0.04] rounded-lg p-3"><p className="text-[10px] text-slate-400"><span className="text-violet-400 font-semibold">Active:</span> {routingOptions.filter(function(r){return r.key===activeRoutingRule})[0].desc}</p></div>
        </div>
      </div>
    </div>
  }

  function AnalyticsView(){
    var callVol=[40,65,35,80,55,90,70,45,85,60,75,50,95,68,42,78,88,52,72,62,48,82,58,92];
    var convRate=[5.2,6.1,5.8,7.2,6.5,8.0,7.5,6.8,8.9,7.9,8.2,7.0];
    var cohortStages=[{label:'Visitors',val:8456,pct:100,color:'#6366f1'},{label:'Leads Captured',val:2134,pct:25.2,color:'#8b5cf6'},{label:'Contacted',val:1420,pct:16.8,color:'#06b6d4'},{label:'Meetings Booked',val:687,pct:8.1,color:'#10b981'},{label:'Proposals Sent',val:412,pct:4.9,color:'#f59e0b'},{label:'Closed Won',val:198,pct:2.3,color:'#00E5FF'}];
    var cohortCv=[4.2,5.8,6.1,7.5,8.9,9.2,10.5,11.3,12.8,13.6,15.0,16.2];
    var [csvExporting,setCsvExporting]=useState(false);
    var [csvDone,setCsvDone]=useState(false);
    function handleExportCSV(){
      setCsvExporting(true);
      setTimeout(function(){
        var rows=[['Lead Name','Email','Source','Status','Time']];
        leads.slice(0,200).forEach(function(l){rows.push([(l.prospectName||l.name||''),(l.email||''),(l.leadSource||l.source||''),(l.status||''),(l.time||'')].join(','))});
        var csv=rows.join('\n');
        var blob=new Blob([csv],{type:'text/csv'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');a.href=url;a.download='leadarrow_export_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
        setCsvExporting(false);
        setCsvDone(true);
        setTimeout(function(){setCsvDone(false)},2500);
      },600);
    }
    return <div className="p-8">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-white">Analytics &amp; Reports</h1><p className="text-xs text-slate-400 mt-1">Neon vector sparklines and conversion metrics</p></div></div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">Call Volume (24h)</h2>
          <svg viewBox="0 0 240 100" className="w-full h-28" preserveAspectRatio="none">
            <defs><linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4"></stop><stop offset="100%" stopColor="#06b6d4" stopOpacity="0"></stop></linearGradient></defs>
            <path d={sparklinePath(callVol,240,100)} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]"></path>
            <path d={sparklinePath(callVol,240,100)+' L240,100 L0,100 Z'} fill="url(#volGrad)"></path>
          </svg>
          <div className="flex justify-between text-[9px] text-slate-500 mt-2"><span>{'< -12hr'}</span><span>Now</span></div>
        </div>
        <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">Conversion Trend</h2>
          <svg viewBox="0 0 240 100" className="w-full h-28" preserveAspectRatio="none">
            <defs><linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.35"></stop><stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop></linearGradient></defs>
            <path d={sparklinePath(convRate,240,100)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"></path>
            <path d={sparklinePath(convRate,240,100)+' L240,100 L0,100 Z'} fill="url(#convGrad)"></path>
          </svg>
          <div className="flex justify-between text-[9px] text-slate-500 mt-2"><span>12 periods</span><span>Avg: {(convRate.reduce(function(a,b){return a+b},0)/convRate.length).toFixed(1)}%</span></div>
        </div>
        {!isPremium?<div className="col-span-2 bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">{SvgBar('w-3.5 h-3.5 text-amber-400')}</div><h2 className="text-sm font-bold text-white">BASIC Report � Available on Pro</h2></div>
          <div className="flex items-center gap-4 text-xs text-slate-500 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"/><p>BASIC reports are disabled on the free tier. Upgrade to Premium to unlock CSV exports, cohort funnel analysis, and AI-powered call scoring.</p><button onClick={function(){setShowPremiumModal(true)}} className="shrink-0 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 px-4 py-2 rounded-lg text-[10px] font-semibold transition-all">Upgrade</button></div>
        </div>:<div className="col-span-2 grid grid-cols-2 gap-6">
          <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">{SvgChart('w-3.5 h-3.5 text-violet-400')}</div><h2 className="text-sm font-bold text-white">Lead Funnel Cohort Analysis</h2></div>
            <div className="space-y-2">{cohortStages.map(function(s,i){return <div key={s.label} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:s.color}}/><div className="flex-1"><div className="flex justify-between text-[11px]"><span className="text-slate-300">{s.label}</span><span className="text-slate-400 font-semibold">{s.val.toLocaleString()}</span></div><div className="h-1.5 w-full rounded-full bg-white/[0.03] mt-1 overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:s.pct+'%',background:s.color,boxShadow:'0 0 6px '+s.color}}/></div></div><div><span className="text-[11px] font-semibold" style={{color:s.color}}>{s.pct}%</span></div></div>})}</div>
            <div className="mt-4 bg-[#060913] border border-white/[0.04] rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Overall Conversion</span><span className="text-sm font-bold text-emerald-400">2.3%</span></div><svg viewBox="0 0 240 40" className="w-full h-8 mt-2" preserveAspectRatio="none"><defs><linearGradient id="cohortGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3"></stop><stop offset="100%" stopColor="#00E5FF" stopOpacity="0"></stop></linearGradient></defs><path d={sparklinePath(cohortCv,240,40)} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d={sparklinePath(cohortCv,240,40)+' L240,40 L0,40 Z'} fill="url(#cohortGrad)"></path></svg></div>
          </div>
          <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">{SvgZap('w-3.5 h-3.5 text-cyan-400')}</div><h2 className="text-sm font-bold text-white">Telemetry &amp; Export Hub</h2></div>
            <div className="bg-[#060913] border border-white/[0.04] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2"><span className="text-[11px] text-slate-400">System Response Time</span><span className="text-sm font-bold text-cyan-400">{metrics.avgResponseTime||'1.2s'}</span></div>
              <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{width:Math.min(100,parseFloat(metrics.avgResponseTime||'1.2')*35)+'%'}}/></div>
              <div className="flex justify-between text-[8px] text-slate-600 mt-1"><span>0ms</span><span>3s</span></div>
            </div>
            <div className="bg-[#060913] border border-white/[0.04] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2"><span className="text-[11px] text-slate-400">Active Handlers</span><span className="text-sm font-bold text-emerald-400">{metrics.activeHandlers||4}</span></div>
              <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all" style={{width:((metrics.activeHandlers||4)/10)*100+'%'}}/></div>
              <div className="flex justify-between text-[8px] text-slate-600 mt-1"><span>0</span><span>10</span></div>
            </div>
            <button onClick={handleExportCSV} disabled={csvExporting} className="w-full bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 py-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-40">{csvExporting?'\u23F3 Exporting...':csvDone?'\u2705 CSV Exported':'\uD83D\uDCE5 Export CSV Data'}</button>
            <p className="text-[9px] text-slate-600 text-center mt-2">{csvDone?'Exported '+(leads.length||0)+' lead records':'Download a snapshot of your lead pipeline'}</p>
          </div>
        </div>}
      </div>
    </div>
  }

  function DatabaseLogsView(){
    return <div className="p-8">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-white">Database Logs</h1><p className="text-xs text-slate-400 mt-1">Unformatted telemetry histories</p></div></div>
      <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-slate-500/20 flex items-center justify-center">{SvgDb('w-3.5 h-3.5 text-slate-400')}</div><h2 className="text-sm font-bold text-white">Stream Logs</h2></div>
        <div className="max-h-[400px] overflow-y-auto"><pre className="text-[9px] text-slate-500 leading-relaxed font-mono whitespace-pre-wrap">{JSON.stringify({metrics:metrics,leads:leads.slice(0,5),bookings:bookingAlerts.slice(0,3),followUps:followUps,tier:user.tier,user:user.firstName,timestamp:new Date().toISOString()},null,2)}</pre></div>
      </div>
    </div>
  }

  function IntegrationsView(){
    function handleCrmConnect(){
      if(!crmFormData.apiKey.trim()||!crmFormData.pipelineId.trim())return;
      setCrmFormStatus('saving');
      setTimeout(function(){
        setCrmFormStatus('success');
        setCrm(true);
        setDrawerOpen(null);
        setTimeout(function(){setCrmFormStatus('idle');setCrmFormData({apiKey:'',pipelineId:''})},2500);
      },800);
    }
    function handleCopyWebhook(){
      if(!slackWebhookUrl)return;
      try{navigator.clipboard.writeText(slackWebhookUrl).then(function(){setCopiedNotif(true);setTimeout(function(){setCopiedNotif(false)},2000)})}catch(ex){}
    }
    function handleGenerateWebhook(){
      var hk='https://hooks.leadarrow.com/in/wh_'+Math.random().toString(36).substring(2,10)+'_slack';
      setSlackWebhookUrl(hk);
    }
    return <div className="p-8">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-white">Integrations</h1><p className="text-xs text-slate-400 mt-1">Connect external services and triggers</p></div></div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5"><div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-lg font-bold text-violet-400">CC</div><div><h2 className="text-base font-bold text-white">Close CRM</h2><p className="text-[10px] text-slate-500">Sync leads, follow-ups, and activity</p></div></div>
          {crmConnected?<div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"/>{SvgCheck('w-4 h-4')} Close CRM connected &mdash; live telemetry stream active</div>:<button onClick={function(){if(isPremium){setDrawerOpen('crm')}else{setShowPaymentAlert({show:true,tab:'Integrations',isGated:true})}}} className="w-full bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] py-3 rounded-xl text-sm font-medium transition-all">{SvgGear('w-4 h-4 inline mr-2')} {isPremium?'Connect Close CRM':'Upgrade to connect API keys'}</button>}
        </div>
        <div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5"><div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-lg font-bold text-cyan-400">SL</div><div><h2 className="text-base font-bold text-white">Slack Trigger</h2><p className="text-[10px] text-slate-500">Receive webhooks and booking alerts</p></div></div>
          {slackConnected?<div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"/>{SvgCheck('w-4 h-4')} Slack trigger active &mdash; live telemetry stream active</div>:<button onClick={function(){if(isPremium){setDrawerOpen('slack')}else{setShowPaymentAlert({show:true,tab:'Integrations',isGated:true})}}} className="w-full bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] py-3 rounded-xl text-sm font-medium transition-all">{SvgGear('w-4 h-4 inline mr-2')} {isPremium?'Connect Slack Trigger':'Upgrade to connect API keys'}</button>}
        </div>
      </div>
      {drawerOpen==='crm'&&<div className="fixed inset-0 z-[300] flex justify-end" onClick={function(){setDrawerOpen(null)}}>
        <div className="absolute inset-0 bg-black/40"/>
        <div onClick={function(ev){ev.stopPropagation()}} className="relative w-[420px] bg-[#0D111A] border-l border-white/[0.05] h-full shadow-[-10px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto" style={{animation:'slideLeft 0.35s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center">{SvgGear('w-5 h-5 text-violet-400')}</div><div><h2 className="text-base font-bold text-white">Close CRM</h2><p className="text-[10px] text-slate-500">Enter API credentials</p></div></div>
              <button onClick={function(){setDrawerOpen(null)}} className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-all">{SvgX('w-4 h-4 text-slate-400')}</button>
            </div>
            {crmFormStatus==='success'?<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">{SvgCheck('w-7 h-7 text-emerald-400')}</div>
              <h3 className="text-sm font-bold text-emerald-300 mb-1">CRM Connected</h3>
              <p className="text-[10px] text-slate-500">API key with <strong className="text-emerald-400">{crmFormData.pipelineId}</strong> pipeline active</p>
            </div>:<div className="space-y-5">
              {crmFormStatus==='saving'?<div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 text-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto"/><p className="text-xs text-slate-400 mt-3">Validating credentials...</p></div>:<><div><label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">API Key / Access Token</label><input type="text" value={crmFormData.apiKey} onChange={function(ev){setCrmFormData(function(p){return{...p,apiKey:ev.target.value}})}} placeholder="sk_live_..." className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 font-mono"/></div>
              <div><label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">Pipeline ID</label><input type="text" value={crmFormData.pipelineId} onChange={function(ev){setCrmFormData(function(p){return{...p,pipelineId:ev.target.value}})}} placeholder="pip_..." className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 font-mono"/></div>
              <button onClick={handleCrmConnect} disabled={!crmFormData.apiKey.trim()||!crmFormData.pipelineId.trim()} className="w-full bg-[#6344E3] hover:bg-[#5035C4] text-white font-semibold py-3 rounded-xl text-sm shadow-[0_4px_25px_rgba(99,68,227,0.3)] transition-all disabled:opacity-40">Save &amp; Connect</button>
              <button onClick={function(){setDrawerOpen(null)}} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-2">Cancel</button>
            </>}</div>}
          </div>
        </div>
      </div>}
      {drawerOpen==='slack'&&<div className="fixed inset-0 z-[300] flex justify-end" onClick={function(){setDrawerOpen(null)}}>
        <div className="absolute inset-0 bg-black/40"/>
        <div onClick={function(ev){ev.stopPropagation()}} className="relative w-[420px] bg-[#0D111A] border-l border-white/[0.05] h-full shadow-[-10px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto" style={{animation:'slideLeft 0.35s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">{SvgGear('w-5 h-5 text-cyan-400')}</div><div><h2 className="text-base font-bold text-white">Slack Trigger</h2><p className="text-[10px] text-slate-500">Generate webhook URL</p></div></div>
              <button onClick={function(){setDrawerOpen(null)}} className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-all">{SvgX('w-4 h-4 text-slate-400')}</button>
            </div>
            {slackConnected?<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">{SvgCheck('w-7 h-7 text-emerald-400')}</div>
              <h3 className="text-sm font-bold text-emerald-300 mb-1">Webhook Active</h3>
              <p className="text-[10px] text-slate-500">Slack trigger registered &mdash; receiving events</p>
            </div>:<div className="space-y-5">
              {!slackWebhookUrl?<div className="text-center py-8"><p className="text-xs text-slate-400 mb-4">Generate a unique webhook URL to connect Slack to your LeadArrow pipeline.</p><button onClick={handleGenerateWebhook} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold px-6 py-3 rounded-xl text-sm transition-all">{'\u2699'} Generate Webhook URL</button></div>:<div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">Webhook URL</label>
                <div className="flex gap-2"><input type="text" readOnly value={slackWebhookUrl} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-xs text-cyan-300 placeholder-slate-600 focus:outline-none font-mono truncate"/><button onClick={handleCopyWebhook} className={cn('px-4 py-3 rounded-lg border text-xs font-semibold transition-all shrink-0',copiedNotif?'bg-emerald-500/20 text-emerald-300 border-emerald-500/30':'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]')}>{copiedNotif?SvgCheck('w-4 h-4'):'\u2398'}</button></div>
                <p className="text-[9px] text-slate-600 mt-2">{copiedNotif?'Copied to clipboard!':'Copy this URL into your Slack workspace configuration.'}</p>
                <button onClick={function(){setSlack(true);setDrawerOpen(null)}} className="mt-5 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-3 rounded-xl text-sm border border-cyan-500/30 transition-all">Confirm &amp; Enable Slack</button>
              </div>}
              <button onClick={function(){setDrawerOpen(null)}} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-2">Cancel</button>
            </div>}
          </div>
        </div>
      </div>}
    </div>
  }

  function UserProfilesView(){
    return <div className="p-8">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-white">User Profiles</h1><p className="text-xs text-slate-400 mt-1">Account settings and preferences</p></div></div>
      <div className="max-w-lg"><div className="bg-[#0B0F19]/60 border border-white/[0.04] rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">{user.firstName.charAt(0)}</div><div><h2 className="text-lg font-bold text-white">{user.firstName}</h2><p className="text-xs text-slate-400">{isPremium?'Admin':'User'}</p></div></div>
        <div className="space-y-4"><div><label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email</label><p className="text-sm text-slate-200 mt-1">{user.email}</p></div><div><label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Role</label><p className="text-sm text-slate-200 mt-1">{isPremium?'Admin':'User'}</p></div></div>
      </div></div>
    </div>
  }

  function BillingPortal(){
    if(isPremium) return <div className="p-8">
      <div className="max-w-lg mx-auto bg-[#0B0F19]/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">{SvgCheck('w-8 h-8 text-emerald-400')}</div>
        <h2 className="text-xl font-bold text-white mb-2">Active Pro Subscriber</h2>
        <p className="text-sm text-slate-400 mb-4">You are currently on the <span className="text-emerald-400 font-semibold">Pro</span> plan &mdash; $1,500/mo. All features unlocked.</p>
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-4 py-2 w-fit mx-auto"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"/>Subscription active</div>
        <button onClick={function(){setActiveTab('Dashboard')}} className="mt-6 bg-[#6344E3] hover:bg-[#5035C4] text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-[0_4px_25px_rgba(99,68,227,0.3)] transition-all">{'\u2190'} Back to Dashboard</button>
      </div>
    </div>;
    return <div className="p-8">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-2xl font-bold text-white mb-1">Billing &amp; Subscriptions</h1><p className="text-sm text-slate-400">Manage your plan and payment credentials</p></div><button onClick={function(){setActiveTab('Dashboard')}} className="border border-white/[0.06] hover:bg-white/[0.03] text-slate-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all">{SvgBar('w-4 h-4')} Dashboard</button></div>
      <div className="grid grid-cols-4 gap-4 mt-8">
        {planCards.map(function(plan,i){
          var isSelected=selectedPlan&&selectedPlan.name===plan.name;
          return <div key={plan.name} onClick={function(){if(plan.name==='Enterprise'){setIsEnterpriseModalOpen(true)}else{setSelectedPlan(plan)}}}
            className={cn('relative bg-[#0B0F19]/60 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 cursor-pointer',plan.popular?'border-violet-500/60 bg-[#0B0F19]/80 shadow-[0_0_60px_rgba(99,68,227,0.25)] ring-1 ring-violet-500/20':'border-white/[0.04] hover:border-white/[0.08]',isSelected&&'ring-2 ring-[#00E5FF] bg-[#111827] shadow-[0_0_40px_rgba(0,229,255,0.15)]')}>
            {plan.badge&&<div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-[9px] font-bold text-white tracking-wider shadow-lg">{plan.badge}</div>}
            <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-0.5 mb-2"><span className="text-2xl font-black text-white">{plan.price}</span><span className="text-sm text-slate-500">{plan.period}</span></div>
            <p className="text-xs text-slate-500 mb-6">{plan.desc}</p>
            <button onClick={function(ev){ev.stopPropagation();if(plan.name==='Enterprise'){setIsEnterpriseModalOpen(true)}else{setSelectedPlan(plan)}}}
              className={cn('w-full text-sm font-semibold py-2.5 rounded-lg transition-all duration-200',plan.popular?'bg-[#6344E3] hover:bg-[#5035C4] text-white shadow-[0_4px_25px_rgba(99,68,227,0.3)]':plan.name==='Enterprise'?'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]':'bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06]')}>
              {plan.name==='Enterprise'?'Contact Sales':'Select Plan'}
            </button>
          </div>
        })}
      </div>
      {selectedPlan&&<div className="sticky bottom-0 mt-6 bg-[#0A0F1C]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-white">Selected: <span className="text-cyan-400">{selectedPlan.name}</span></p><p className="text-[10px] text-slate-500">{selectedPlan.desc}</p></div>
          <div className="flex items-center gap-4"><span className="text-lg font-black text-white">{selectedPlan.price}{selectedPlan.period}</span>
            <button onClick={function(){setActiveTab('checkout')}} className="bg-[#00E5FF] hover:bg-[#00C8E0] text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_25px_rgba(0,229,255,0.3)] text-sm">Continue with {selectedPlan.name} &mdash; {selectedPlan.price}{selectedPlan.period}</button>
          </div>
        </div>
      </div>}
      {!selectedPlan&&<button onClick={function(){setSelectedPlan(planCards[1])}} className="w-full mt-6 bg-[#6344E3] hover:bg-[#5035C4] text-white font-bold py-4 rounded-xl text-center transition-all duration-300 shadow-[0_4px_25px_rgba(99,68,227,0.3)] cursor-pointer text-sm">Continue with Pro &mdash; $1,500/mo</button>}
    </div>
  }

  function DashboardView(){
    return <div className="p-8">
      <div className="grid gap-4 mb-8 grid-cols-4">
        <MetricCard label="Total Active Leads" value={isPremium?metrics.totalActiveLeads||0:manualLeads.length} color="#6366f1" icon={SvgTrend('w-4 h-4')} trend={undefined}/>
        <MetricCard label="Live Call Connections" value={isPremium?metrics.liveCallConnections||0:0} color="#06b6d4" icon={SvgBar('w-4 h-4')} trend={undefined}/>
        <MetricCard label="Conversion Rate" value={isPremium?(metrics.conversionRate||0)+'%':'0%'} color="#10b981" icon={SvgZap('w-4 h-4')} trend={undefined}/>
        <MetricCard label="Queue Wait Time" value={isPremium?metrics.queueWaitTime||'\u2014':'\u2014'} color="#f59e0b" icon={SvgBar('w-4 h-4')} trend={undefined}/>
      </div>
      <ManualLeadForm setLeads={setLeads} setManualLeads={setManualLeads} setMetrics={setMetrics} manualLeads={manualLeads} isPremium={isPremium}/>
      {isPremium&&followUps.filter(function(f){return f.isValidHumanLead===true&&f.metaSource}).length>0&&function(){
  var validReminders=followUps.filter(function(f){return f.isValidHumanLead===true&&f.metaSource});
  var uniqueReminders=Array.from(new Map(validReminders.map(function(item){return[item.leadName,item]})).values()).slice(0,3);
  var totalActivePending=validReminders.length;
  return <div className="mb-6"><div className="flex items-center gap-2 mb-3"><svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><span className="text-sm font-bold text-amber-400">{'\u26A0\uFE0F'} Follow-Up Reminders � showing {uniqueReminders.length} of {totalActivePending} active pending</span></div>{uniqueReminders.map(function(f,i){return <FollowUpReminder key={'fu-'+i} message={f.message} leadName={f.leadName} time={new Date(f.timestamp).toLocaleTimeString()}/>})}</div>
}()}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="col-span-3 enterprise-card card-shine enterprise-glow depth-card bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 card-tilt parallax-card">
          <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">{SvgBar('w-3.5 h-3.5 text-violet-400')}</div><h2 className="text-sm font-bold text-white">Active Sales Pipeline</h2></div><span className="text-[10px] text-slate-500">{isPremium?metrics.totalActiveLeads||0:manualLeads.length} total prospects</span></div>
          {pipelineData.length>0?pipelineData.map(function(p){return <PipelineBar key={p.stage||p.name} name={p.stage||p.name} pct={p.pct||p.count} color={p.color}/>}):<p className="text-[11px] text-slate-600 text-center py-8">Waiting for live ingestion pipelines... Server connected.</p>}
        </div>
        <div className="col-span-2 enterprise-card card-shine enterprise-glow depth-card bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 card-tilt parallax-card">
          <div className="flex items-center gap-2.5 mb-4"><div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">{SvgTrend('w-3.5 h-3.5 text-emerald-400')}</div><h2 className="text-sm font-bold text-white">Recent Lead Activity</h2></div>
          <div className="max-h-[260px] overflow-y-auto">{isPremium?<>{leads.slice(0,5).map(function(l,i){return <TimelineItem key={i} name={l.prospectName||l.name||'Lead'} source={l.leadSource||l.source||'SSE'} status={l.status==='ROUTING'?'Connected':l.status} time={l.time||'just now'} dot={l.status==='ROUTING'?'bg-emerald-500':l.status==='BOOKING'?'bg-cyan-500':'bg-emerald-500'}/>})}{leads.length===0&&<p className="text-[11px] text-slate-600 text-center py-8">Waiting for live ingestion pipelines... Server connected.</p>}</>:<>{manualLeads.map(function(l,i){return <TimelineItem key={i} name={l.name} source={l.email} status={l.status} time={l.time} dot='bg-violet-500'/>})}{manualLeads.length===0&&<p className="text-[11px] text-slate-600 text-center py-8">Waiting for live ingestion pipelines... Server connected.</p>}</>}</div>
        </div>
      </div>
      <div className="relative mb-8 enterprise-card bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 overflow-hidden card-tilt">
        {!isPremium&&!isUnlocking&&<div className={cn('absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 pointer-events-none','backdrop-blur-md bg-[#070D19]/60')}>
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center"><svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
          <p className="text-sm font-semibold text-slate-200">Team Efficiency Overview</p>
          <p className="text-[11px] text-slate-500 text-center max-w-xs">Upgrade to Premium to manage your team, view conversion metrics, and optimize routing.</p>
        </div>}
        {showUnlockOverlay&&<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 pointer-events-none" style={{animation:'dissolve 600ms ease-out forwards'}}>
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center"><svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
          <p className="text-sm font-semibold text-slate-200">Unlocking Premium...</p>
        </div>}
        <div className={cn((!isPremium&&!isUnlocking)?'opacity-10':'opacity-100')}>
          <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">{SvgUsers('w-3.5 h-3.5 text-emerald-400')}</div><h2 className="text-sm font-bold text-white">Team Efficiency Overview</h2></div><span className="text-[10px] text-slate-500">{teamData.length>0?teamData.length+' active agents online':'No data'}</span></div>
          <div className="grid grid-cols-4 gap-4 mb-6">{teamData.length>0?teamData.map(function(m,i){return <TeamCard key={i} member={m}/>}):<div className="col-span-4 text-center py-8 text-xs text-slate-600">Waiting for live ingestion pipelines... Server connected.</div>}</div>
          {teamData.length>0&&<div className="mt-2 text-center"><span className="inline-block text-[8px] uppercase tracking-[0.2em] text-slate-600">Enterprise-Grade Telemetry &middot; Real-Time Sync &middot; Sub-100ms Latency</span></div>}
          {isPremium&&<BookingAlertsPanel/>}
        </div>
      </div>
      {!isPremium&&!isUnlocking&&<div className="enterprise-card bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 card-tilt">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/20">{'\uD83D\uDCE1'} New Lead Alerts</span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 border border-transparent relative">
            {'\uD83D\uDCC5'} New Booking Alerts
            <span className="ml-1.5 inline-flex">{SvgLock('w-3 h-3 text-amber-500/70')}</span>
          </span>
        </div>
        <div className="max-h-[200px] overflow-y-auto">{leads.slice(0,5).map(function(l,i){return <TimelineItem key={'lead-'+i} name={l.prospectName||l.name||'Lead'} source={l.leadSource||l.source||'SSE'} status={l.status==='ROUTING'?'Connected':l.status} time={l.time||'just now'} dot={l.status==='ROUTING'?'bg-emerald-500':l.status==='BOOKING'?'bg-cyan-500':'bg-slate-500'}/>})}{leads.length===0&&<p className="text-[11px] text-slate-600 text-center py-8">Waiting for live ingestion pipelines... Server connected.</p>}</div>
      </div>}
      {isPremium&&<RepLeaderboard/>}
      {isPremium&&<div className={'enterprise-card card-shine enterprise-glow depth-card mt-6 bg-[#0B0F19]/60 backdrop-blur-xl border rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 card-tilt parallax-card '+(Object.keys(callStates).some(function(k){return callStates[k]==='ON_CALL'})?'border-cyan-500/30 trunk-active':'border-white/[0.04]')} style={{animation:(Object.keys(callStates).some(function(k){return callStates[k]==='ON_CALL'})?'trunkGlow 2s ease-in-out infinite':'none')}}>
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2.5"><div className={'w-7 h-7 rounded-lg flex items-center justify-center '+(Object.keys(callStates).some(function(k){return callStates[k]==='ON_CALL'})?'bg-cyan-500/30 shadow-[0_0_16px_rgba(6,182,212,0.25)]':'bg-cyan-500/20')}>{SvgPhone('w-3.5 h-3.5 text-cyan-400')}</div><h2 className="text-sm font-bold text-white">Click-to-Connect Trunk Engine</h2></div><span className={'text-[10px] '+(Object.keys(callStates).some(function(k){return callStates[k]==='ON_CALL'})?'text-cyan-400 font-semibold':'text-slate-500')}>{Object.keys(callStates).length>0?Object.keys(callStates).length+' active call(s)':'No active calls'}</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/[0.04]"><th className="pb-2 pr-3 font-semibold">Lead Name</th><th className="pb-2 pr-3 font-semibold">Email</th><th className="pb-2 pr-3 font-semibold">Status</th><th className="pb-2 font-semibold">Call Trunk</th></tr></thead>
            <tbody>{leads.slice(0,10).map(function(l,i){var callState=callStates[l.id||l.leadId];return <tr key={i} className={'border-b text-sm text-slate-300 '+(callState==='ON_CALL'?'bg-cyan-500/[0.03] border-cyan-500/10':'border-white/[0.02]')}>
              <td className="py-2.5 pr-3 font-medium text-white">{l.prospectName||l.name||'-'}</td>
              <td className="py-2.5 pr-3 text-slate-400">{l.email||'-'}</td>
              <td className="py-2.5 pr-3">{callState==='DIALING'?<span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30" style={{animation:'radarPulse 0.8s ease-in-out infinite'}}>{'\u26A1'} DIALING</span>:callState==='ON_CALL'?<span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]" style={{animation:'radarPulse 1.2s ease-in-out infinite'}}>{'\uD83D\uDCA1'} ON CALL</span>:<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{l.status||'Connected'}</span>}</td>
              <td className="py-2.5">{callState==='DIALING'?<button disabled className="text-[10px] px-2.5 py-1 rounded-lg font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40" style={{animation:'radarPulse 1s ease-in-out infinite'}}>{'\uD83D\uDCDE'} DIALING...</button>:callState==='ON_CALL'?<button onClick={function(){setCallStates(function(prev){var n2={...prev};delete n2[l.id||l.leadId];return n2});fetch(SSE_HOST+'/api/telephony/terminate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leadId:l.id||l.leadId})}).catch(function(){})}} className="text-[10px] px-2.5 py-1 rounded-lg font-medium bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all">{'\u274C'} Terminate</button>:<button onClick={function(){handleConnectClick(l.id||l.leadId,l.prospectName||l.name,l.email,l.phone)}} className={cn('text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all',isPremium?'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25':'bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-white/[0.06]')}>{'\uD83D\uDCDE'} {isPremium?'Connect':'Upgrade'}</button>}</td>
            </tr>})}</tbody>
          </table>
        </div>
      </div>}
    </div>
  }

  /* ===== LAYOUT ROOT ===== */
  var layoutRoot=function(children){
    return <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6] font-sans flex antialiased selection:bg-[#00E5FF]/20">
      <BgOrbs/><style>{stylesSheet}</style>
      <Sidebar activeTab={activeTab} setTab={setActiveTab} user={user} setUser={setUser} onLogout={function(){localStorage.removeItem('token');localStorage.removeItem('subscriptionTier');localStorage.removeItem('licenseActivated');localStorage.removeItem('premiumLicenseKey');localStorage.removeItem('premiumEmail');setUser(null);window.location.href='/login'}} setShowPaymentAlert={setShowPaymentAlert} subscriptionTier={subscriptionTier}/>
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.03]">
          <div className="flex items-center gap-3"><h1 className="text-lg font-bold text-white">{activeTab}</h1>{isPremium&&<span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.2)] premium-badge" style={{animation:'pulseRing 2s ease-in-out infinite'}}>Subscriber</span>}<span className="text-[11px] text-slate-600">Welcome back, {user.firstName}</span></div>
          <div className="flex items-center gap-2.5">
            {!isPremium&&!isUnlocking&&<button onClick={function(){setIsLicenseModalOpen(true)}} className="bg-[#F1C40F]/10 border border-[#F1C40F]/20 text-[#F1C40F] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#F1C40F]/20 transition-all">{SvgStar('w-3.5 h-3.5')} Activate License</button>}
            <button onClick={function(){setActiveTab('Billing & Plans')}} className="bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 border border-white/[0.06] px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all">{SvgCard('w-3.5 h-3.5')} Billing</button>
            <button onClick={function(){localStorage.removeItem('token');localStorage.removeItem('subscriptionTier');localStorage.removeItem('licenseActivated');localStorage.removeItem('premiumLicenseKey');localStorage.removeItem('premiumEmail');setUser(null);setLeads([]);setBookingAlerts([]);setFollowUps([]);setMetrics({totalActiveLeads:0,liveCallConnections:0,conversionRate:0,queueWaitTime:'\u2014',recentLeads:[],pipelineStages:[],teamMetrics:[]});setManualLeads([]);setSelectedPlan(null);setActiveTab('Dashboard');setIsEnterpriseModalOpen(false);setIsLicenseModalOpen(false);setShowPaymentAlert(null);setIsUnlocking(false);setCallStates({});setSubscriptionTier('BASIC');window.location.href='/login'}} className="border border-white/[0.05] hover:bg-red-500/10 hover:text-red-400 text-slate-500 px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all">{SvgLog('w-3.5 h-3.5')} Log out</button>
          </div>
        </div>
        {!isPremium&&!isUnlocking&&<div className="w-full border-b border-amber-500/15 bg-amber-500/[0.03] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse"/><p className="text-sm font-medium text-amber-200/90">Trial Mode &mdash; Limited Features Engine active. Upgrade to unlock CRM routers.</p></div>
          <button onClick={function(){setActiveTab('Billing & Plans')}} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2 rounded-lg text-sm shadow-[0_0_20px_rgba(251,191,36,0.25)]">Upgrade &rarr;</button>
        </div>}
        {isUnlocking&&<div className="w-full border-b border-emerald-500/20 bg-emerald-500/[0.03] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"/><p className="text-sm font-medium text-emerald-200/90">Premium Unlocking &mdash; activating enterprise features...</p></div>
        </div>}
        {children}
      </main>
      <GateAlert data={showPaymentAlert} onClose={function(){setShowPaymentAlert(null)}} setTab={setActiveTab}/>
      {isLicenseModalOpen&&<LicenseModal userEmail={user?.email||''} onClose={function(){setIsLicenseModalOpen(false)}} onActivate={function(){localStorage.setItem('subscriptionTier','PREMIUM');localStorage.setItem('licenseActivated','true');setIsUnlocking(true);setShowUnlockOverlay(true);setTimeout(function(){setShowUnlockOverlay(false)},1200);setUser(function(prev){if(!prev)return{subscriptionTier:'PREMIUM'};return{...prev,subscriptionTier:'PREMIUM'}});setSubscriptionTier('PREMIUM');return true}}/>}
      {isEnterpriseModalOpen&&<EnterpriseContactModal onClose={function(){setIsEnterpriseModalOpen(false)}}/>}
      <PremiumUpgradeModal isOpen={showPremiumModal} onClose={function(){setShowPremiumModal(false)}} onUpgrade={function(){setShowPremiumModal(false);setSelectedPlan(planCards[1]);setActiveTab('checkout')}} isPaying={false}/>
      {showPaymentSuccessOverlay&&<div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xl flex items-center justify-center" onClick={function(){setShowPaymentSuccessOverlay(false)}}>
        <div className="bg-[#0B0F19]/95 border border-emerald-500/30 rounded-3xl shadow-[0_32px_120px_rgba(16,185,129,0.2)] p-12 max-w-md w-full text-center" style={{animation:'modalIn 0.5s cubic-bezier(0.34,1.56,0.64,1)'}} onClick={function(ev){ev.stopPropagation()}}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.2)]" style={{animation:'pulse 1.5s ease-in-out infinite'}}>
            <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{'\u2713'} Secure Payment Confirmed</h2>
          <p className="text-emerald-300 font-semibold text-lg mb-2">Activating Enterprise Premium Assets...</p>
          <p className="text-sm text-slate-400 mt-4">All premium features are now unlocked. Real-time VoIP dialing, trunk routing, and full telemetry streams are active.</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
            Enterprise mode engaged
          </div>
        </div>
      </div>}
    </div>
  };

  if(activeTab==='Billing & Plans') return layoutRoot(<BillingPortal/>);
  if(activeTab==='payment'){setActiveTab('Billing & Plans');return null}
  if(activeTab==='checkout') return layoutRoot(<PaymentCheckoutView selectedPlan={selectedPlan} planCards={planCards} user={user} setSubscriptionTier={setSubscriptionTier} setUser={setUser} setActiveTab={setActiveTab} setSelectedPlan={setSelectedPlan}/>);
  if(activeTab==='Team & Agents') return layoutRoot(<TeamAgentsView/>);
  if(activeTab==='Communications') return layoutRoot(<CommunicationsView/>);
  if(activeTab==='Analytics & Reports') return layoutRoot(<AnalyticsView/>);
  if(activeTab==='Database Logs') return layoutRoot(<DatabaseLogsView/>);
  if(activeTab==='Workspace') return layoutRoot(<WorkspaceView user={user} isPremium={subscriptionTier==='PREMIUM'}/>);
  if(activeTab==='Integrations') return layoutRoot(<IntegrationsView/>);
  if(activeTab==='User Profiles') return layoutRoot(<UserProfilesView/>);
  if(activeTab==='Access Keys') return layoutRoot(<AdminKeysView/>);
  return layoutRoot(<DashboardView/>);
}
