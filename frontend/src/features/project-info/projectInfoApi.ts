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
}) {
  const res = await axios.post(`${API_URL}/kitchen/items`, data);
  return res.data;
}

//Lädt alle StorageTypes (Arbeitsplatte, Hochschrank, ...)
export async function getKitchenStorageTypes() {
  const res = await axios.get(`${API_URL}/kitchen/storage-types`);
  return res.data;
}

