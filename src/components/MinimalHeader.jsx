import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

function MinimalHeader({filtersNode, activeView, onViewChange, views = [], collapsed, onCollapse}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const menuRef = useRef(null);
  const viewRef = useRef(null);

  const navLinks = [
    {label: "DEV", href: "https://github.com/orgs/TempoGeoPoliticalMap/projects/1"},
    {label: "GIT", href: "https://github.com/TempoGeoPoliticalMap"},
    {label: "DOCS", href: "https://docs.tgpm.world"},
    {label: "API", href: "https://api.tgpm.world"}
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target)) setViewOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="relative z-[2000] w-full" style={{background: "#7f0000"}}>
      {/* Hero background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/header-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35
        }}
      />
      {/* Dark gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{background: "linear-gradient(135deg, rgba(127,0,0,0.6) 0%, rgba(200,30,30,0.4) 100%)"}}
      />

      {/* Top bar — always visible */}
      <div className="relative z-[2100] px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="TGPM logo"
              style={{height: 32, width: "auto", position: "relative", top: "1px"}}
            />
            <span className="text-white font-bold text-lg tracking-wide">TempoGeoPoliticalMap</span>
          </div>
        </div>

        {/* Filter — centred in top bar when collapsed */}
        {collapsed && filtersNode && (
          <div className="filter-bar absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded shadow-lg px-2.5 py-2 z-20">
            {filtersNode}
          </div>
        )}

        {/* View dropdown + burger + collapse */}
        <nav className="flex items-center gap-1 flex-shrink-0">
          {/* View dropdown */}
          {views.length > 0 && (
            <div ref={viewRef} className="relative mr-3">
              <div className="flex rounded overflow-hidden" style={{border: "1.5px solid rgba(255,255,255,0.4)"}}>
                <button
                  onClick={() => setViewOpen(prev => !prev)}
                  className="flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-1 hover:bg-white/10 transition-colors">
                  {`View: ${views.find(v => v.id === activeView)?.label ?? "View"}`}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{
                      transform: viewOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease"
                    }}>
                    <path
                      d="M1 3L5 7L9 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              {viewOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded overflow-hidden shadow-xl z-[1000]">
                  {views.map(({id, label}) => (
                    <button
                      key={id}
                      onClick={() => {
                        onViewChange(id);
                        setViewOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                        activeView === id ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                      }`}>
                      {`View: ${label}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Burger */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="flex flex-col justify-center items-center gap-1 w-8 h-8 rounded hover:bg-white/10 transition-colors"
              aria-label="Menu">
              <span className="block w-5 h-0.5 bg-white rounded" />
              <span className="block w-5 h-0.5 bg-white rounded" />
              <span className="block w-5 h-0.5 bg-white rounded" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded overflow-hidden shadow-xl z-[1000]">
                {navLinks.map(({label, href}) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}>
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Collapse toggle — only in nav when collapsed */}
          {collapsed && (
            <button
              onClick={onCollapse}
              className="ml-1 flex items-center gap-1 text-white text-sm font-semibold px-3 py-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Expand header">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{transform: "rotate(180deg)"}}>
                <path d="M2 5L7 10L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </nav>
      </div>

      {/* Hero content — collapsible */}
      <div
        style={{
          maxHeight: collapsed ? "0" : "300px",
          opacity: collapsed ? 0 : 1,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
          overflow: "hidden"
        }}>
        <div className="relative z-10 px-6 pt-4 pb-8 md:pb-16 flex flex-col items-center text-center">
          <h1 className="text-white text-xl md:text-3xl font-bold leading-tight mb-3">
            Explore the World&apos;s political events
            <br />
            with data straight from Wikipedia
          </h1>
          <p className="text-white-100 text-l leading-relaxed max-w-xl">
            TGPM is an open-source project designed to reduce informational bias by presenting unfiltered events of
            interest directly from Wikipedia.
          </p>
        </div>

        {/* Filter — overlays the bottom edge of the header when expanded */}
        {filtersNode && (
          <div className="filter-bar absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-2 bg-white rounded shadow-xl px-5 py-2 z-30">
            {filtersNode}
          </div>
        )}

        {/* Collapse toggle — at bottom-right edge when expanded */}
        <button
          onClick={onCollapse}
          className="absolute bottom-0 right-6 translate-y-1/2 flex items-center justify-center bg-white rounded shadow-xl px-3 py-2 z-30 hover:bg-gray-50 transition-colors"
          aria-label="Collapse header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 9L7 4L12 9" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

MinimalHeader.propTypes = {
  filtersNode: PropTypes.node,
  activeView: PropTypes.string,
  onViewChange: PropTypes.func,
  views: PropTypes.arrayOf(PropTypes.shape({id: PropTypes.string, label: PropTypes.string})),
  collapsed: PropTypes.bool,
  onCollapse: PropTypes.func
};

export default MinimalHeader;
