import { useState, useEffect } from "react";
import { createProjectInfo, getProjectInfo } from "./projectInfoApi";

export default function ProjectInfoForm({
  projectId,
  onSuccess,
}: {
  projectId: number;
  onSuccess: () => void;
}) {
    const [persons, setPersons] = useState(2);
    const [floors, setFloors] = useState<string[]>([]);
    const [houseType, setHouseType] = useState("Einfamilienhaus");

    useEffect(() => {
        const fetchData = async () => {
            try {
            const data = await getProjectInfo(projectId);

            if (data) {
                setPersons(data.persons);
                setFloors(data.floors);
                setHouseType(data.houseType);
            }
            } catch (error) {
            console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async () => {
        const data = { persons, floors, houseType, projectId };

        try {
            await createProjectInfo(data);
            return true; // wird an ProjectInfoPage.tsx weitergegeben
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <div>
            <h1> Projekt-Informationen</h1>
            <p> Allgemeine Angaben zum Projekt </p>
            <div>
                <label htmlFor="persons">Personenanzahl</label>
                <input
                    type="number"
                    value={persons}
                    onChange={(e) => setPersons(Number(e.target.value))}
                />
            </div>
            <div>
                <label>
                <input
                    type="checkbox"
                    value="Keller"
                    checked={floors.includes("Keller")}
                    onChange={(e) => {
                    if (e.target.checked) {
                        setFloors([...floors, "Keller"]);
                    } else {
                        setFloors(floors.filter((f) => f !== "Keller"));
                    }
                    }}
                />
                Keller
                </label>

                <label>
                <input
                    type="checkbox"
                    value="EG"
                    checked={floors.includes("EG")}
                    onChange={(e) => {
                    if (e.target.checked) {
                        setFloors([...floors, "EG"]);
                    } else {
                        setFloors(floors.filter((f) => f !== "EG"));
                    }
                    }}
                />
                EG
                </label>

                <label>
                <input
                    type="checkbox"
                    value="OG"
                    checked={floors.includes("OG")}
                    onChange={(e) => {
                    if (e.target.checked) {
                        setFloors([...floors, "OG"]);
                    } else {
                        setFloors(floors.filter((f) => f !== "OG"));
                    }
                    }}
                />
                OG
                </label>
                
            </div>
            <div>
                <label htmlFor="houseType">Geplanter Haustyp</label>
                <select value={houseType} onChange={(e) => setHouseType(e.target.value)}>
                    <option>Einfamilienhaus</option>
                    <option>Doppelhaus</option>
                    <option>Reihenhaus</option>
                </select>
            </div>
            
            <button
                onClick={async () => {
                    const ok = await handleSubmit();
                    if (ok) onSuccess();
                }}
                >
                Weiter
            </button>
        </div>
    );
}