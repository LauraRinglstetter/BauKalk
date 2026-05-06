import { useState, useEffect } from "react";
import { createProject, getProjects } from "../features/project-info/projectInfoApi";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {

  const [name, setName] = useState("");

  const navigate = useNavigate();

  // Projekt-ID muss gespeichert werden
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
        const data = await getProjects();
        setProjects(data);
    };

    fetchProjects();
    }, []);

  const handleCreate = async () => {
    const project = await createProject(name);
    setProjectId(project.id);
    console.log("Projekt erstellt:", project);
    //wenn Projekt erstellt -> Weiterleitung zu Projekt-Infos, Projekt-ID wird übergeben
    navigate("/project-info", {
        state: { projectId: project.id },
    });
  };

  return (
    <div>
        <h1>Dashboard</h1>
        <h2> Neues Projekt erstellen </h2>
        <input
            placeholder="Projektname"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />

        <button onClick={handleCreate}>Neues Projekt</button>

        <h2> An bestehenden Projekten weiterarbeiten </h2>
        <ul>
            {projects.map((project) => (
                <li
                key={project.id}
                onClick={() =>
                    navigate("/project-info", {
                    state: { projectId: project.id },
                    })
                }
                style={{ cursor: "pointer" }}
                >
                {project.name}
                </li>
            ))}
        </ul>
    </div>
  );
}