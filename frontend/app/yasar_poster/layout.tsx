export const metadata = {
  title: "DAESIM Poster",
  description: "Full-screen standalone poster view",
};

export default function PosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This completely isolates the poster page from the global site layout
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#000",
          color: "#fff",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}