import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar";

export const metadata: Metadata = {
  title: "Signify - Sign Language Recognition",
  description: "AI-powered sign language recognition with emotion detection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{paddingTop: '80px'}}>
          {children}
        </main>
      </body>
    </html>
  );
}