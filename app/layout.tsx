export const metadata = {
  title: 'SmartChat Pro',
  description: 'RAG-powered AI chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
