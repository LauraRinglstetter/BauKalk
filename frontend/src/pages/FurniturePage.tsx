import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRooms } from "../features/project-info/projectInfoApi";

export default function FurniturePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const projectId = location.state?.projectId;

    //Speicher im Frontend (Liste aller Räume)
    const [rooms, setRooms] = useState<any[]>([]);

    const [furnitureData, setFurnitureData] = useState<any>({});

    useEffect(() => {
        const fetch = async () => {
            if (!projectId) return;

            const data = await getRooms(projectId, true, true);
            setRooms(data); 
        };

    fetch();
    }, [projectId]);

    const groupedRooms = rooms.reduce((acc: any, room: any) => {

        //Küche wird in allgemeiner Möbelliste nicht angezeigt
        const categoryKey = room.template?.category?.key;
        if (categoryKey === "kitchen") {
            return acc;
        }

        const categoryName = room.template?.category?.name || "Ohne Kategorie";

        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }

        acc[categoryName].push(room);

    return acc;
    }, {});

    const handleChange = (
        roomId: number,
        templateId: number,
        field: string,
        value: any
        ) => {
        setFurnitureData((prev: any) => ({
            ...prev,
            [roomId]: {
            ...prev[roomId],
            [templateId]: {
                ...prev[roomId]?.[templateId],
                [field]: value,
            },
            },
        }));
    };

    const handleAddFurniture = (roomId: number) => {
        setFurnitureData((prev: any) => ({
            ...prev,
            [roomId]: {
            ...prev[roomId],
            custom: [
                ...(prev[roomId]?.custom || []),
                {
                id: Date.now(), // einfacher unique key
                name: "",
                width: 0,
                depth: 0,
                side1: 0,
                side2: 0,
                front: 0,
                back: 0,
                quantity: 1,
                },
            ],
            },
        }));
    };
    const handleCustomChange = (
        roomId: number,
        index: number,
        field: string,
        value: any
    ) => {
        setFurnitureData((prev: any) => {
            const updated = [...(prev[roomId]?.custom || [])];
            updated[index] = {
            ...updated[index],
            [field]: value,
            };

            return {
            ...prev,
            [roomId]: {
                ...prev[roomId],
                custom: updated,
            },
            };
        });
    };

    const calculateFurnitureArea = (data: any, template?: any) => {
        const width = data.width ?? template?.width ?? 0;
        const depth = data.depth ?? template?.depth ?? 0;

        const side1 = data.side1 ?? template?.side1 ?? 0;
        const side2 = data.side2 ?? template?.side2 ?? 0;
        const front = data.front ?? template?.front ?? 0;
        const back = data.back ?? template?.back ?? 0;

        const quantity = data.quantity ?? 1;

        const totalWidth = width + side1 + side2;
        const totalDepth = depth + front + back;

        return totalWidth * totalDepth * quantity;
    };

    const calculateRoomArea = (room: any) => {
        let total = 0;

        const templates = room.template?.category?.furnitureTemplates || [];

        //Template-Möbel (User-Änderungen werden berücksichtigt)
        templates.forEach((f: any) => {
            const data = furnitureData[room.id]?.[f.id] || {};
            total += calculateFurnitureArea(data, f);
        });

        //Möbel vom User hinzugefügt
        const custom = furnitureData[room.id]?.custom || [];

        custom.forEach((f: any) => {
            total += calculateFurnitureArea(f);
        });

        return total;
    };

    console.log("FurniturePage projectId:", projectId);

    return (
    <div>
        <button
            onClick={() =>
                navigate("/rooms", {
                state: { projectId },
                })
            }
            >
            ← Zurück zur Raumauswahl
        </button>
        <h1>Möbel</h1>

        {Object.entries(groupedRooms).map(([category, rooms]) => (
        <div key={category} style={{ marginBottom: "30px" }}>
            <h2>{category}</h2>

            {(rooms as any[]).map((room) => (
            <div key={room.id} style={{ marginLeft: "20px", marginBottom: "15px" }}>
                <h3>
                    {room.name} (Geschoss: {room.floor}) —{" "}
                    {calculateRoomArea(room).toFixed(2)} m²
                </h3>

                <table border={1} cellPadding={6}>
                    <thead>
                        <tr>
                        <th>Stk</th>
                        <th>Name</th>
                        <th>Breite</th>
                        <th>Tiefe</th>
                        <th>Seite 1</th>
                        <th>Seite 2</th>
                        <th>Vorne</th>
                        <th>Hinten</th>
                        <th>Fläche (m²)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* TEMPLATE MÖBEL */}
                        {room.template?.category?.furnitureTemplates?.map((f: any) => {
                        const data = furnitureData[room.id]?.[f.id] || {};

                        return (
                            <tr key={f.id}>
                                <td>
                                    <input
                                    type="number"
                                    value={data.quantity ?? 1}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "quantity", Number(e.target.value))
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    value={data.name ?? f.name ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "customName", e.target.value)
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    type="number"
                                    value={data.width ?? f.width ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "width", Number(e.target.value))
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    type="number"
                                    value={data.depth ?? f.depth ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "depth", Number(e.target.value))
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    type="number"
                                    value={data.side1 ?? f.side1 ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "side1", Number(e.target.value))
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    type="number"
                                    value={data.side2 ?? f.side2 ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "side2", Number(e.target.value))
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    type="number"
                                    value={data.front ?? f.front ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "front", Number(e.target.value))
                                    }
                                    />
                                </td>

                                <td>
                                    <input
                                    type="number"
                                    value={data.back ?? f.back ?? ""}
                                    onChange={(e) =>
                                        handleChange(room.id, f.id, "back", Number(e.target.value))
                                    }
                                    />
                                </td>
                                <td>
                                    {calculateFurnitureArea(data, f).toFixed(2)}
                                </td>
                            </tr>
                        );
                        })}

                        {/* CUSTOM MÖBEL */}
                        {furnitureData[room.id]?.custom?.map((f: any, index: number) => (
                        <tr key={f.id} style={{ background: "#f5f5f5" }}>
                            <td>
                                <input
                                    type="number"
                                    value={f.quantity}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "quantity", Number(e.target.value))
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    value={f.name}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "name", e.target.value)
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    type="number"
                                    value={f.width}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "width", Number(e.target.value))
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    type="number"
                                    value={f.depth}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "depth", Number(e.target.value))
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    type="number"
                                    value={f.side1}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "side1", Number(e.target.value))
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    type="number"
                                    value={f.side2}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "side2", Number(e.target.value))
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    type="number"
                                    value={f.front}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "front", Number(e.target.value))
                                    }
                                />
                            </td>

                            <td>
                                <input
                                    type="number"
                                    value={f.back}
                                    onChange={(e) =>
                                    handleCustomChange(room.id, index, "back", Number(e.target.value))
                                    }
                                />
                            </td>
                            <td>
                                {calculateFurnitureArea(f).toFixed(2)}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                <button onClick={() => handleAddFurniture(room.id)}>
                    + Möbel hinzufügen
                </button>
            </div>
            ))}
        </div>
        ))}

        <button
            onClick={() =>
                navigate("/kitchen", {
                    state: { projectId },
                })
            }
            >
            Weiter zur Küche
        </button>
    </div>
    );
}
