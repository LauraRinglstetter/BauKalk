import axios from "axios";

const API_URL = "http://localhost:3000";

export async function createProjectInfo(data: {
    persons: number;
    floors: string[]; 
    houseType: string;
    projectId: number;
}) {
    const response = await axios.post(`${API_URL}/project-info`, data);
    return response.data;
}
export async function getProjects() {
  const res = await axios.get(`${API_URL}/project`);
  return res.data;
}

export async function getProjectInfo(projectId: number) {
    const response = await axios.get(
        `${API_URL}/project-info/${projectId}`
    );
    return response.data;
}
export async function createProject(name: string) {
  const res = await axios.post(`${API_URL}/project`, {
    name,
  });
  return res.data;
}

export async function getRoomCategories() {
  const res = await axios.get(`${API_URL}/room-categories`);
  return res.data;
}
export async function createRoom(data: {
  name: string;
  floor: string;
  note?: string;
  templateId?: number;
  projectId: number;
}) {
  const res = await axios.post(`${API_URL}/rooms`, data);
  return res.data;
}
export async function createCustomRoom(data: {
  name: string;
  floor: string;
  note?: string;
  projectId: number;
}) {
  const res = await axios.post(`${API_URL}/rooms/custom`, data);
  return res.data;
}

export async function deleteCustomRoom(id: number) {
  const res = await axios.delete(`${API_URL}/rooms/${id}`);
  return res.data;
}

// für eigene bereits gespeicherte Räume, die danach geändert werden
export async function updateCustomRoom(id: number, data: { name: string; floor: string; note?: string }) {
  const res = await axios.patch(`${API_URL}/rooms/${id}`, data);
  return res.data;
}

export async function getRooms(
  projectId: number,
  includeCategory = false,
  includeFurniture = false
) {
  const res = await axios.get(
    `${API_URL}/rooms?projectId=${projectId}&includeCategory=${includeCategory}&includeFurniture=${includeFurniture}`
  );
  return res.data;
}

export async function getKitchenTemplates() {
  const res = await axios.get(`${API_URL}/kitchen/templates`);
  return res.data;
}

//Frontend-API-Funktion zum Speichern eines KitchenItems
export async function createKitchenItem(data: {
  name: string;
  width: number;
  depth: number;
  height?: number;
  quantity: number;
  roomId: number;
  templateId?: number | null;
  storageTypeId: number;
  group?: string;
  customItemKey?: string;
}) {
  const res = await axios.post(`${API_URL}/kitchen/items`, data);
  return res.data;
}

//API-Funktion zum Löschen eines CustomKitchenItems
export async function deleteCustomKitchenItem(customItemKey: string) {
  const res = await axios.delete(`${API_URL}/kitchen/items/custom/${customItemKey}`);
  return res.data;
}

//Lädt alle StorageTypes (Arbeitsplatte, Hochschrank, ...)
export async function getKitchenStorageTypes() {
  const res = await axios.get(`${API_URL}/kitchen/storage-types`);
  return res.data;
}

// holt gespeicherte Änderungen an den KitchenTemplates
export async function getKitchenItems(projectId: number) {
  const res = await axios.get(`${API_URL}/kitchen/items/${projectId}`);
  return res.data;
}

export async function upsertKitchenDoor(data: {
  roomId: number; type: string; quantity: number;
  width: number; depth: number; side1: number; side2: number; front: number; back: number;
}) {
  const res = await axios.post(`${API_URL}/kitchen/doors`, data);
  return res.data;
}

export async function upsertKitchenSpacing(data: {
  roomId: number; storageTypeName: string;
  side1: number; side2: number; front: number; back: number;
}) {
  const res = await axios.post(`${API_URL}/kitchen/spacing`, data);
  return res.data;
}

export async function getKitchenDoors(roomId: number) {
  const res = await axios.get(`${API_URL}/kitchen/doors/${roomId}`);
  return res.data;
}

export async function getKitchenSpacing(roomId: number) {
  const res = await axios.get(`${API_URL}/kitchen/spacing/${roomId}`);
  return res.data;
}