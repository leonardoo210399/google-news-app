import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ScrollView,
  Text,
  ActivityIndicator,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { parse } from "fast-html-parser";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function ArticleDetail() {
  const { payload } = useLocalSearchParams();
  const item = JSON.parse(payload);
  const router = useRouter();

  // Bookmark state and handlers (assumes these come from context or props)
  const [bookmark, setBookmark] = useState(false);
  const saveBookmark = (id) => {
    // implement save logic
    setBookmark(true);
  };
  const removeBookmark = (id) => {
    // implement remove logic
    setBookmark(false);
  };

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState({
    authorName: "",
    authorAvatar: null,
    publishedAt: null,
    title: "",
    lead: "",
    audioDuration: null,
    views: "",
    coverImage: "",
    content: [],
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsChunks, setTtsChunks] = useState([]);
  const chunkIndexRef = useRef(0);
  const isTtsPausedRef = useRef(false);
  const timerRef = useRef(null);

  // Cleanup on blur/unmount
  useFocusEffect(
    useCallback(() => {
      return () => {
        Speech.stop();
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [])
  );

  // Estimate reading duration at ~150 wpm, return ms
  const estimateDurationMs = (text) => {
    const words = text.trim().split(/\s+/).length;
    const ms = Math.ceil((words / 150) * 60 * 1000);
    return ms;
  };

  const formatMillis = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Split text into sentence-like chunks for TTS
  const chunkText = (text) =>
    text.split(/(?<=[.?!])\s+/).filter((c) => c.length > 0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(item.titleUrl);
        const html = await res.text();
        await new Promise((r) => setTimeout(r, 500));

        // Extract <article>
        const bodyStart = html.indexOf("<body");
        const bodyOpen = html.indexOf(">", bodyStart);
        const bodyEnd = html.indexOf("</body>");
        const body =
          bodyStart > -1 && bodyEnd > -1
            ? html.substring(bodyOpen + 1, bodyEnd)
            : html;
        const start = body.indexOf('<article id="article-');
        const endTag = "</article>";
        const end = body.indexOf(endTag, start) + endTag.length;
        const snippet = start > -1 && end > start ? body.substring(start, end) : body;
        const root = parse(snippet);

        // Metadata
        const authorName = root.querySelector(".post-meta__author-name")?.text.trim() || "";
        let authorAvatar = null;
        root.querySelectorAll("img").forEach((img) => {
          if (
            !authorAvatar &&
            img.parentNode?.attributes.class?.includes("post-meta__author-avatar")
          ) {
            authorAvatar = img.attributes.src;
          }
        });
        let publishedAt = null;
        root.querySelectorAll("time").forEach((t) => {
          if (!publishedAt && t.attributes.datetime) publishedAt = t.attributes.datetime;
        });
        const title = (root.querySelector("h1.post__title")?.text.trim() || "") + ".";
        const lead = root.querySelector(".post__block_lead-text p")?.text.trim() || "";
        const coverImage = root.querySelector(".post-cover__image img")?.attributes.src || "";
        let views = "";
        root.querySelectorAll("span").forEach((sp) => {
          if (sp.attributes["data-testid"] === "post-views") views = sp.text.trim();
        });

        // Content
        const content = [];
        const pcNode = root.querySelector(".post-content");
        pcNode?.childNodes.forEach((node) => {
          if (node.tagName === "p") {
            const txt = node.text.trim();
            if (txt) content.push({ type: "text", text: txt });
          }
          if (node.tagName === "figure") {
            const img = node.querySelector("img");
            const cap = node.querySelector("figcaption");
            content.push({
              type: "image",
              src: img?.attributes.src || "",
              caption: cap?.text.trim() || "",
            });
          }
        });

        // Update article state
        const fullText = [
          title,
          lead,
          ...content.filter((c) => c.type === "text").map((c) => c.text),
        ].join(" ");
        const durationMs = estimateDurationMs(fullText);
        setArticle({
          authorName,
          authorAvatar,
          publishedAt,
          title,
          lead,
          audioDuration: formatMillis(durationMs),
          views,
          coverImage,
          content,
        });

        // Prepare TTS chunks
        const chunks = chunkText(fullText);
        setTtsChunks(chunks);
        chunkIndexRef.current = 0;
      } catch (e) {
        console.warn("Failed to load article:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [item.titleUrl]);

  // Speak the next TTS chunk, using utteranceId + onDone
  const speakNextChunk = () => {
    const idx = chunkIndexRef.current;
    console.log(`▶️ speakNextChunk called, idx = ${idx}`);

    if (idx < ttsChunks.length) {
      const text = ttsChunks[idx];
      console.log(`🗣️ speaking chunk[${idx}]:`, text);

      Speech.speak(text, {
        utteranceId: `chunk-${idx}`,
        onDone: (id) => {
          console.log(`✅ onDone utterance ${id}`);
          if (!isTtsPausedRef.current) {
            chunkIndexRef.current += 1;
            console.log(`🔜 incremented idx to ${chunkIndexRef.current}`);
            speakNextChunk();
          } else {
            console.log(`⏸ playback paused after utterance ${id}`);
          }
        },
        onError: (err) => {
          console.warn("❌ TTS error:", err);
        },
      });
    } else {
      console.log("🏁 all chunks done");
      setIsPlaying(false);
    }
  };

  // Play/pause toggle for TTS, with logging
  const handleListen = () => {
    if (isPlaying) {
      console.log(`⏸ handleListen(): pausing at chunk ${chunkIndexRef.current}`);
      isTtsPausedRef.current = true;
      Speech.stop();
      setIsPlaying(false);
    } else {
      console.log(`▶️ handleListen(): resuming at chunk ${chunkIndexRef.current}`);
      isTtsPausedRef.current = false;
      setIsPlaying(true);
      speakNextChunk();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator color="#FF9C01" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
            headerStyle: { backgroundColor: "#161622" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#CDCDE0" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                bookmark
                  ? removeBookmark(news[0].article_id)
                  : saveBookmark(news[0].article_id)
              }
            >
              <Ionicons
                name={bookmark ? "heart" : "heart-outline"}
                size={22}
                color={bookmark ? "#FF9C01" : "#CDCDE0"}
              />
            </TouchableOpacity>
          ),
          title: "",
        }}
      />
      <ScrollView className="bg-primary p-4">
        {/* Metadata */}
        <View className="flex-row items-center mb-4">
          {article.authorAvatar && (
            <Image
              source={{ uri: article.authorAvatar }}
              className="w-8 h-8 rounded-full mr-2 border border-secondary-100"
            />
          )}
          <Text className="text-sm font-pmedium text-gray-100">
            {article.authorName}
          </Text>
          {article.publishedAt && (
            <Text className="text-xs font-pregular text-gray-100 ml-2">
              {new Date(article.publishedAt).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Title & lead */}
        <Text className="text-3xl font-psemibold text-secondary mb-2">
          {article.title}
        </Text>
        <Text className="text-base font-pregular text-gray-100 mb-4">
          {article.lead}
        </Text>

        {/* Listen button */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={handleListen}
            className="bg-secondary px-4 py-2 rounded-full"
          >
            <Text className="text-sm font-pmedium text-black">
              {isPlaying ? "⏸️" : "▶️"} Listen {article.audioDuration}
            </Text>
          </TouchableOpacity>
          {article.views && (
            <Text className="text-sm font-pregular text-gray-100">
              👁️ {article.views}
            </Text>
          )}
        </View>

        {/* Cover image */}
        {article.coverImage && (
          <Image
            source={{ uri: article.coverImage }}
            className="w-full h-60 rounded-lg mb-6"
            resizeMode="cover"
          />
        )}

        {/* Content */}
        {article.content.map((block, idx) =>
          block.type === "text" ? (
            <Text
              key={idx}
              className="text-base font-pregular text-gray-100 mb-3"
            >
              {block.text}
            </Text>
          ) : (
            <View key={idx} className="mb-4">
              {block.src && (
                <Image
                  source={{ uri: block.src }}
                  className="w-full h-48 rounded-lg mb-2"
                  resizeMode="cover"
                />
              )}
              {block.caption && (
                <Text className="text-xs font-pregular text-gray-100 text-center">
                  {block.caption}
                </Text>
              )}
            </View>
          )
        )}
      </ScrollView>
    </>
  );
}
