import {
    Bookings, BookingsStat, DashboardStats,
    JoinQueueResponse,
    Services,
    User,
    Queue,
    Service
} from "@/types/types";

const BASE_URL = 'http://192.168.1.3:5000/api';

async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data as T;
}


export const api = {

    // ── Auth ──────────────────────────────────────────────
    checkUserNode: (token: string) =>
        request('/auth/check-user-node', { method: 'POST' }, token),

    finalizeUser: (token: string) =>
        request('/auth/finalize-user', { method: 'POST' }, token),

    checkPendingEmail: (email: string) =>
        request('/auth/check-pending-email', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    savePendingUser: (
        token: string,
        payload: {
            nic: string;
            role: string;
            name: string;
            dob: string;
            email: string;
            mobile: string;
        },
    ) =>
        request(
            '/auth/save-pending-user',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
            token
        ),

    uploadCertificate: (token: string, imageBase64: string) =>
        request(
            '/auth/upload-certificate',
            {
                method: 'POST',
                body: JSON.stringify({ imageBase64 }),
            },
            token
        ),

    saveCertificateDetails: (token: string, formData: Record<string, string>) =>
        request(
            '/auth/save-certificate-details',
            {
                method: 'POST',
                body: JSON.stringify(formData),
            },
            token
        ),


    // ── Users ─────────────────────────────────────────────
    getUser: (userId: string) =>
        request<User>(`/users/${userId}`, { method: 'GET' }),


    // ── Services ─────────────────────────────────────────────
    getServices: () =>
        request<Services>('/services', { method: 'GET' }),

    getServicesById: (serviceId: string) =>
        request<Service>(`/services/${serviceId}`, { method: 'GET' }),

    /**
     * FILTER SERVICES
     * QUERY:
     *  - locationId?
     *  - departmentId?
     *  - category?
     *
     * OUTPUT:
     *  - Service[]
     */
    getFilteredServices: (params?: {
        locationId?: string;
        departmentId?: string;
        category?: string;
    }) => {
        const query = new URLSearchParams(params as any).toString();
        return request(`/services/filter?${query}`, { method: 'GET' });
    },


    // ── Queue ─────────────────────────────────────────────
    getQueueById: (queueId: string) =>
        request<Queue>(`/queues/${queueId}`, { method: 'GET' }),

    getQueues: () =>
        request('/queues', { method: 'GET' }),

    /**
     * GET QUEUES BY SERVICE
     * INPUT: serviceId
     * OUTPUT: Queue[]
     */
    getQueueByService: (serviceId: string) =>
        request(`/queues/service/${serviceId}`, { method: 'GET' }),

    /**
     * FILTER QUEUES
     * QUERY:
     *  - locationId
     *  - departmentId
     *  - serviceId
     *
     * OUTPUT:
     *  - Queue[]
     */
    getFilteredQueues: (params: {
        locationId?: string;
        departmentId?: string;
        serviceId?: string;
    }) => {
        const query = new URLSearchParams(params as any).toString();
        return request<Queue[]>(`/queues/filter?${query}`, { method: 'GET' });
    },

    /**
     * GET MY POSITION IN QUEUE
     * INPUT:
     *  - userId
     *  - queueId
     *
     * OUTPUT:
     * {
     *   position,
     *   peopleAhead,
     *   estimatedWaitTime,
     *   isMyTurn
     * }
     */
    getMyPosition: (userId: string, queueId: string) =>
        request(`/queues/my-position?userId=${userId}&queueId=${queueId}`, {
            method: 'GET'
        }),


    // ── Queue action ─────────────────────────────────────────────

    nextQueue: (queueId: string) =>
        request(`/queues/${queueId}/next`, { method: 'POST' }),

    createQueue: (payload: any) =>
        request(`/queues/create`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),


    // ── Booking ─────────────────────────────────────────────
    joinQueue: (userId: string, queueId: string) =>
        request<JoinQueueResponse>('/bookings/join', {
            method: 'POST',
            body: JSON.stringify({ userId, queueId }),
        }),

    getStatus: (userId: string) =>
        request<BookingsStat>(`/bookings/status/${userId}`, { method: 'GET' }),

    getMyBookings: (userId: string) =>
        request<Bookings>(`/bookings/my/${userId}`, { method: 'GET' }),

    getBookingsWatingCount: (userId: string) =>
        request<number>(`/bookings/waiting-count/${userId}`, { method: 'GET' }),

    cancelBooking: (bookingId: string) =>
        request(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }),


    // ── Dashboard ─────────────────────────────────────────────
    getDashboardStats: () =>
        request<DashboardStats>('/dashboards/stats', { method: 'GET' }),


    // ── Users(not used) ─────────────────────────────────────────────
    getUsers: () =>
        request<User[]>('/users', { method: 'GET' }),

    getUserById: (id: string) =>
        request<User>(`/users/${id}`, { method: 'GET' }),

};