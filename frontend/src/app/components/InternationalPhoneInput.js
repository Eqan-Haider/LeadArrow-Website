'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import GLOBAL_COUNTRIES from '../data/GLOBAL_COUNTRIES';

function SvgChevronDown(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>}
function SvgSearch(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
function SvgLock(c){return <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}

function cn(){var a=[];for(var i=0;i<arguments.length;i++){if(arguments[i])a.push(arguments[i])}return a.join(' ')}

var COUNTRY_DIGITS={AF:9,AL:9,DZ:9,AD:6,AO:9,AR:10,AM:8,AW:7,AU:9,AT:11,AZ:9,BS:10,BH:8,BD:10,BB:10,BY:9,BE:9,BZ:7,BJ:8,BT:8,BO:8,BA:8,BW:7,BR:11,BN:7,BG:9,BF:8,BI:8,KH:9,CM:9,CA:10,CV:7,CF:8,TD:8,CL:9,CN:11,CO:10,KM:7,CG:8,CD:8,CR:8,CI:8,HR:9,CU:8,CZ:9,DK:8,DJ:8,DO:10,EC:9,EG:10,SV:8,GQ:9,ER:8,EE:8,SZ:8,ET:9,FJ:7,FI:10,FR:9,GA:8,GM:7,GE:9,DE:11,GH:9,GR:10,GL:6,GD:10,GT:8,GN:8,GW:7,GY:7,HT:8,HN:8,HK:8,HU:9,IS:7,IN:10,ID:11,IR:10,IQ:10,IE:9,IL:9,IT:10,JM:10,JP:10,JE:9,JO:9,KZ:10,KE:9,KI:8,KP:8,KR:10,KW:8,KG:9,LA:8,LV:8,LB:8,LS:8,LR:7,LY:9,LI:7,LT:8,LU:9,MO:8,MG:9,MW:9,MY:10,MV:7,ML:8,MT:8,MH:7,MR:8,MU:8,MX:10,FM:7,MD:8,MC:9,MN:8,ME:8,MA:9,MZ:9,MM:8,NA:8,NR:7,NP:10,NL:9,NC:6,NZ:9,NI:8,NE:8,NG:8,MK:8,NO:8,PW:7,PS:9,PA:8,PG:8,PY:9,PE:9,PH:10,PL:9,PT:9,QA:8,RO:10,RU:10,RW:9,KN:10,LC:10,VC:10,WS:7,SM:10,ST:8,SA:9,SN:9,RS:9,SC:7,SL:8,SG:8,SK:9,SI:9,SB:7,SO:8,ZA:9,SS:9,ES:9,LK:10,SD:9,SR:7,SE:9,CH:9,SY:9,TW:10,TJ:9,TZ:9,TH:9,TL:8,TG:8,TO:7,TT:10,TN:8,TR:10,TM:8,TV:5,UG:9,UA:9,AE:9,GB:10,US:10,UY:9,UZ:9,VU:7,VE:10,VN:10,YE:9,ZM:9,ZW:9};

export default function InternationalPhoneInput(p){
  var value=p.value||'';var onChange=p.onChange;var disabled=p.disabled||false;var isPremium=p.isPremium||false;var error=p.error||'';var label=p.label||'Phone';
  var dS=useState(false);var dropdownOpen=dS[0];var setDropdownOpen=dS[1];
  var sS=useState('');var searchQuery=sS[0];var setSearchQuery=sS[1];
  var pS=useState({top:0,left:0,width:280,dropUp:false});var ddPos=pS[0];var setDdPos=pS[1];
  var dd=useRef(null);
  var si=useRef(null);
  var bt=useRef(null);
  var pd=useRef(null);

  function getDefaultCountry(){
    var v=value||'';
    if(v.startsWith('+92'))return GLOBAL_COUNTRIES.filter(function(c){return c.code==='PK'})[0]||GLOBAL_COUNTRIES[0];
    if(v.startsWith('+1'))return GLOBAL_COUNTRIES.filter(function(c){return c.code==='US'})[0]||GLOBAL_COUNTRIES[0];
    if(v.startsWith('+44'))return GLOBAL_COUNTRIES.filter(function(c){return c.code==='GB'})[0]||GLOBAL_COUNTRIES[0];
    for(var i=0;i<GLOBAL_COUNTRIES.length;i++){if(v.startsWith(GLOBAL_COUNTRIES[i].prefix))return GLOBAL_COUNTRIES[i]}
    var us=GLOBAL_COUNTRIES.filter(function(c){return c.code==='US'});
    return us[0]||GLOBAL_COUNTRIES[0];
  }
  var dC=useState(getDefaultCountry());var selectedCountry=dC[0];var setSelectedCountry=dC[1];

  function getDisplayNumber(){
    var v=value||'';
    for(var i=0;i<GLOBAL_COUNTRIES.length;i++){
      if(v.startsWith(GLOBAL_COUNTRIES[i].prefix)){return v.slice(GLOBAL_COUNTRIES[i].prefix.length)}
    }
    return v;
  }

  function filteredCountries(){
    if(!searchQuery.trim())return GLOBAL_COUNTRIES;
    var q=searchQuery.trim().toLowerCase();
    return GLOBAL_COUNTRIES.filter(function(c){
      return c.name.toLowerCase().indexOf(q)!==-1||c.code.toLowerCase().indexOf(q)!==-1||c.prefix.indexOf(q)!==-1;
    });
  }

  function selectCountry(c){
    setSelectedCountry(c);
    setDropdownOpen(false);
    setSearchQuery('');
    if(onChange){
      var numPart=getDisplayNumber();
      onChange(c.prefix+numPart);
    }
  }

  function handleToggle(){
    if(!disabled){
      if(bt.current){
        var rect=bt.current.getBoundingClientRect();
        var spaceBelow=window.innerHeight-rect.bottom;
        var ddHeight=380;
        var isUp=spaceBelow<ddHeight&&rect.top>ddHeight;
        setDdPos({
          top:isUp?rect.top-ddHeight:rect.bottom,
          left:rect.left,
          width:Math.max(280,rect.width*2.5),
          dropUp:isUp
        });
      }
      setDropdownOpen(!dropdownOpen);
    }
  }

  function handlePhoneChange(ev){
    if(!onChange)return;
    var raw=ev.target.value.replace(/[^\d\s\-()]/g,'');
    var prefix=selectedCountry?selectedCountry.prefix:'';
    var maxD=selectedCountry?COUNTRY_DIGITS[selectedCountry.code]||15:15;
    if(raw.length>maxD){raw=raw.slice(0,maxD)}
    onChange(prefix+raw);
  }

  useEffect(function(){
    function handleClickOutside(ev){
      if((dd.current&&!dd.current.contains(ev.target))&&(pd.current&&!pd.current.contains(ev.target))){setDropdownOpen(false);setSearchQuery('')}
    }
    document.addEventListener('mousedown',handleClickOutside);
    return function(){document.removeEventListener('mousedown',handleClickOutside)}
  },[]);

  useEffect(function(){
    if(dropdownOpen&&si.current){setTimeout(function(){si.current.focus()},50)}
  },[dropdownOpen]);

  var filtered=filteredCountries();
  var displayNum=getDisplayNumber();

  return <div className="flex-1">
    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">{label}</label>
    <div className={'relative flex gap-0'+((!isPremium&&disabled)?' opacity-40 pointer-events-none':'')}>
      {!isPremium&&disabled?<div className="absolute inset-0 z-10 flex items-center justify-center bg-[#070D19]/60 backdrop-blur-[1px] rounded-lg cursor-not-allowed">
        <div className="flex items-center gap-1.5 text-[9px] text-amber-400">{SvgLock('w-3 h-3')}Premium only</div>
      </div>:null}
      <div ref={dd} className="relative">
        <button ref={bt} type="button" onClick={handleToggle} disabled={disabled}
          className={'flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-l-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-white/[0.06] transition-all h-full '+(dropdownOpen?'bg-white/[0.06] border-violet-500/50':'')}>
          <span className="text-base leading-none">{selectedCountry?selectedCountry.flag:'\uD83C\uDFF4'}</span>
          <span className="text-[10px] font-mono font-medium text-slate-400 hidden sm:inline">{selectedCountry?selectedCountry.prefix:''}</span>
          {SvgChevronDown('w-3 h-3 text-slate-500 transition-transform '+(dropdownOpen?'rotate-180':''))}
        </button>
        {dropdownOpen&&typeof document!=='undefined'?createPortal(<div ref={pd} className="fixed w-72 max-h-60 bg-[#0c1017] border border-white/[0.12] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] z-[99999] overflow-y-auto backdrop-blur-xl opacity-100" style={{top:ddPos.top,left:ddPos.left,width:ddPos.width,transition:'opacity 0.15s ease-out,transform 0.15s ease-out'}}>
          <div className="sticky top-0 z-10 p-2 border-b border-white/[0.08] bg-[#0c1017]">
            <div className="flex items-center gap-2 bg-[#141923] border border-white/[0.08] rounded-lg px-3 py-2 focus-within:border-purple-500/50 transition-all">
              {SvgSearch('w-3.5 h-3.5 text-slate-500 shrink-0')}
              <input ref={si} type="text" value={searchQuery} onChange={function(ev){setSearchQuery(ev.target.value)}} onKeyDown={function(ev){if(ev.key==='Escape'){setDropdownOpen(false);setSearchQuery('')}}} placeholder="Search countries..." className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none"/>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length>0?filtered.map(function(c,i){
              var isSel=selectedCountry&&selectedCountry.code===c.code;
              return <button key={c.code} type="button" onClick={function(){selectCountry(c)}} className={'w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all '+(isSel?'bg-[#121829] text-[#00E5FF]':'text-slate-300 hover:bg-purple-600/20 active:bg-purple-600/30')}>
                <span className="text-base leading-none shrink-0">{c.flag}</span>
                <span className="flex-1 text-xs font-medium truncate">{c.name}</span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{c.prefix}</span>
              </button>
            }):<div className="px-4 py-6 text-center text-xs text-slate-500">No countries found</div>}
          </div>
        </div>,document.body):null}
      </div>
      <input type="text" value={displayNum} onChange={handlePhoneChange} onKeyDown={function(ev){if(ev.key==='Escape'&&dropdownOpen){setDropdownOpen(false);setSearchQuery('')}}} disabled={disabled||(!isPremium)} placeholder={selectedCountry?'Enter number':'+1 (555) 123-4567'}
        className={'flex-1 bg-white/[0.03] border border-l-0 border-white/[0.06] rounded-r-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 '+(error?'border-red-500/50 focus:border-red-500':'')}/>
    </div>
    {error?<p className="text-[9px] text-red-400 mt-1">{error}</p>:null}
  </div>
}
