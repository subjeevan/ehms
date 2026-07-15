import "./globals.css";
import "./enhancements.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Vision HMS | jacksoft.pvt.ltd",
  description: "Hospital Management System",
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
