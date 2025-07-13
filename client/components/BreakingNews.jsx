import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedScrollHandler,
  scrollTo,
  useDerivedValue,
} from "react-native-reanimated";
import SliderItem from "./SliderItem";
import Paginations from "./Paginations";

const { width } = Dimensions.get("window");

const BreakingNews = ({ newsList = [] }) => {
  const [data, setData] = useState(newsList);
  const [paginationIndex, setPaginationIndex] = useState(0);

  const scrollX = useSharedValue(0);
  const offset = useSharedValue(0);
  const autoPlayRef = useRef(null);
  const flatListRef = useAnimatedRef();
  const isAutoPlay = useRef(true);

  // Scroll handler
  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      offset.value = event.contentOffset.x;
    },
  });

  // Auto-play effect
  useEffect(() => {
    function play() {
      offset.value = offset.value + width;
    }
    if (isAutoPlay.current) {
      autoPlayRef.current = setInterval(play, 3000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [offset]);

  // Drive scroll from offset
  useDerivedValue(() => {
    scrollTo(flatListRef, offset.value, 0, true);
  });

  // Viewability change
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setPaginationIndex(index % newsList.length);
    }
  }).current;

  const viewConfig = { itemVisiblePercentThreshold: 50 };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Breaking News</Text>
      <View style={styles.slideWrapper}>
        <Animated.FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(_, index) => `item-${index}`}
          renderItem={({ item, index }) => (
            <SliderItem slideItem={item} index={index} scrollX={scrollX} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.5}
          onEndReached={() => setData((prev) => [...prev, ...newsList])}
          viewabilityConfig={viewConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onScrollBeginDrag={() => {
            isAutoPlay.current = false;
            clearInterval(autoPlayRef.current);
          }}
          onScrollEndDrag={() => {
            isAutoPlay.current = true;
          }}
        />
        <Paginations
          items={newsList}
          paginationsIndex={paginationIndex}
          scrollX={scrollX}
        />
      </View>
    </View>
  );
};

export default BreakingNews;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
    marginLeft: 20,
  },
  slideWrapper: {
    justifyContent: "center",
  },
});
