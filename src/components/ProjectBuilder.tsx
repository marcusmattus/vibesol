import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Rocket } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string;
  template: string;
  status: string;
  created_at: string;
}

interface ProjectBuilderProps {
  userId: string;
}

const ProjectBuilder = ({ userId }: ProjectBuilderProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    template: "defi-basic",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading projects:", error);
    } else {
      setProjects(data || []);
    }
  };

  const createProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("projects").insert({
      user_id: userId,
      name: newProject.name,
      description: newProject.description,
      template: newProject.template,
      status: "draft",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Project created successfully",
      });
      setNewProject({ name: "", description: "", template: "defi-basic" });
      setShowCreate(false);
      loadProjects();
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Project deleted successfully",
      });
      loadProjects();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Projects</h2>
        <Button onClick={() => setShowCreate(!showCreate)} className="gradient-sunset text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {showCreate && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Create New Project</h3>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Project Name</label>
            <Input
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="My Awesome dApp"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="A revolutionary DeFi platform..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Template</label>
            <Select
              value={newProject.template}
              onValueChange={(value) => setNewProject({ ...newProject, template: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defi-basic">DeFi Basic</SelectItem>
                <SelectItem value="nft-marketplace">NFT Marketplace</SelectItem>
                <SelectItem value="token-launchpad">Token Launchpad</SelectItem>
                <SelectItem value="dao-governance">DAO Governance</SelectItem>
                <SelectItem value="blank">Blank Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={createProject} disabled={loading} className="gradient-sunset text-white">
              Create Project
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg gradient-sunset flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description || "No description"}
            </p>

            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-1 rounded-full bg-muted capitalize">
                {project.template}
              </span>
              <span className="text-muted-foreground">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !showCreate && (
        <Card className="p-12 text-center">
          <Rocket className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first Solana dApp project to get started
          </p>
          <Button onClick={() => setShowCreate(true)} className="gradient-sunset text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ProjectBuilder;
