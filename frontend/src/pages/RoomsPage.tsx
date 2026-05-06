import { useEffect, useState } from "react";
import { getRoomCategories, getProjectInfo, createRoom, getRooms } from "../features/project-info/projectInfoApi";
import { useLocation, useNavigate } from "react-router-dom";

export default function RoomsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const projectId = location.state?.projectId;
    const [categories, setCategories] = useState<any[]>([]);
    const [floors, setFloors] = useState<string[]>([]);
    const [roomsData, setRoomsData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (
        templateId: number,
        field: string,
        value: string
        ) => {
        setRoomsData((prev: any) => ({
            ...prev,
            [templateId]: {
            ...prev[templateId],
            [field]: value,
            },
        }));
    };
    const handleSave = async () => {
        if (!projectId) return;

        setSaving(true);

        for (const templateId in roomsData) {
            const room = roomsData[templateId];

            // nur speichern wenn sinnvoll
            if (!room.name && !room.floor && !room.note) continue;

            await createRoom({
                name: room.name || "",
                floor: room.floor || "",
                note: room.note || "",
                templateId: Number(templateId),
                projectId: projectId,
            });
        }

        console.log("Alle Räume gespeichert");
        setSaving(false);

        setIsSaved(true);
    };

    useEffect(() => {
        const fetch = async () => {
            const categoriesData = await getRoomCategories();
            setCategories(categoriesData);

            if (projectId) {
                const projectInfo = await getProjectInfo(projectId);

                if (projectInfo?.floors) {
                    setFloors(projectInfo.floors);
                }

                const rooms = await getRooms(projectId);

                const formatted: any = {};

                for (const room of rooms) {
                    if (!room.templateId) continue;

                    formatted[room.templateId] = {
                    name: room.name,
                    floor: room.floor,
                    note: room.note,
                    };
                }

                setRoomsData(formatted);
            }
        };

    fetch();
    }, [projectId]);

  return (
    <div>
        <button
            onClick={() =>
                navigate("/project-info", {
                state: { projectId },
                })
            }
            >
            ← Zurück zu den allgemeinen Projektinfos
        </button>
        <h1>Räume</h1>

        {categories.map((cat) => (
        <div key={cat.id} style={{ marginBottom: "30px" }}>
            <h2>{cat.name}</h2>

            <table border={1} cellPadding={8}>
            <thead>
                <tr>
                <th>Beispiel</th>
                <th>Raumname</th>
                <th>Geschoss</th>
                <th>Bemerkung</th>
                </tr>
            </thead>

            <tbody>
                {cat.templates.map((t: any) => (
                <tr key={t.id}>
                    <td>{t.name}</td>

                    <td>
                    <input
                        placeholder="Name"
                        value={roomsData[t.id]?.name || ""}
                        onChange={(e) =>
                            handleChange(t.id, "name", e.target.value)
                        }
                    />
                    </td>

                    <td>
                    <select
                        value={roomsData[t.id]?.floor || ""}
                        onChange={(e) =>
                            handleChange(t.id, "floor", e.target.value)
                        }
                        >
                        <option value="">-- wählen --</option>
                        {floors.map((f) => (
                            <option key={f}>{f}</option>
                        ))}
                    </select>
                    </td>

                    <td>
                    <input
                        placeholder="Bemerkung"
                        value={roomsData[t.id]?.note || ""}
                        onChange={(e) =>
                            handleChange(t.id, "note", e.target.value)
                        }
                    />
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        ))}
        <button onClick={handleSave} disabled={saving}>
            {saving ? "Speichert..." : "Räume speichern"}
        </button>

        <button
            onClick={async () => {
                navigate("/furniture", {
                    state: { projectId },
                })
            }}
            disabled={!isSaved}
            >
            Weiter zu Möbeln
        </button>
    </div>
    );
}