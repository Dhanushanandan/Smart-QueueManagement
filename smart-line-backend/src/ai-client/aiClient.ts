export const getPredictionWithService = async (
    queueLength: number,
    service: any
) => {

    const res = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            queueLength,
            category: service.category,
            estimatedTime: service.estimatedTime
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Prediction failed');
    }

    return data.estimatedWaitTime;
};