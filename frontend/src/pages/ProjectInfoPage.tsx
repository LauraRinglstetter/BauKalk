import ProjectInfoForm from "../features/project-info/ProjectInfoForm";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProjectInfoPage() {

    //Projekt-ID auslesen (kommt vom Dashboard)
    const navigate = useNavigate();
    const location = useLocation();
    const projectId = location.state?.projectId;
    console.log("Project ID auf Seite:", projectId);

    const handleSuccess = () => {
        navigate("/rooms", {
            state: { projectId },
        });
    };
    return (
        <div>   
            <ProjectInfoForm 
                projectId={projectId} 
                onSuccess={handleSuccess} 
            />
        </div>
    );
}