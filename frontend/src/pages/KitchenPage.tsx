import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createKitchenItem, getKitchenStorageTypes, getKitchenTemplates, getRooms } from "../features/project-info/projectInfoApi";

export default function KitchenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;

  const [kitchenTemplates, setKitchenTemplates] = useState<any[]>([]);
  const [kitchenRooms, setKitchenRooms] = useState<any[]>([]);

  //um eigene Küchengeräte anzulegen
  const [kitchenItems, setKitchenItems] = useState<any[]>([]);

  const [kitchenStorageTypes, setKitchenStorageTypes] = useState<any[]>([]);

  //damit Breite, Tiefe, Höhe der TemplateItems überschrieben werden können ohne sie im Template zu ändern
  const [templateItemData, setTemplateItemData] = useState<any>({});


  useEffect(() => {
    const fetch = async () => {
      const templates = await getKitchenTemplates();
      setKitchenTemplates(templates);

      //holt alle Positionen aus der DB ins Frontend (Arbeitsplatte, Hochschrank, ...) aus projectInfoApi.ts
      const storageTypes = await getKitchenStorageTypes();
        setKitchenStorageTypes(storageTypes);

      if (projectId) {
        const rooms = await getRooms(projectId, true, false);

        const filteredRooms = rooms.filter(
          (room: any) => room.template?.category?.key === "kitchen"
        );

        setKitchenRooms(filteredRooms);
      }
    };

    fetch();
  }, [projectId]);

    // eigene Küchengeräte hinzufügen
    const handleAddCustomKitchenItem = () => {
        setKitchenItems((prev) => [
            ...prev,
            {
            id: Date.now(),
            name: "",
            roomId: "",
            width: 0,
            depth: 0,
            height: 0,
            quantity: 1,
            storageTypeId: "",
            isCustom: true,
            },
        ]);
    };

    //Alle Änderungen speichern
    const handleSaveKitchenItems = async () => {
    for (const template of kitchenTemplates) {
        const data = templateItemData[template.id] || {};

        if (!data.roomId && kitchenRooms.length === 0) continue;

        await createKitchenItem({
        name: template.name,
        width: data.width ?? template.width ?? 0,
        depth: data.depth ?? template.depth ?? 0,
        height: data.height ?? template.height ?? undefined,
        quantity: data.quantity ?? 1,
        roomId: data.roomId,
        templateId: template.id,
        storageTypeId: data.storageTypeId ?? template.storageTypeId,
        });
    }

    for (const item of kitchenItems) {
        if (!item.name || !item.roomId || !item.storageTypeId) continue;

        await createKitchenItem({
        name: item.name,
        width: item.width,
        depth: item.depth,
        height: item.height || undefined,
        quantity: item.quantity,
        roomId: item.roomId,
        templateId: null,
        storageTypeId: item.storageTypeId,
        });
    }

    alert("Küchengeräte gespeichert");
    };


    //Hifsfunktion für Änderungen an Template-Geräten
    const handleTemplateItemChange = (
        templateId: number,
        field: string,
        value: any
        ) => {
        setTemplateItemData((prev: any) => ({
            ...prev,
            [templateId]: {
            ...prev[templateId],
            [field]: value,
            },
        }));
    };



  return (
    <div>
      <button
        onClick={() =>
          navigate("/furniture", {
            state: { projectId },
          })
        }
      >
        Zurück zu Möbeln
      </button>

      <h1>Küche</h1>

      <h2>Küchenräume</h2>
      {kitchenRooms.length === 0 && <p>Keine Küchenräume gefunden.</p>}

      <ul>
        {kitchenRooms.map((room) => (
          <li key={room.id}>
            {room.name} ({room.floor})
          </li>
        ))}
      </ul>

      <h2>Küchengeräte</h2>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Raum</th>
            <th>Anzahl</th>
            <th>Breite</th>
            <th>Tiefe</th>
            <th>Höhe</th>
            <th>Position</th>
          </tr>
        </thead>

        <tbody>
          {kitchenTemplates.map((template) => (
            <tr key={template.id}>
              <td>{template.name}</td>
              <td>
                <select
                    value={templateItemData[template.id]?.roomId ?? ""}
                    onChange={(e) =>
                        handleTemplateItemChange(template.id, "roomId", Number(e.target.value))
                    }
                    >
                    <option value="">-- Raum wählen --</option>
                    {kitchenRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                        {room.name} ({room.floor})
                        </option>
                    ))}
                </select>
                </td>
                <td>
                    <input
                        type="number"
                        min={1}
                        value={templateItemData[template.id]?.quantity ?? 1}
                        onChange={(e) =>
                        handleTemplateItemChange(template.id, "quantity", Number(e.target.value))
                        }
                    />
                </td>
              <td>
                <input
                    type="number"
                    value={templateItemData[template.id]?.width ?? template.width ?? 0}
                    onChange={(e) =>
                    handleTemplateItemChange(template.id, "width", Number(e.target.value))
                    }
                />
                </td>

                <td>
                <input
                    type="number"
                    value={templateItemData[template.id]?.depth ?? template.depth ?? 0}
                    onChange={(e) =>
                    handleTemplateItemChange(template.id, "depth", Number(e.target.value))
                    }
                />
                </td>

                <td>
                <input
                    type="number"
                    value={templateItemData[template.id]?.height ?? template.height ?? 0}
                    onChange={(e) =>
                    handleTemplateItemChange(template.id, "height", Number(e.target.value))
                    }
                />
                </td>
              <td>
                <select
                    value={templateItemData[template.id]?.storageTypeId ?? template.storageTypeId}
                    onChange={(e) =>
                        handleTemplateItemChange(
                        template.id,
                        "storageTypeId",
                        Number(e.target.value)
                        )
                    }
                    >
                    {kitchenStorageTypes.map((storageType) => (
                        <option key={storageType.id} value={storageType.id}>
                        {storageType.name}
                        </option>
                    ))}
                    </select>
                </td>
            </tr>
          ))}


          {kitchenItems.map((item) => (
            <tr key={item.id} style={{ background: "#f5f5f5" }}>
                <td>
                <input
                    value={item.name}
                    placeholder="Eigenes Gerät"
                    onChange={(e) =>
                    setKitchenItems((prev) =>
                        prev.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, name: e.target.value }
                            : currentItem
                        )
                    )
                    }
                />
                </td>

                <td>
                <select
                    value={item.roomId}
                    onChange={(e) =>
                    setKitchenItems((prev) =>
                        prev.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, roomId: Number(e.target.value) }
                            : currentItem
                        )
                    )
                    }
                >
                    <option value="">-- Raum wählen --</option>
                    {kitchenRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                        {room.name} ({room.floor})
                    </option>
                    ))}
                </select>
                </td>
                 <td>
                    <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                        setKitchenItems((prev) =>
                            prev.map((currentItem) =>
                            currentItem.id === item.id
                                ? { ...currentItem, quantity: Number(e.target.value) }
                                : currentItem
                            )
                        )
                        }
                    />
                    </td>   
                <td>
                <input
                    type="number"
                    value={item.width}
                    onChange={(e) =>
                    setKitchenItems((prev) =>
                        prev.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, width: Number(e.target.value) }
                            : currentItem
                        )
                    )
                    }
                />
                </td>

                <td>
                <input
                    type="number"
                    value={item.depth}
                    onChange={(e) =>
                    setKitchenItems((prev) =>
                        prev.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, depth: Number(e.target.value) }
                            : currentItem
                        )
                    )
                    }
                />
                </td>

                <td>
                <input
                    type="number"
                    value={item.height}
                    onChange={(e) =>
                    setKitchenItems((prev) =>
                        prev.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, height: Number(e.target.value) }
                            : currentItem
                        )
                    )
                    }
                />
                </td>

                <td>
                <select
                    value={item.storageTypeId}
                    onChange={(e) =>
                    setKitchenItems((prev) =>
                        prev.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, storageTypeId: Number(e.target.value) }
                            : currentItem
                        )
                    )
                    }
                >
                    <option value="">-- Position wählen --</option>
                    {kitchenStorageTypes.map((storageType) => (
                    <option key={storageType.id} value={storageType.id}>
                        {storageType.name}
                    </option>
                    ))}
                </select>
                </td>
            </tr>
            ))}

        </tbody>
      </table>
        <button onClick={handleAddCustomKitchenItem}>
            + Eigenes Küchengerät hinzufügen
        </button>
        <button onClick={handleSaveKitchenItems}>
            Speichern
        </button>

    </div>
  );
}
