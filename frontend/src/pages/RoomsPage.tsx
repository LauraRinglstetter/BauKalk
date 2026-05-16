import { useEffect, useState } from "react";
import { getRoomCategories, getProjectInfo, createRoom, getRooms, createCustomRoom, deleteCustomRoom, updateCustomRoom } from "../features/project-info/projectInfoApi";
import { useLocation, useNavigate } from "react-router-dom";

export default function RoomsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId;
  const [categories, setCategories] = useState<any[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [roomsData, setRoomsData] = useState<any>({});

  // Schlüssel: categoryId, Wert: Array von eigenen Räumen
  const [customRooms, setCustomRooms] = useState<Record<number, any[]>>({});

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

        // Template-Räume
        const formatted: any = {};
        for (const room of rooms) {
          if (!room.templateId) continue;
          formatted[room.templateId] = {
            name: room.name,
            floor: room.floor,
            note: room.note,
            enabled: true,
          };
        }
        setRoomsData(formatted);

        // Eigene Räume aus DB laden (ohne templateId)
        const savedCustomRooms = rooms.filter((r: any) => !r.templateId);
        const initialCustomRooms: Record<number, any[]> = {};
        for (const room of savedCustomRooms) {
          const catId = room.categoryId ?? 0;
          if (!initialCustomRooms[catId]) initialCustomRooms[catId] = [];
          initialCustomRooms[catId].push({
            id: room.id,
            name: room.name,
            floor: room.floor,
            note: room.note || "",
            isNew: false,
            enabled: true,
          });
        }
        setCustomRooms(initialCustomRooms);
      }
    };

    fetch();
  }, [projectId]);

  // Checkbox an/aus
  const handleCheckboxChange = async (templateId: number, checked: boolean, templateName: string) => {
  setRoomsData((prev: any) => ({
    ...prev,
    [templateId]: { ...prev[templateId], enabled: checked },
  }));

  if (!checked) return;

  const current = roomsData[templateId] ?? {};

  // Standardname = Template-Name falls noch kein Name eingegeben
  const name = current.name || templateName;
  const floor = current.floor || floors[0] || "";

  setRoomsData((prev: any) => ({
    ...prev,
    [templateId]: { ...prev[templateId], name, floor },
  }));

  await createRoom({
    name,
    floor,
    note: current.note || "",
    templateId: Number(templateId),
    projectId,
  });
};

  // Felder ändern + Auto-Save
  const handleChange = async (templateId: number, field: string, value: string) => {
    setRoomsData((prev: any) => ({
      ...prev,
      [templateId]: { ...prev[templateId], [field]: value },
    }));

    const updated = { ...roomsData[templateId], [field]: value };
    if (!updated.enabled) return; // nur speichern wenn Checkbox aktiv
    if (!updated.name && !updated.floor) return;

    await createRoom({
      name: updated.name || "",
      floor: updated.floor || "",
      note: updated.note || "",
      templateId: Number(templateId),
      projectId,
    });
  };

  // Eigenen Raum hinzufügen
  const handleAddCustomRoom = (categoryId: number) => {
    setCustomRooms((prev) => ({
      ...prev,
      [categoryId]: [
        ...(prev[categoryId] ?? []),
        { id: Date.now(), name: "", floor: "", note: "", isNew: true, enabled: true },
      ],
    }));
  };

  const handleCustomRoomCheckboxChange = (categoryId: number, roomId: number, checked: boolean) => {
    setCustomRooms((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] ?? []).map((r) =>
        r.id === roomId ? { ...r, enabled: checked } : r
        ),
    }));
    };

  // Eigenen Raum ändern + Auto-Save
  const handleCustomRoomChange = async (categoryId: number, roomId: number, field: string, value: string) => {
    const room = (customRooms[categoryId] ?? []).find((r) => r.id === roomId);
    if (!room) return;

    const updated = { ...room, [field]: value };
    setCustomRooms((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] ?? []).map((r) => r.id === roomId ? updated : r),
    }));

    if (!updated.name || !updated.floor) return;

    if (room.isNew) {
        // neu in DB anlegen
        const saved = await createCustomRoom({
        name: updated.name,
        floor: updated.floor,
        note: updated.note,
        projectId,
        });
        // echte DB-ID setzen und isNew entfernen
        setCustomRooms((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] ?? []).map((r) =>
            r.id === roomId ? { ...updated, id: saved.id, isNew: false } : r
        ),
        }));
    } else {
        // bereits in DB → aktualisieren
        await updateCustomRoom(room.id, {
        name: updated.name,
        floor: updated.floor,
        note: updated.note,
        });
    }
    };

  // Eigenen Raum löschen
  const handleDeleteCustomRoom = async (categoryId: number, roomId: number, isNew: boolean) => {
    setCustomRooms((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? []).filter((r) => r.id !== roomId),
    }));
    if (!isNew) {
      await deleteCustomRoom(roomId);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/project-info", { state: { projectId } })}>
        ← Zurück zu den allgemeinen Projektinfos
      </button>
      <h1>Räume</h1>

      {categories.map((cat) => (
        <div key={cat.id} style={{ marginBottom: "30px" }}>
          <h2>{cat.name}</h2>

          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th></th>
                <th>Aktiv</th>
                <th>Beispiel</th>
                <th>Raumname</th>
                <th>Geschoss</th>
                <th>Bemerkung</th>
              </tr>
            </thead>
            <tbody>
              {/* Template-Räume */}
              {cat.templates.map((t: any) => {
                const isEnabled = roomsData[t.id]?.enabled ?? false;  // hier definieren
                return (
                    <tr key={t.id}>
                    <td></td>
                    <td>
                        <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => handleCheckboxChange(t.id, e.target.checked, t.name)}
                        />
                    </td>
                    <td>{t.name}</td>
                    <td>
                        <input
                        placeholder="Name"
                        value={roomsData[t.id]?.name || ""}
                        disabled={!isEnabled}
                        onChange={(e) => handleChange(t.id, "name", e.target.value)}
                        />
                    </td>
                    <td>
                        <select
                        value={roomsData[t.id]?.floor || ""}
                        disabled={!isEnabled}
                        onChange={(e) => handleChange(t.id, "floor", e.target.value)}
                        >
                        <option value="">-- wählen --</option>
                        {floors.map((f) => <option key={f}>{f}</option>)}
                        </select>
                    </td>
                    <td>
                        <input
                        placeholder="Bemerkung"
                        value={roomsData[t.id]?.note || ""}
                        disabled={!isEnabled}
                        onChange={(e) => handleChange(t.id, "note", e.target.value)}
                        />
                    </td>
                    </tr>
                );
                })}

              {/* Eigene Räume dieser Kategorie */}
              {(customRooms[cat.id] ?? []).map((room) => (
                <tr key={room.id} style={{ background: "#f5f5f5" }}>
                    <td>
                    <button onClick={() => handleDeleteCustomRoom(cat.id, room.id, room.isNew)}>✕</button>
                    </td>
                    <td>
                    <input
                        type="checkbox"
                        checked={room.enabled ?? true}
                        onChange={(e) => handleCustomRoomCheckboxChange(cat.id, room.id, e.target.checked)}
                    />
                    </td>
                    <td>— eigener Raum —</td>
                    <td>
                    <input
                        placeholder="Name"
                        value={room.name}
                        disabled={!room.enabled}
                        onChange={(e) => handleCustomRoomChange(cat.id, room.id, "name", e.target.value)}
                    />
                    </td>
                    <td>
                    <select
                        value={room.floor}
                        disabled={!room.enabled}
                        onChange={(e) => handleCustomRoomChange(cat.id, room.id, "floor", e.target.value)}
                    >
                        <option value="">-- wählen --</option>
                        {floors.map((f) => <option key={f}>{f}</option>)}
                    </select>
                    </td>
                    <td>
                    <input
                        placeholder="Bemerkung"
                        value={room.note}
                        disabled={!room.enabled}
                        onChange={(e) => handleCustomRoomChange(cat.id, room.id, "note", e.target.value)}
                    />
                    </td>
                </tr>
                ))}
            </tbody>
          </table>

          <button onClick={() => handleAddCustomRoom(cat.id)}>
            + Eigenen Raum zu {cat.name} hinzufügen
          </button>
        </div>
      ))}

      <button onClick={() => navigate("/furniture", { state: { projectId } })}>
        Weiter zu Möbeln
      </button>
    </div>
  );
}