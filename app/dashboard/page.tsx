export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome! Create your first bot to start chatting with your docs.</p>
      <a href="/dashboard/new" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Create New Bot
      </a>
    </div>
  );
}
