// components/ArticleCard.jsx
import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";

const ArticleCard = ({ item }) => {
  const router = useRouter();
  // Destructure fields directly from item
  const {
    titleUrl,
    title,
    summary,
    imageUrl,
    author,
    datetime,
    categories = [],
  } = item;

  const publishedAt = new Date(datetime).toLocaleDateString();
  // encode the entire item as a URL-safe string
  const payload = encodeURIComponent(JSON.stringify(item));

  return (
    <View className="px-4 mb-8">
      {/* Article thumbnail still opens externally */}
      <TouchableOpacity
        onPress={() => Linking.openURL(titleUrl)}
        className="w-full h-60 rounded-xl overflow-hidden"
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Article details */}
      <View className="mt-3">
        <Text className="text-lg font-psemibold text-white" numberOfLines={2}>
          {title}
        </Text>
        {summary && (
          <Text
            className="text-sm font-pregular text-gray-100 mt-1"
            numberOfLines={2}
          >
            {summary}
          </Text>
        )}

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-xs font-pregular text-gray-400">
            {author} • {publishedAt}
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/raw/${payload}`)}
            className="px-2 py-1 border border-secondary rounded"
          >
            <Text className="text-xs font-pmedium text-secondary">Read</Text>
          </TouchableOpacity>
        </View>

        {categories.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {categories.map(
              (cat, i) =>
                (
                  <View
                    key={`${cat}-${i}`}
                    className="mr-2 mb-1 px-2 py-1 bg-gray-800 rounded"
                  >
                    <Text className="text-xs text-gray-300">{cat}</Text>
                  </View>
                )
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ArticleCard;
