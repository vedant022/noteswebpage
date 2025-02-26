
import { NotesGrid } from "@/components/notes/NotesGrid";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container py-10">
        <NotesGrid />
      </div>
    </div>
  );
};

export default Dashboard;
