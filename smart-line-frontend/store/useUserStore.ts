// import { create } from 'zustand';
// import { api } from '@/api/client';
// import {User, UserStore} from "@/types/types";
//
// const DEFAULT_TEST_UID = '3q1CMV99ByR9RnYadJSXOD6q05B2';
//
// const DUMMY_USER: User = {
//     uid: DEFAULT_TEST_UID,
//     name: 'Test User',
//     role: 'CITIZEN',
//     email: 'test@test.com',
//     mobile: '0000000000',
//     nic: '0000000000',
//     dob: '2000/01/01',
//     status: 'active',
//     step: 'testing'
// };
//
// export const useUserStore = create<UserStore>((set, get) => ({
//
//     userId: null,
//     user: null,
//     loading: false,
//
//     setUserIdAndLoadUser: async (userId: string) => {
//         set({ userId, loading: true });
//
//         try {
//             // ⚠️ IMPORTANT: you are currently passing token as userId
//             // Ideally backend should extract uid from token
//             const user = await api.getUser(userId);
//
//             set({
//                 user,
//                 userId: user.uid,
//                 loading: false
//             });
//
//         } catch (err) {
//             console.log("LOAD USER FAILED, USING DUMMY:", err);
//
//             set({
//                 user: DUMMY_USER,
//                 loading: false
//             });
//         }
//     },
//
//     // 🔥 LOAD USER (for app start / fallback)
//     loadUser: async (uid?: string) => {
//         const finalUid = uid || get().user?.uid || DEFAULT_TEST_UID;
//
//         set({ loading: true });
//
//         try {
//             const user = await api.getUser(finalUid);
//
//             set({
//                 user,
//                 userId: user.uid,
//                 loading: false
//             });
//
//         } catch (err) {
//             console.log("LOAD USER FAILED, USING DUMMY:", err);
//
//             set({
//                 user: DUMMY_USER,
//                 userId: DUMMY_USER.uid,
//                 loading: false
//             });
//         }
//     },
//
//     logout: () => set({
//         userId: null,
//         user: null
//     })
//
// }));