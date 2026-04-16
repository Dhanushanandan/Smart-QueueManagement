import { db } from '../config/firebase';

async function seedServices() {
    const services = [
        {
            name: 'NIC Application',
            category: 'Identity',
            department: {
                id: 'dept_1',
                name: 'Department of Registration of Persons'
            },
            location: {
                id: 'loc_1',
                name: 'Colombo Main Office',
                address: 'Battaramulla',
                city: 'Colombo'
            },
            description: 'Apply for a new National Identity Card',
            requirements: ['Birth Certificate', 'Photo'],
            estimatedTime: 30,
            payment: { required: true, amount: 500, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 120, slotDuration: 15 }
        },
        {
            name: 'Passport Application',
            category: 'Travel',
            department: {
                id: 'dept_2',
                name: 'Department of Immigration and Emigration'
            },
            location: {
                id: 'loc_2',
                name: 'Passport Office Colombo',
                address: 'Battaramulla',
                city: 'Colombo'
            },
            description: 'Apply for a new passport',
            requirements: ['NIC', 'Birth Certificate'],
            estimatedTime: 45,
            payment: { required: true, amount: 3500, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 150, slotDuration: 20 }
        },
        {
            name: 'Driving License Renewal',
            category: 'Transport',
            department: {
                id: 'dept_3',
                name: 'Department of Motor Traffic'
            },
            location: {
                id: 'loc_3',
                name: 'Werahera Office',
                address: 'Werahera',
                city: 'Colombo'
            },
            description: 'Renew your driving license',
            requirements: ['Old License', 'Medical Certificate'],
            estimatedTime: 25,
            payment: { required: true, amount: 1000, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 100, slotDuration: 10 }
        },
        {
            name: 'Birth Certificate Copy',
            category: 'Civil Records',
            department: {
                id: 'dept_4',
                name: 'Registrar General Department'
            },
            location: {
                id: 'loc_4',
                name: 'Colombo Registrar Office',
                address: 'D.R. Wijewardena Mawatha',
                city: 'Colombo'
            },
            description: 'Request a certified copy of birth certificate',
            requirements: ['Request Form'],
            estimatedTime: 20,
            payment: { required: true, amount: 100, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 200, slotDuration: 10 }
        },
        {
            name: 'Marriage Certificate Copy',
            category: 'Civil Records',
            department: {
                id: 'dept_4',
                name: 'Registrar General Department'
            },
            location: {
                id: 'loc_4',
                name: 'Colombo Registrar Office',
                address: 'D.R. Wijewardena Mawatha',
                city: 'Colombo'
            },
            description: 'Get a copy of marriage certificate',
            requirements: ['Marriage Details'],
            estimatedTime: 20,
            payment: { required: true, amount: 100, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 200, slotDuration: 10 }
        },
        {
            name: 'Vehicle Registration',
            category: 'Transport',
            department: {
                id: 'dept_3',
                name: 'Department of Motor Traffic'
            },
            location: {
                id: 'loc_3',
                name: 'Werahera Office',
                address: 'Werahera',
                city: 'Colombo'
            },
            description: 'Register a new vehicle',
            requirements: ['Invoice', 'Customs Documents'],
            estimatedTime: 60,
            payment: { required: true, amount: 5000, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 80, slotDuration: 30 }
        },
        {
            name: 'Police Clearance Certificate',
            category: 'Legal',
            department: {
                id: 'dept_5',
                name: 'Sri Lanka Police'
            },
            location: {
                id: 'loc_5',
                name: 'Police HQ',
                address: 'Colombo Fort',
                city: 'Colombo'
            },
            description: 'Apply for police clearance certificate',
            requirements: ['NIC', 'Application Form'],
            estimatedTime: 40,
            payment: { required: true, amount: 500, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 90, slotDuration: 15 }
        },
        {
            name: 'Taxpayer Registration',
            category: 'Finance',
            department: {
                id: 'dept_6',
                name: 'Inland Revenue Department'
            },
            location: {
                id: 'loc_6',
                name: 'IRD Colombo',
                address: 'Union Place',
                city: 'Colombo'
            },
            description: 'Register as a taxpayer',
            requirements: ['NIC', 'Proof of Address'],
            estimatedTime: 35,
            payment: { required: false },
            queueConfig: { enabled: true, maxDailySlots: 120, slotDuration: 15 }
        },
        {
            name: 'Business Registration',
            category: 'Business',
            department: {
                id: 'dept_7',
                name: 'Registrar of Companies'
            },
            location: {
                id: 'loc_7',
                name: 'ROC Office',
                address: 'Colombo 02',
                city: 'Colombo'
            },
            description: 'Register a new business',
            requirements: ['NIC', 'Business Name'],
            estimatedTime: 50,
            payment: { required: true, amount: 2000, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 70, slotDuration: 20 }
        },
        {
            name: 'Land Title Registration',
            category: 'Property',
            department: {
                id: 'dept_8',
                name: 'Land Registry'
            },
            location: {
                id: 'loc_8',
                name: 'Colombo Land Registry',
                address: 'Colombo',
                city: 'Colombo'
            },
            description: 'Register land ownership',
            requirements: ['Deed', 'Survey Plan'],
            estimatedTime: 90,
            payment: { required: true, amount: 3000, currency: 'LKR' },
            queueConfig: { enabled: true, maxDailySlots: 50, slotDuration: 30 }
        }
    ];

    try {
        for (const service of services) {
            await db.collection('services').add({
                ...service,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log('✅ Services seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding services:', error);
        process.exit(1);
    }
}

seedServices();