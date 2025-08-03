import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  // Favicon links
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

// Default meta tags for the application
export const meta: Route.MetaFunction = () => [
  { title: "Tourme - Tournament Management Platform" },
  { name: "description", content: "Create and manage tournaments with automatic bracket generation, participant management, and real-time updates. Host competitive tournaments for any game or sport." },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "charset", content: "utf-8" },
  { name: "robots", content: "index, follow" },
  { name: "author", content: "Tourme" },
  { name: "keywords", content: "tournament, bracket, competition, gaming, esports, sports, tournament management, bracket generator" },
  { name: "language", content: "en" },
  { name: "google-site-verification", content: "WdnT6pwogkSSvv8-uE3E8YpEUcuiwg1I3CH-I9dC3qQ" },
  
  // Open Graph tags
  { property: "og:title", content: "Tourme - Tournament Management Platform" },
  { property: "og:description", content: "Create and manage tournaments with automatic bracket generation, participant management, and real-time updates. Host competitive tournaments for any game or sport." },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Tourme" },
  { property: "og:locale", content: "en_US" },
  { property: "og:url", content: "https://tourme.vercel.app" },
  
  // Twitter Card tags
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Tourme - Tournament Management Platform" },
  { name: "twitter:description", content: "Create and manage tournaments with automatic bracket generation, participant management, and real-time updates." },
  { name: "twitter:site", content: "@tourme" },
  { name: "twitter:creator", content: "@tourme" },
  
  // Additional SEO tags
  { name: "theme-color", content: "#2563eb" },
  { name: "msapplication-TileColor", content: "#2563eb" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  { name: "apple-mobile-web-app-title", content: "Tourme" },
  
  // Canonical URL
  { rel: "canonical", href: "https://tourme.vercel.app" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import { AppLayout } from "./components/Layout";

export default function App() {
  return <AppLayout><Outlet /></AppLayout>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
