import { db } from '../config/firebase';

function now(offset = 0) {
    return Date.now() + offset;
}

async function seedBookings() {

    const bookings = [
        // =========================
        // 🔥 REAL USER (your account)
        // =========================
        {
            id: 'b_user_main_1',
            userId: '3q1CMV99ByR9RnYadJSXOD6q05B2',
            queueId: 'q_nic_colombo_1',
            position: 13,
            status: 'WAITING',
            createdAt: now(-500000)
        },
        {
            id: 'b_user_main_2',
            userId: '3q1CMV99ByR9RnYadJSXOD6q05B2',
            queueId: 'q_passport_1',
            position: 9,
            status: 'WAITING',
            createdAt: now(-400000)
        },
        {
            id: 'b_user_main_3',
            userId: '3q1CMV99ByR9RnYadJSXOD6q05B2',
            queueId: 'q_vehicle_1',
            position: 16,
            status: 'WAITING',
            createdAt: now(-300000)
        },
        {
            id: 'b_user_main_4',
            userId: '3q1CMV99ByR9RnYadJSXOD6q05B2',
            queueId: 'q_birth_1',
            position: 5,
            status: 'WAITING',
            createdAt: now(-200000)
        },
        {
            id: 'b_user_main_5',
            userId: '3q1CMV99ByR9RnYadJSXOD6q05B2',
            queueId: 'q_business_1',
            position: 11,
            status: 'WAITING',
            createdAt: now(-100000)
        },

        // =========================
        // 👤 OTHER USERS
        // =========================

        {
            id: 'b_2',
            userId: 'user_1',
            queueId: 'q_nic_colombo_1',
            position: 14,
            status: 'WAITING',
            createdAt: now(-900000)
        },
        {
            id: 'b_3',
            userId: 'user_2',
            queueId: 'q_passport_1',
            position: 10,
            status: 'WAITING',
            createdAt: now(-880000)
        },
        {
            id: 'b_4',
            userId: 'user_3',
            queueId: 'q_vehicle_1',
            position: 17,
            status: 'WAITING',
            createdAt: now(-860000)
        },
        {
            id: 'b_5',
            userId: 'user_4',
            queueId: 'q_dl_1',
            position: 21,
            status: 'WAITING',
            createdAt: now(-840000)
        },
        {
            id: 'b_6',
            userId: 'user_5',
            queueId: 'q_tax_1',
            position: 3,
            status: 'WAITING',
            createdAt: now(-820000)
        },
        {
            id: 'b_7',
            userId: 'user_6',
            queueId: 'q_birth_2',
            position: 6,
            status: 'WAITING',
            createdAt: now(-800000)
        },
        {
            id: 'b_8',
            userId: 'user_7',
            queueId: 'q_business_1',
            position: 12,
            status: 'WAITING',
            createdAt: now(-780000)
        },
        {
            id: 'b_9',
            userId: 'user_8',
            queueId: 'q_land_1',
            position: 5,
            status: 'WAITING',
            createdAt: now(-760000)
        },
        {
            id: 'b_10',
            userId: 'user_9',
            queueId: 'q_police_1',
            position: 7,
            status: 'WAITING',
            createdAt: now(-740000)
        },
        {
            id: 'b_11',
            userId: 'user_10',
            queueId: 'q_nic_colombo_2',
            position: 6,
            status: 'WAITING',
            createdAt: now(-720000)
        },
        {
            id: 'b_12',
            userId: 'user_11',
            queueId: 'q_passport_2',
            position: 3,
            status: 'WAITING',
            createdAt: now(-700000)
        },
        {
            id: 'b_13',
            userId: 'user_12',
            queueId: 'q_dl_2',
            position: 11,
            status: 'WAITING',
            createdAt: now(-680000)
        },
        {
            id: 'b_14',
            userId: 'user_13',
            queueId: 'q_tax_2',
            position: 2,
            status: 'WAITING',
            createdAt: now(-660000)
        },
        {
            id: 'b_15',
            userId: 'user_14',
            queueId: 'q_vehicle_2',
            position: 6,
            status: 'WAITING',
            createdAt: now(-640000)
        },
        {
            id: 'b_16',
            userId: 'user_15',
            queueId: 'q_land_2',
            position: 4,
            status: 'WAITING',
            createdAt: now(-620000)
        },
        {
            id: 'b_17',
            userId: 'user_16',
            queueId: 'q_ird_1',
            position: 8,
            status: 'WAITING',
            createdAt: now(-600000)
        },
        {
            id: 'b_18',
            userId: 'user_17',
            queueId: 'q_motor_1',
            position: 19,
            status: 'WAITING',
            createdAt: now(-580000)
        },
        {
            id: 'b_19',
            userId: 'user_18',
            queueId: 'q_general_1',
            position: 2,
            status: 'WAITING',
            createdAt: now(-560000)
        }
    ];

    try {
        for (const booking of bookings) {
            await db.collection('bookings').doc(booking.id).set({
                ...booking
            });
        }

        console.log('✅ 20 bookings seeded successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding bookings:', error);
        process.exit(1);
    }
}

seedBookings();