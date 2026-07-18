import "./globals.css";
import "./enhancements.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "HMS | Project by Jeevan Subedi (M25W7486)",
  description: "Patient Registration System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
