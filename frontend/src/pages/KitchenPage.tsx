import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createKitchenItem, getKitchenStorageTypes, getKitchenTemplates, getRooms } from "../features/project-info/projectInfoApi";

export default function KitchenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;

  const [kitchenTemplates, setKitchenTemplates] = useState<any[]>([]);
  const [kitchenRooms, setKitchenRooms] = useState<any[]>([]);
  const [kitchenStorageTypes, setKitchenStorageTypes] = useState<any[]>([]);

  // Schlüssel: "roomId_templateId", Wert: { quantity, width, depth, height, storageTypeId }
  const [templateItemData, setTemplateItemData] = useState<any>({});

  // Schlüssel: roomId, Wert: Array von eigenen Geräten
  const [customItems, setCustomItems] = useState<Record<number, any[]>>({});

  const groups = [...new Set(kitchenTemplates.map((t) => t.group))];

  useEffect(() => {
    const fetchData = async () => {
      const templates = await getKitchenTemplates();
      setKitchenTemplates(templates);

      const storageTypes = await getKitchenStorageTypes();
      setKitchenStorageTypes(storageTypes);

      if (projectId) {
        const rooms = await getRooms(projectId, true, false);
        const filtered = rooms.filter(
          (r: any) => r.template?.category?.key === "kitchen"
        );
        setKitchenRooms(filtered);

        // für jeden Raum + jedes Template einen Eintrag mit Standardwerten anlegen
        const initial: any = {};
        for (const room of filtered) {
          for (const t of templates) {
            const key = `${room.id}_${t.id}`;
            initial[key] = {
              quantity: t.defaultQuantity ?? 0,
              width: t.width ?? 0,
              depth: t.depth ?? 0,
              height: t.height ?? 0,
              storageTypeId: t.storageTypeId,
            };
          }
        }
        setTemplateItemData(initial);
      }
    };

    fetchData();
  }, [projectId]);

  const handleTemplateChange = (roomId: number, templateId: number, field: string, value: any) => {
    const key = `${roomId}_${templateId}`;
    setTemplateItemData((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleAddCustomItem = (roomId: number, group: string) => {
    setCustomItems((prev) => ({
      ...prev,
      [roomId]: [
        ...(prev[roomId] ?? []),
        {
          id: Date.now(),
          group,
          name: "",
          width: 0,
          depth: 0,
          height: 0,
          quantity: 1,
          storageTypeId: "",
        },
      ],
    }));
  };

  const handleCustomItemChange = (roomId: number, itemId: number, field: string, value: any) => {
    setCustomItems((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    // Template-Geräte speichern
    for (const room of kitchenRooms) {
      for (const template of kitchenTemplates) {
        const key = `${room.id}_${template.id}`;
        const data = templateItemData[key] || {};
        if (!data.quantity || data.quantity <= 0) continue;

        await createKitchenItem({
          name: template.name,
          width: data.width ?? template.width ?? 0,
          depth: data.depth ?? template.depth ?? 0,
          height: data.height ?? template.height ?? undefined,
          quantity: data.quantity,
          roomId: room.id,
          templateId: template.id,
          storageTypeId: data.storageTypeId ?? template.storageTypeId,
        });
      }
    }

    // Eigene Geräte speichern
    for (const [roomIdStr, items] of Object.entries(customItems)) {
      const roomId = Number(roomIdStr);
      for (const item of items as any[]) {
        if (!item.name || !item.storageTypeId || !item.quantity) continue;

        await createKitchenItem({
          name: item.name,
          width: item.width,
          depth: item.depth,
          height: item.height || undefined,
          quantity: item.quantity,
          roomId,
          templateId: null,
          storageTypeId: item.storageTypeId,
        });
      }
    }

    alert("Küchengeräte gespeichert");
  };

  const tableHeader = (
    <thead>
      <tr>
        <th>Name</th>
        <th>Anzahl</th>
        <th>Breite (m)</th>
        <th>Tiefe (m)</th>
        <th>Höhe (m)</th>
        <th>Position</th>
      </tr>
    </thead>
  );

  return (
    <div>
      <button onClick={() => navigate("/furniture", { state: { projectId } })}>
        Zurück zu Möbeln
      </button>

      <h1>Küche</h1>

      {kitchenRooms.length === 0 && <p>Keine Küchenräume gefunden.</p>}

      {/* Ebene 1: Räume */}
      {kitchenRooms.map((room) => (
        <section key={room.id}>
          <h2>{room.name} ({room.floor})</h2>

          {/* Ebene 2: Gruppen */}
          {groups.map((group) => {
            const groupTemplates = kitchenTemplates.filter((t) => t.group === group);
            const groupCustomItems = (customItems[room.id] ?? []).filter(
              (c) => c.group === group
            );

            return (
              <section key={group}>
                <h3>{group}</h3>
                <table border={1} cellPadding={8}>
                  {tableHeader}
                  <tbody>

                    {/* Template-Geräte */}
                    {groupTemplates.map((template) => {
                      const key = `${room.id}_${template.id}`;
                      const data = templateItemData[key] ?? {};
                      return (
                        <tr key={template.id}>
                          <td>{template.name}</td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              value={data.quantity ?? 0}
                              onChange={(e) =>
                                handleTemplateChange(room.id, template.id, "quantity", Number(e.target.value))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={data.width ?? 0}
                              onChange={(e) =>
                                handleTemplateChange(room.id, template.id, "width", Number(e.target.value))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={data.depth ?? 0}
                              onChange={(e) =>
                                handleTemplateChange(room.id, template.id, "depth", Number(e.target.value))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={data.height ?? 0}
                              onChange={(e) =>
                                handleTemplateChange(room.id, template.id, "height", Number(e.target.value))
                              }
                            />
                          </td>
                          <td>
                            <select
                              value={data.storageTypeId ?? template.storageTypeId}
                              onChange={(e) =>
                                handleTemplateChange(room.id, template.id, "storageTypeId", Number(e.target.value))
                              }
                            >
                              {kitchenStorageTypes.map((st) => (
                                <option key={st.id} value={st.id}>{st.name}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Eigene Geräte */}
                    {groupCustomItems.map((item) => (
                      <tr key={item.id} style={{ background: "#f5f5f5" }}>
                        <td>
                          <input
                            value={item.name}
                            placeholder="Eigenes Gerät"
                            onChange={(e) => handleCustomItemChange(room.id, item.id, "name", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleCustomItemChange(room.id, item.id, "quantity", Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.width}
                            onChange={(e) => handleCustomItemChange(room.id, item.id, "width", Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.depth}
                            onChange={(e) => handleCustomItemChange(room.id, item.id, "depth", Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.height}
                            onChange={(e) => handleCustomItemChange(room.id, item.id, "height", Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <select
                            value={item.storageTypeId}
                            onChange={(e) => handleCustomItemChange(room.id, item.id, "storageTypeId", Number(e.target.value))}
                          >
                            <option value="">-- Position wählen --</option>
                            {kitchenStorageTypes.map((st) => (
                              <option key={st.id} value={st.id}>{st.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>

                <button onClick={() => handleAddCustomItem(room.id, group)}>
                  + Eigenes Gerät zu {group} hinzufügen
                </button>
              </section>
            );
          })}
        </section>
      ))}

      <br />
      <button onClick={handleSave}>Speichern</button>
    </div>
  );
}