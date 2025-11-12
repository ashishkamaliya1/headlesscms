import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "My Blog",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="antialiased">
        {children}
      </body>
    </html>
  );
}
