

const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

export default async function obtenerTasaDolar() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.promedio;
    } catch (error) {
        console.error('Error al obtener la tasa de cambio de dólar:', error);
        return null;
    }
}