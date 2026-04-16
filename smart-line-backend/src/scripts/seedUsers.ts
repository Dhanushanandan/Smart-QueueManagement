import { db } from '../config/firebase';

function now(offset = 0) {
    return Date.now() + offset;
}

async function seedUsers() {

    const users = [
        {
            uid: 'user_1',
            name: 'Kasun Perera',
            email: 'kasun1@gmail.com',
            nic: '200112345678',
            mobile: '0711111111',
            dob: '2001/03/12',
            role: 'CITIZEN',
            status: 'active',
            step: 'certificate_saved',

            createdAt: now(-1000000),
            certificateSavedAt: now(-800000),
            finalizedAt: now(-700000),

            certificateDetails: {
                name: 'Kasun Perera',
                dateOfBirth: '2001/03/12',
                district: 'Colombo',
                fatherName: 'Nimal Perera',
                motherName: 'Sunitha Perera',
                placeOfBirth: 'Colombo',
                serialNo: 'NIC001',
                sex: 'male',
                rawText: 'ok'
            }
        },

        {
            uid: 'user_2',
            name: 'Nimal Jayasinghe',
            email: 'nimal2@gmail.com',
            nic: '200212345679',
            mobile: '0722222222',
            dob: '2002/07/21',
            role: 'CITIZEN',
            status: 'active',
            step: 'certificate_saved',

            createdAt: now(-900000),
            certificateSavedAt: now(-700000),
            finalizedAt: now(-600000),

            certificateDetails: {
                name: 'Nimal Jayasinghe',
                dateOfBirth: '2002/07/21',
                district: 'Gampaha',
                fatherName: 'Ranjith Jayasinghe',
                motherName: 'Chandani Jayasinghe',
                placeOfBirth: 'Gampaha',
                serialNo: 'NIC002',
                sex: 'male',
                rawText: 'ok'
            }
        },

        {
            uid: 'user_3',
            name: 'Tharushi Fernando',
            email: 'tharushi3@gmail.com',
            nic: '200312345670',
            mobile: '0743333333',
            dob: '2003/11/05',
            role: 'CITIZEN',
            status: 'active',
            step: 'certificate_saved',

            createdAt: now(-800000),
            certificateSavedAt: now(-600000),
            finalizedAt: now(-500000),

            certificateDetails: {
                name: 'Tharushi Fernando',
                dateOfBirth: '2003/11/05',
                district: 'Kalutara',
                fatherName: 'Sunil Fernando',
                motherName: 'Nadeeka Fernando',
                placeOfBirth: 'Kalutara',
                serialNo: 'NIC003',
                sex: 'female',
                rawText: 'ok'
            }
        }
    ];

    // 🔥 auto generate remaining 17 users
    for (let i = 4; i <= 20; i++) {
        users.push({
            uid: `user_${i}`,
            name: `User ${i}`,
            email: `user${i}@gmail.com`,
            nic: `2000${100000 + i}`,
            mobile: `07${i}0000000`,
            dob: `200${i % 9}-01-01`,
            role: 'CITIZEN',
            status: 'active',
            step: 'certificate_saved',

            createdAt: now(-i * 100000),
            certificateSavedAt: now(-i * 90000),
            finalizedAt: now(-i * 80000),

            certificateDetails: {
                name: `User ${i}`,
                dateOfBirth: `200${i % 9}-01-01`,
                district: i % 2 === 0 ? 'Colombo' : 'Gampaha',
                fatherName: 'Unknown',
                motherName: 'Unknown',
                placeOfBirth: 'Sri Lanka',
                serialNo: `NIC00${i}`,
                sex: i % 2 === 0 ? 'male' : 'female',
                rawText: 'auto generated'
            }
        });
    }

    try {
        for (const user of users) {
            await db.collection('users').doc(user.uid).set({
                ...user
            });
        }

        console.log('✅ 20 users seeded successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();