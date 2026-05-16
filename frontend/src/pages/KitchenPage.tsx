import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createKitchenItem, getKitchenItems, getKitchenStorageTypes, getKitchenTemplates, getRooms, upsertKitchenDoor, upsertKitchenSpacing, getKitchenDoors, getKitchenSpacing, deleteCustomKitchenItem } from "../features/project-info/projectInfoApi";

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
      console.log("templates:", templates);
      setKitchenTemplates(templates);

      const storageTypes = await getKitchenStorageTypes();
      setKitchenStorageTypes(storageTypes);

      if (projectId) {
        const rooms = await getRooms(projectId, true, false);
        const filtered = rooms.filter(
          (r: any) => r.template?.category?.key === "kitchen"
        );
        setKitchenRooms(filtered);

        // Türen und Abstände für alle Räume laden
        for (const room of filtered) {
          const doors = await getKitchenDoors(room.id);
          if (doors.length > 0) {
            const doorState: any = {
              innentuer:  { quantity: 1, width: 1.25, depth: 0.80, side1: 0, side2: 0, front: 0.65, back: 0 },
              durchgang:  { quantity: 0, width: 2.80, depth: 0.80, side1: 0, side2: 0, front: 0.65, back: 0 },
              aussentuer: { quantity: 0, width: 1.25, depth: 0.80, side1: 0, side2: 0, front: 0.65, back: 0 },
            };
            for (const door of doors) {
              doorState[door.type] = { quantity: door.quantity, width: door.width,
                depth: door.depth, side1: door.side1, side2: door.side2,
                front: door.front, back: door.back };
            }
            setDoorData((prev) => ({ ...prev, [room.id]: doorState }));
          }

          const spacings = await getKitchenSpacing(room.id);
          for (const spacing of spacings) {
            const key = `${room.id}_${spacing.storageTypeName}`;
            setStorageTypeSpacing((prev) => ({
              ...prev,
              [key]: { side1: spacing.side1, side2: spacing.side2,
                        front: spacing.front, back: spacing.back },
            }));
          }
        }

        // für jeden Raum + jedes Template einen Eintrag mit Standardwerten anlegen
        const savedItems = await getKitchenItems(projectId);
        const initial: any = {};
        for (const room of filtered) {
          for (const t of templates) {
            const key = `${room.id}_${t.id}`;
            // gespeichertes Item suchen
            const saved = savedItems.find(
              (item: any) => item.roomId === room.id && item.templateId === t.id
            );
            initial[key] = saved ? {
              quantity: saved.quantity,
              width: saved.width,
              depth: saved.depth,
              height: saved.height ?? 0,
              storageTypeId: saved.storageTypeId,
            } : {
              quantity: t.defaultQuantity ?? 0,
              width: t.width ?? 0,
              depth: t.depth ?? 0,
              height: t.height ?? 0,
              storageTypeId: t.storageTypeId,
            };
          }
        }
        setTemplateItemData(initial);

        // Custom-Items laden (Items ohne templateId)
        const savedCustomItems = savedItems.filter((item: any) => item.templateId === null);
        console.log("savedCustomItems:", savedCustomItems);
        const initialCustomItems: Record<number, any[]> = {};
        for (const item of savedCustomItems) {
          if (!initialCustomItems[item.roomId]) {
            initialCustomItems[item.roomId] = [];
          }
          initialCustomItems[item.roomId].push({
            id: item.id,         // echte DB-ID verwenden statt Date.now()
            customItemKey: item.customItemKey,
            group: item.group ?? "Großgeräte",
            name: item.name,
            width: item.width,
            depth: item.depth,
            height: item.height ?? 0,
            quantity: item.quantity,
            storageTypeId: item.storageTypeId,
          });
        }
        setCustomItems(initialCustomItems);
      }
    };

    fetchData();
  }, [projectId]);

  //Auto-Save: Ändeurngen direkt in DB gespeichert
  const handleTemplateChange = async (roomId: number, templateId: number, field: string, value: any) => {
    const key = `${roomId}_${templateId}`;
    const updated = { ...templateItemData[key], [field]: value};

    setTemplateItemData((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));

    if(!updated.quantity || updated.quantity <= 0) return;

    const template = kitchenTemplates.find((t) => t.id === templateId);
    if (!template) return;

    await createKitchenItem({
      name: template.name, 
      width: updated.width ?? template.width ?? 0,
      depth: updated.depth ?? template.depth ?? 0,
      height: updated.height ?? template.height ?? 0,
      quantity: updated.quantity,
      roomId,
      templateId,
      storageTypeId: updated.storageTypeId ?? template.storageTypeId,
    });
  };

  // neues eigenes Gerät erstellen bei Klick auf +
  const handleAddCustomItem = (roomId: number, group: string) => {
    setCustomItems((prev) => ({
      ...prev,
      [roomId]: [
        ...(prev[roomId] ?? []),
        {
          id: Date.now(),
          customItemKey: `custom_${roomId}_${Date.now()}`,
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

  // Auto-Save für die Custom-Items (direkt in DB gespeichert)
  const handleCustomItemChange = async (roomId: number, itemId: number, field: string, value: any) => {
    const item = (customItems[roomId] ?? []).find((i) => i.id === itemId);
    if(!item) return;

    const updatedItem = { ...item, [field]: value };

    setCustomItems((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).map((i) =>
        i.id === itemId ? updatedItem : i
      ),
    }));

    if(!updatedItem.name || !updatedItem.storageTypeId || !updatedItem.quantity) return;

    await createKitchenItem({
      name: updatedItem.name,
      width: updatedItem.width,
      depth: updatedItem.depth,
      height: updatedItem.height || undefined,
      quantity: updatedItem.quantity,
      roomId,
      templateId: null,
      storageTypeId: updatedItem.storageTypeId,
      group: updatedItem.group,
      customItemKey: updatedItem.customItemKey,
    });
  };

  //Eigene Geräte löschen
  const handleDeleteCustomItem = async (roomId: number, itemId: number, customItemKey: string) => {
    // aus State entfernen
    setCustomItems((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).filter((item) => item.id !== itemId),
    }));

    // aus DB löschen 
      await deleteCustomKitchenItem(customItemKey);
  };

  //Fläche der Geräte berechnen (nur Arbeisplatten bekommen eine Fläche)
  const calculateArea = (
    quantity: number,
    width: number,
    depth: number,
    storageTypeName: string
  ) => {
    if (storageTypeName === "Arbeitsplatte") return quantity * width * depth;
    return 0;
  };

  //Volumen der einzelnen Geräte berechnen (Arbeitsfläche bekommt immer 0)
  const calculateVolume = (quantity: number, width: number, depth: number, height: number, storageTypeName: string) => {
    if(storageTypeName === "Arbeitsplatte") return 0;
    return quantity * width * depth * height;
  }

  //Abstände der Schränke etc. (in der Zusammenfassung)
  // Schlüssel: "roomId_storageTypeKey", Wert: { side1, side2, front, back }
  const [storageTypeSpacing, setStorageTypeSpacing] = useState<Record<string, { side1: number; side2: number; front: number; back: number }>>({});

  const handleSpacingChange = async (roomId: number, storageTypeName: string, field: string, value: number) => {
    const key = `${roomId}_${storageTypeName}`;
    const current = storageTypeSpacing[key] ?? { side1: 0, side2: 0, front: 0.65, back: 0 };
    const updated = { ...current, [field]: isNaN(value) ? 0 : value };
    setStorageTypeSpacing((prev) => ({ ...prev, [key]: updated }));

    // sofort in DB speichern
    await upsertKitchenSpacing({ roomId, storageTypeName, ...updated });
  };

  //Innentüren, Aussentüren, Durchgänge
  const [doorData, setDoorData] = useState<Record<number, {
    innentuer:  { quantity: number; width: number; depth: number; side1: number; side2: number; front: number; back: number };
    durchgang:  { quantity: number; width: number; depth: number; side1: number; side2: number; front: number; back: number };
    aussentuer: { quantity: number; width: number; depth: number; side1: number; side2: number; front: number; back: number };
  }>>({});

  const getDoorData = (roomId: number) => doorData[roomId] ?? {
    innentuer:  { quantity: 1, width: 1.25, depth: 0.80, side1: 0, side2: 0, front: 0.65, back: 0 },
    durchgang:  { quantity: 0, width: 2.80, depth: 0.80, side1: 0, side2: 0, front: 0.65, back: 0 },
    aussentuer: { quantity: 0, width: 1.25, depth: 0.80, side1: 0, side2: 0, front: 0.65, back: 0 },
  };

  const handleDoorChange = async (roomId: number, type: "innentuer" | "durchgang" | "aussentuer", field: string, value: number) => {
    const updated = {
      ...getDoorData(roomId),
      [type]: { ...getDoorData(roomId)[type], [field]: isNaN(value) ? 0 : value },
    };
    setDoorData((prev) => ({ ...prev, [roomId]: updated }));

    // sofort in DB speichern
    await upsertKitchenDoor({ roomId, type, ...updated[type] });
  };
  //Flächenberechnung für die Türen
  const calculateDoorArea = (data: { quantity: number; width: number; depth: number; side1: number; side2: number; front: number; back: number }) => {
    return data.quantity * (data.width + data.side1 + data.side2) * (data.depth + data.front + data.back);
  };

  //Gesamtflächen Küche (nach StorageTypes gruppiert)
  const calculateRoomTotal = (roomId: number) => {
    const byStorageType: Record<string, { totalWidth: number; totalDepth: number }> = {};

    const processItem = (quantity: number, width: number, depth: number, height: number, storageTypeName: string) => {
      if (!byStorageType[storageTypeName]) {
        byStorageType[storageTypeName] = { totalWidth: 0, totalDepth: 0 };
      }
      byStorageType[storageTypeName].totalWidth += quantity * width;
      byStorageType[storageTypeName].totalDepth = depth; // Tiefe ist immer gleich, kein summieren
    };

    for (const template of kitchenTemplates) {
      const key = `${roomId}_${template.id}`;
      const data = templateItemData[key] ?? {};
      const storageTypeName = kitchenStorageTypes.find(
        (st) => st.id === (data.storageTypeId ?? template.storageTypeId)
      )?.name ?? "";
      processItem(data.quantity ?? 0, data.width ?? 0, data.depth ?? 0, data.height ?? 0, storageTypeName);
    }

    for (const item of customItems[roomId] ?? []) {
      const storageTypeName = kitchenStorageTypes.find((st) => st.id === item.storageTypeId)?.name ?? "";
      processItem(item.quantity, item.width, item.depth, item.height, storageTypeName);
    }

    return { byStorageType };
  };

  // Flächenberechnung pro StorageType
  const calculateStorageTypeArea = (
    totalWidth: number,
    totalDepth: number,
    spacing: { side1: number; side2: number; front: number; back: number },
    storageTypeName: string
  ) => {
    if (storageTypeName === "Arbeitsplatte") return totalWidth * totalDepth;
    return (totalWidth + spacing.side1 + spacing.side2) * (totalDepth + spacing.front + spacing.back);
  };

  const tableHeader = (
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Anzahl</th>
        <th>Breite (m)</th>
        <th>Tiefe (m)</th>
        <th>Höhe (m)</th>
        <th>Position</th>
        <th>Fläche (m²)</th>
        <th>Volumen (m³)</th>
      </tr>
    </thead>
  );

  return (
    <div>
      <button onClick={() => navigate("/furniture", { state: { projectId } })}>
        Zurück zu Möbeln
      </button>

      <h1>Küche</h1>
      <p>Es wird nicht unterschieden nach Schubladen, Fachböden oder Auszügen. Das erfolgt bei der detaillierten Küchenplanung durch den Anbieter.</p>

      {kitchenRooms.length === 0 && <p>Keine Küchenräume gefunden.</p>}

      {/* Ebene 1: Räume */}
      {kitchenRooms.map((room) => (
        <section key={room.id}>
          <h2>{room.name} ({room.floor})</h2>

          
          {(() => {
            const { byStorageType } = calculateRoomTotal(room.id);

            // Gesamtfläche aus allen StorageTypes summieren
            const door = getDoorData(room.id);
            const innentuerArea = calculateDoorArea(door.innentuer);
            const durchgangArea = calculateDoorArea(door.durchgang);
            const aussentuerArea = calculateDoorArea(door.aussentuer);
            const totalArea = innentuerArea + aussentuerArea + durchgangArea + Object.entries(byStorageType).reduce((sum, [storageTypeName, values]) => {
              const spacingKey = `${room.id}_${storageTypeName}`;
              const spacing = storageTypeSpacing[spacingKey] ?? { side1: 0, side2: 0, front: 0.65, back: 0 };
              return sum + calculateStorageTypeArea(values.totalWidth, values.totalDepth, spacing, storageTypeName);
            }, 0);
            return (
              <div style={{ background: "#e8f4e8", padding: "12px", marginBottom: "16px", borderRadius: "4px" }}>
                {/* Gesamtfläche ganz oben */}
                <h3>Gesamtfläche: <strong>{totalArea.toFixed(2)} m²</strong></h3>

                <h4>Zusammenfassung</h4>
                <table border={1} cellPadding={6}>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Anzahl</th>
                      <th>Breite (m)</th>
                      <th>Tiefe (m)</th>
                      <th>Seitlich 1 (m)</th>
                      <th>Seitlich 2 (m)</th>
                      <th>Vorne (m)</th>
                      <th>Hinten (m)</th>
                      <th>Fläche (m²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "innentuer",  label: "Innentür",  area: innentuerArea },
                      { key: "durchgang",  label: "Durchgang", area: durchgangArea },
                      { key: "aussentuer", label: "Außentür",  area: aussentuerArea },
                    ].map(({ key, label, area }) => {
                      const type = key as "innentuer" | "durchgang" | "aussentuer";
                      const data = getDoorData(room.id)[type];
                      return (
                        <tr key={key}>
                          
                          <td>{label}</td>
                          <td>
                            <input type="number" min={0} value={data.quantity}
                              onChange={(e) => handleDoorChange(room.id, type, "quantity", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td>
                            <input type="number" min={0} step={0.01} value={data.width}
                              onChange={(e) => handleDoorChange(room.id, type, "width", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td>
                            <input type="number" min={0} step={0.01} value={data.depth}
                              onChange={(e) => handleDoorChange(room.id, type, "depth", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td>
                            <input type="number" min={0} step={0.01} value={data.side1}
                              onChange={(e) => handleDoorChange(room.id, type, "side1", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td>
                            <input type="number" min={0} step={0.01} value={data.side2}
                              onChange={(e) => handleDoorChange(room.id, type, "side2", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td>
                            <input type="number" min={0} step={0.01} value={data.front}
                              onChange={(e) => handleDoorChange(room.id, type, "front", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td>
                            <input type="number" min={0} step={0.01} value={data.back}
                              onChange={(e) => handleDoorChange(room.id, type, "back", Number(e.target.value))}
                              style={{ width: "60px" }} />
                          </td>
                          <td><strong>{area.toFixed(2)}</strong></td>
                        </tr>
                      );
                    })}
                    {Object.entries(byStorageType).map(([storageTypeName, values]) => {
                      const spacingKey = `${room.id}_${storageTypeName}`;
                      const spacing = storageTypeSpacing[spacingKey] ?? { side1: 0, side2: 0, front: 0.65, back: 0 };
                      const isArbeitsplatte = storageTypeName === "Arbeitsplatte";
                      const area = calculateStorageTypeArea(values.totalWidth, values.totalDepth, spacing, storageTypeName);

                      return (
                        <tr key={storageTypeName}>
                          <td>{storageTypeName}</td>
                          <td></td>
                          <td>{values.totalWidth.toFixed(2)}</td>
                          <td>{values.totalDepth.toFixed(2)}</td>
                          {isArbeitsplatte ? (
                            <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                              ist bei Kochinsel und Unterschränken gerechnet
                            </td>
                          ) : (
                            <>
                              <td>
                                <input type="number" min={0} step={0.01} value={spacing.side1 ?? 0}
                                  onChange={(e) => handleSpacingChange(room.id, storageTypeName, "side1", Number(e.target.value))}
                                  style={{ width: "60px" }} />
                              </td>
                              <td>
                                <input type="number" min={0} step={0.01} value={spacing.side2 ?? 0}
                                  onChange={(e) => handleSpacingChange(room.id, storageTypeName, "side2", Number(e.target.value))}
                                  style={{ width: "60px" }} />
                              </td>
                              <td>
                                <input type="number" min={0} step={0.01} value={spacing.front ?? 0}
                                  onChange={(e) => handleSpacingChange(room.id, storageTypeName, "front", Number(e.target.value))}
                                  style={{ width: "60px" }} />
                              </td>
                              <td>
                                <input type="number" min={0} step={0.01} value={spacing.back ?? 0}
                                  onChange={(e) => handleSpacingChange(room.id, storageTypeName, "back", Number(e.target.value))}
                                  style={{ width: "60px" }} />
                              </td>
                            </>
                          )}
                          <td><strong>{area.toFixed(2)}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

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
                          <td></td>
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
                          <td>
                            {calculateArea(
                              data.quantity ?? 0,
                              data.width ?? 0,
                              data.depth ?? 0,
                              kitchenStorageTypes.find((st) => st.id === (data.storageTypeId ?? template.storageTypeId))?.name ?? ""
                            ).toFixed(3)}
                          </td>
                          <td>
                            {calculateVolume(
                              data.quantity ?? 0,
                              data.width ?? 0,
                              data.depth ?? 0,
                              data.height ?? 0,
                              kitchenStorageTypes.find((st) => st.id === (data.storageTypeId ?? template.storageTypeId))?.name ?? ""
                            ).toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Eigene Geräte */}
                    {groupCustomItems.map((item) => (
                      <tr key={item.id} style={{ background: "#f5f5f5" }}>
                        <td>
                            <button onClick={() => handleDeleteCustomItem(room.id, item.id, item.customItemKey)}>
                              ✕
                            </button>
                          </td>
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
                        <td>
                          {calculateArea(
                            item.quantity,
                            item.width,
                            item.depth,
                            kitchenStorageTypes.find((st) => st.id === item.storageTypeId)?.name ?? ""
                          ).toFixed(3)}
                        </td>
                        <td>
                          {calculateVolume(
                            item.quantity,
                            item.width,
                            item.depth,
                            item.height,
                            kitchenStorageTypes.find((st) => st.id === item.storageTypeId)?.name ?? ""
                          ).toFixed(3)}
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
    </div>
  );
}