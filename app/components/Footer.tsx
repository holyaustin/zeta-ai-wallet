"use client";

export default function Footer() {
  return (
    <footer className="mt-12 py-6 bg-gray-900 text-gray-400 text-center text-sm">
      © {new Date().getFullYear()} Zeta AI Wallet. All rights reserved.
    </footer>
  );
}