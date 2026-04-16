import { db } from '../config/firebase';

async function seedQueues() {

    const queues = [
        {
            id: 'q_nic_colombo_1',
            serviceId: 'NIC Application',
            name: 'NIC Main Queue - Colombo 1',
            locationId: 'loc_1',
            departmentId: 'dept_1',
            currentNumber: 12,
            lastPosition: 35,
            estimatedWaitTime: 45,
            avgServiceTime: 4,
            status: 'active'
        },
        {
            id: 'q_nic_colombo_2',
            serviceId: 'NIC Application',
            name: 'NIC Fast Track Queue - Colombo',
            locationId: 'loc_1',
            departmentId: 'dept_1',
            currentNumber: 5,
            lastPosition: 18,
            estimatedWaitTime: 20,
            avgServiceTime: 3,
            status: 'active'
        },
        {
            id: 'q_passport_1',
            serviceId: 'Passport Application',
            name: 'Passport Queue - Main Hall',
            locationId: 'loc_2',
            departmentId: 'dept_2',
            currentNumber: 8,
            lastPosition: 30,
            estimatedWaitTime: 60,
            avgServiceTime: 6,
            status: 'active'
        },
        {
            id: 'q_passport_2',
            serviceId: 'Passport Application',
            name: 'Passport Priority Queue',
            locationId: 'loc_2',
            departmentId: 'dept_2',
            currentNumber: 2,
            lastPosition: 12,
            estimatedWaitTime: 25,
            avgServiceTime: 5,
            status: 'active'
        },
        {
            id: 'q_dl_1',
            serviceId: 'Driving License Renewal',
            name: 'DL Renewal Queue - Werahera',
            locationId: 'loc_3',
            departmentId: 'dept_3',
            currentNumber: 20,
            lastPosition: 50,
            estimatedWaitTime: 40,
            avgServiceTime: 3,
            status: 'active'
        },
        {
            id: 'q_dl_2',
            serviceId: 'Driving License Renewal',
            name: 'DL Medical Check Queue',
            locationId: 'loc_3',
            departmentId: 'dept_3',
            currentNumber: 10,
            lastPosition: 22,
            estimatedWaitTime: 25,
            avgServiceTime: 4,
            status: 'active'
        },
        {
            id: 'q_birth_1',
            serviceId: 'Birth Certificate Copy',
            name: 'Birth Certificate Queue',
            locationId: 'loc_4',
            departmentId: 'dept_4',
            currentNumber: 3,
            lastPosition: 40,
            estimatedWaitTime: 30,
            avgServiceTime: 2,
            status: 'active'
        },
        {
            id: 'q_birth_2',
            serviceId: 'Marriage Certificate Copy',
            name: 'Marriage Certificate Queue',
            locationId: 'loc_4',
            departmentId: 'dept_4',
            currentNumber: 1,
            lastPosition: 25,
            estimatedWaitTime: 20,
            avgServiceTime: 2,
            status: 'active'
        },
        {
            id: 'q_vehicle_1',
            serviceId: 'Vehicle Registration',
            name: 'Vehicle Registration Queue',
            locationId: 'loc_3',
            departmentId: 'dept_3',
            currentNumber: 15,
            lastPosition: 35,
            estimatedWaitTime: 90,
            avgServiceTime: 8,
            status: 'active'
        },
        {
            id: 'q_vehicle_2',
            serviceId: 'Vehicle Registration',
            name: 'Vehicle Import Queue',
            locationId: 'loc_3',
            departmentId: 'dept_3',
            currentNumber: 5,
            lastPosition: 18,
            estimatedWaitTime: 60,
            avgServiceTime: 7,
            status: 'active'
        },
        {
            id: 'q_police_1',
            serviceId: 'Police Clearance Certificate',
            name: 'Police Clearance Queue',
            locationId: 'loc_5',
            departmentId: 'dept_5',
            currentNumber: 6,
            lastPosition: 28,
            estimatedWaitTime: 35,
            avgServiceTime: 5,
            status: 'active'
        },
        {
            id: 'q_tax_1',
            serviceId: 'Taxpayer Registration',
            name: 'Tax Registration Queue',
            locationId: 'loc_6',
            departmentId: 'dept_6',
            currentNumber: 2,
            lastPosition: 20,
            estimatedWaitTime: 25,
            avgServiceTime: 5,
            status: 'active'
        },
        {
            id: 'q_tax_2',
            serviceId: 'Taxpayer Registration',
            name: 'Tax Consultation Queue',
            locationId: 'loc_6',
            departmentId: 'dept_6',
            currentNumber: 1,
            lastPosition: 10,
            estimatedWaitTime: 15,
            avgServiceTime: 4,
            status: 'active'
        },
        {
            id: 'q_business_1',
            serviceId: 'Business Registration',
            name: 'Business Registration Queue',
            locationId: 'loc_7',
            departmentId: 'dept_7',
            currentNumber: 9,
            lastPosition: 30,
            estimatedWaitTime: 55,
            avgServiceTime: 6,
            status: 'active'
        },
        {
            id: 'q_business_2',
            serviceId: 'Business Registration',
            name: 'Company Name Approval Queue',
            locationId: 'loc_7',
            departmentId: 'dept_7',
            currentNumber: 3,
            lastPosition: 15,
            estimatedWaitTime: 30,
            avgServiceTime: 5,
            status: 'active'
        },
        {
            id: 'q_land_1',
            serviceId: 'Land Title Registration',
            name: 'Land Registry Queue - Colombo',
            locationId: 'loc_8',
            departmentId: 'dept_8',
            currentNumber: 4,
            lastPosition: 22,
            estimatedWaitTime: 120,
            avgServiceTime: 10,
            status: 'active'
        },
        {
            id: 'q_land_2',
            serviceId: 'Land Title Registration',
            name: 'Land Verification Queue',
            locationId: 'loc_8',
            departmentId: 'dept_8',
            currentNumber: 2,
            lastPosition: 12,
            estimatedWaitTime: 80,
            avgServiceTime: 8,
            status: 'active'
        },
        {
            id: 'q_ird_1',
            serviceId: 'Taxpayer Registration',
            name: 'IRD Main Queue',
            locationId: 'loc_6',
            departmentId: 'dept_6',
            currentNumber: 7,
            lastPosition: 25,
            estimatedWaitTime: 40,
            avgServiceTime: 5,
            status: 'active'
        },
        {
            id: 'q_motor_1',
            serviceId: 'Driving License Renewal',
            name: 'Motor Traffic Main Queue',
            locationId: 'loc_3',
            departmentId: 'dept_3',
            currentNumber: 18,
            lastPosition: 45,
            estimatedWaitTime: 50,
            avgServiceTime: 4,
            status: 'active'
        },
        {
            id: 'q_general_1',
            serviceId: 'NIC Application',
            name: 'General Inquiry Queue - Colombo',
            locationId: 'loc_1',
            departmentId: 'dept_1',
            currentNumber: 1,
            lastPosition: 8,
            estimatedWaitTime: 10,
            avgServiceTime: 3,
            status: 'active'
        }
    ];

    try {
        for (const queue of queues) {
            await db.collection('queues').doc(queue.id).set({
                ...queue,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log('✅ 20 Queues seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding queues:', error);
        process.exit(1);
    }
}

seedQueues();