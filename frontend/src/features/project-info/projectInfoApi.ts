import axios from "axios";

const API_URL = "http://localhost:3000/project-info";

export async function createProjectInfo(data: {
    persons: number;
    floors: number;
    houseType: string;
}) {
    const response = await axios.post(API_URL, data);
    return response.data;
}

export async function getProjectInfo() {
    const response = await axios.get(API_URL);
    return response.data;
}