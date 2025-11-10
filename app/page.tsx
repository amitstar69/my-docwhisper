export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-6xl font-bold mb-4">DocWhisper ⚡</h1>
        <p className="text-xl mb-8">Upload your documents, ask questions, get AI-powered answers with sources.</p>
        <a href="/dashboard" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
          Get Started
        </a>
      </div>
    </main>
  );
}
