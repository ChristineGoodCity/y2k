import "./globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="site-content">
        <a className="sr-only focus:not-sr-only" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
