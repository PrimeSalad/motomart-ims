/*
 * Carbon & Crimson IMS
 * File: src/components/error_boundary.jsx
 * Version: 1.0.0
 * Purpose: Prevent blank screen by catching render errors.
 */

import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
          <h1 className="text-2xl font-black text-red-500">UI Crash</h1>
          <p className="mt-2 text-white/70">
            Open DevTools Console for details.
          </p>
          <pre className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 overflow-auto text-xs">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}