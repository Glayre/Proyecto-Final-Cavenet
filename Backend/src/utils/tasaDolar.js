

// const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';
const API_URL = 'https://api.dolarvzla.com/public/exchange-rate';

export default async function obtenerTasaDolar() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // return data.promedio;
        return data.current.usd;
    } catch (error) {
        console.error('Error al obtener la tasa de cambio de dólar:', error);
        return null;
    }
}