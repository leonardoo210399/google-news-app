// app/index.jsx
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from "../components/CustomButton";
import { useGlobalContext } from "../context/GlobalProvider";

export default function Landing() {
  const { loading, isLogged } = useGlobalContext();
  const router = useRouter();

  // If already signed in, go straight to home
  if (!loading && isLogged) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full flex-1 justify-center items-center px-4">
          <Image
            source={images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />

          <Text className="text-3xl text-white font-bold text-center mt-8">
            Welcome to{"\n"}
            <Text className="text-secondary-200">Crypto News</Text>
          </Text>

          <Text className="text-sm text-gray-100 mt-4 text-center">
            Stay ahead with real-time updates on all your favorite cryptocurrencies.
          </Text>

          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-10"
          />
        </View>
      </ScrollView>

      <StatusBar style="light" backgroundColor="#161622" />
    </SafeAreaView>
  );
}
