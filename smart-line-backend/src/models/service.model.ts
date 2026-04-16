export interface Service {
    id: string;                 // Firestore doc ID

    name: string;               // "NIC Application"
    category: string;           // "Identity", "Transport", etc.

    department: {
        id: string;
        name: string;           // "Department of Registration of Persons"
    };

    location: {
        id: string;
        name: string;           // "Colombo Main Office"
        address: string;
        city: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };

    description?: string;       // Steps / overview of process

    requirements?: string[];    // Required documents
    estimatedTime: number;     // in minutes

    payment: {
        required: boolean;
        amount?: number;
        currency?: string;      // "LKR"
    };

    queueConfig: {
        enabled: boolean;
        maxDailySlots?: number;
        slotDuration?: number;  // minutes per booking
    };

    createdAt: Date;
    updatedAt: Date;
}