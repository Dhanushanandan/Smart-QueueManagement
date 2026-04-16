import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "@/app/Home";
import Queue from "@/app/Queue";
import Status from "@/app/Status";
import Login from "@/app/Login";
import Splash from "@/app";
import Signup from "@/app/Signup";
import UploadCertificate from "@/app/UploadCertificate";
import Dashboard from "@/app/Dashboard";
import Bookings from "@/app/Bookings";
import BookingDetail from "@/app/BookingDetail";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="SignupScreen" component={Signup} />
            <Stack.Screen name="UploadCertificate" component={UploadCertificate} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Queue" component={Queue} />
            <Stack.Screen name="Status" component={Status} />
            <Stack.Screen name="Bookings" component={Bookings} />
            <Stack.Screen name="BookingDetail" component={BookingDetail} />
        </Stack.Navigator>
    );
}