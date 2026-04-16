/* =========================================================
   👤 LOCAL USER
   ========================================================= */

export type UserStore = {
    userId: string | null;
    user: User | null;
    loading: boolean;

    setUserIdAndLoadUser: (userId: string) => Promise<void>;
    loadUser: (uid?: string) => Promise<void>;
    logout: () => void;
};



export type BookingStatus = 'WAITING' | 'SERVED' | 'CANCELLED';

/* =========================================================
   👤 USER
   ========================================================= */
export type User = {
    uid: string | null;
    name: string | null;
    role: 'ADMIN' | 'TELLER' | 'CITIZEN';
    email: string | null;
    mobile: string | null;
    nic: string | null;
    dob: string | null;
    status: string | null;
    step: string | null;
};

export type PendingUserPayload = {
    nic: string | null;
    name: string | null;
    dob: string | null;
    email: string | null;
    mobile: string | null;
};

/* =========================================================
   🏢 SERVICE
   ========================================================= */
export interface Department {
    id: string;
    name: string;
}

export interface Location {
    id: string;
    name: string;
    address: string;
    city: string;
}

export interface Service {
    id: string;
    name: string;
    category: string;

    department: Department;
    location: Location;

    description?: string;
    requirements?: string[];
    estimatedTime?: number;

    payment?: {
        required: boolean;
        amount?: number;
        currency?: string;
    };

    queueConfig?: {
        enabled: boolean;
        maxDailySlots?: number;
        slotDuration?: number;
    };

    createdAt: {
        _seconds: number;
        _nanoseconds: number;
    };

    updatedAt: {
        _seconds: number;
        _nanoseconds: number;
    }
}

/* =========================================================
   🎟️ QUEUE
   ========================================================= */
export interface Queue {
    id: string;

    serviceId: string;
    name: string;

    locationId: string;
    departmentId: string;

    currentNumber: number;
    lastPosition: number;

    estimatedWaitTime: number;

    avgServiceTime?: number;
    status?: 'active' | 'paused' | 'closed';

    createdAt: {
        _seconds: number;
        _nanoseconds: number;
    };

    updatedAt: {
        _seconds: number;
        _nanoseconds: number;
    }

    queueLength?: number;
}

/* =========================================================
   🎫 BOOKING
   ========================================================= */
export interface Booking {
    id: string;
    userId: string;
    queueId: string;

    position: number;
    status: BookingStatus;

    createdAt: string; // ISO string for frontend safety
}

export interface BookingStat {
    bookingId: string;
    queueId: string;

    position: number;
    peopleAhead: number
    currentNumber: number
    isYourTurn: boolean;

    estimatedWaitTime: number;
    status: BookingStatus;

    message: string;
}

/* =========================================================
   🎫 JOIN QUEUE RESPONSE
   ========================================================= */
export interface JoinQueueResponse {
    id: string;
    userId: string;
    queueId: string;

    position: number;
    status: BookingStatus;

    createdAt: string;
    message: string;
}

/* =========================================================
   📊 DASHBOARD
   ========================================================= */
export interface DashboardStats {
    totalServices: number;
    totalDepartments: number;
    totalLocations: number;
}

/* =========================================================
   🎟️ QUEUE POSITION RESPONSE
   ========================================================= */
export interface MyPositionResponse {
    bookingId: string;
    queueId: string;

    position: number;
    currentNumber: number;

    peopleAhead: number;
    estimatedWaitTime: number;

    isMyTurn: boolean;
    message: string;

    status: BookingStatus;
}

/* =========================================================
   📦 API WRAPPER TYPES
   ========================================================= */
export type Services = Service[];
export type Bookings = Booking[];
export type BookingsStat = BookingStat[];

export type BookingWaitingCount =  number;