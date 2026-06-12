import Board from "../components/Board";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="bg-white border-b px-6 py-4 mb-6">
        <h1 className="text-3xl font-bold">
          Jira Board
        </h1>

        <p className="text-gray-500">
          Task Management Dashboard
        </p>
      </div>

      <div className="px-6">
        <Board />
      </div>

    </div>
  );
}

export default Home;