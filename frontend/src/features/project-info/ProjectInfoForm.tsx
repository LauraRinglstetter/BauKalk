import { useState, useEffect } from "react";
import { createProjectInfo, getProjectInfo } from "./projectInfoApi";

export function ProjectInfoForm(){
    const [persons, setPersons] = useState(2);
    const [floors, setFloors] = useState(1);
    const [houseType, setHouseType] = useState("Einfamilienhaus");

    useEffect(() => {
        const fetchData = async () => {
            try {
            const data = await getProjectInfo();

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
        const data = { persons, floors, houseType };

        try {
            const res = await createProjectInfo(data);
            console.log("Gespeichert:", res);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1> Projekt-Informationen</h1>
            <p> Allgemeine Angaben zum Projekt </p>

            <input
                type="number"
                value={persons}
                onChange={(e) => setPersons(Number(e.target.value))}
            />
            <input 
                type="number"
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
            />

            <select value={houseType} onChange={(e) => setHouseType(e.target.value)}>
                <option>Einfamilienhaus</option>
                <option>Doppelhaus</option>
                <option>Reihenhaus</option>
            </select>

            <button onClick={handleSubmit}>Speichern</button>
        </div>
    );
}