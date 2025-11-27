import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { borderRadius, colors, fonts } from "@/theme/theme";

const ITEM_HEIGHT = 48; // slightly larger touch target
const VISIBLE_COUNT = 3; // show only 3 items (up, middle, down)
const SCREEN_WIDTH = Dimensions.get("window").width;

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

type Props = {
  visible: boolean;
  initialDate?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export default function DatePickerModal({
  visible,
  initialDate = new Date(),
  onClose,
  onConfirm,
}: Props) {

  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate() - 1);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [years, setYears] = useState<number[]>([]);
  const [daysInMonthCount, setDaysInMonthCount] = useState<number>(31);

  const monthRef = useRef<ScrollView | null>(null);
  const dayRef = useRef<ScrollView | null>(null);
  const yearRef = useRef<ScrollView | null>(null);

  // build years array and set initial selected index based on initialDate
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const arr: number[] = [];
    for (let i = currentYear - 100; i <= currentYear; i++) arr.push(i);
    setYears(arr);

    const initialIndex = arr.indexOf(initialDate.getFullYear());
    setSelectedYear(initialIndex >= 0 ? initialIndex : arr.length - 1);
    // set month/day from initialDate (keep zero-based day)
    setSelectedMonth(initialDate.getMonth());
    setSelectedDay(initialDate.getDate() - 1);
  }, [initialDate]);

  // padding so selected item centers: half of visible items (above + below)
  const sidePadding = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

  // compute days in month
  const getDaysInMonth = (year: number, monthZeroBased: number) => {
    // monthZeroBased 0..11
    return new Date(year, monthZeroBased + 1, 0).getDate();
  };

  // update days in month whenever month/year changes
  useEffect(() => {
    if (!years.length) return;
    const yearValue = years[selectedYear] ?? new Date().getFullYear();
    const count = getDaysInMonth(yearValue, selectedMonth);
    setDaysInMonthCount(count);

    // clamp selectedDay if out of range
    if (selectedDay > count - 1) {
      const clamped = count - 1;
      setSelectedDay(clamped);
      // reposition day wheel to clamped value
      setTimeout(() => {
        dayRef.current?.scrollTo?.({ y: clamped * ITEM_HEIGHT + sidePadding, animated: true });
      }, 0);
    }
  }, [selectedMonth, selectedYear, years]);

  // when years/selected indexes change or modal opens, position scrolls to center item
  useEffect(() => {
    if (!visible) return;
    // allow layout to settle
    setTimeout(() => {
      monthRef.current?.scrollTo?.({ y: selectedMonth * ITEM_HEIGHT + sidePadding, animated: false });
      // ensure day index does not exceed available days
      const dayIndex = Math.min(selectedDay, daysInMonthCount - 1);
      dayRef.current?.scrollTo?.({ y: dayIndex * ITEM_HEIGHT + sidePadding, animated: false });
      yearRef.current?.scrollTo?.({ y: selectedYear * ITEM_HEIGHT + sidePadding, animated: false });
    }, 0);
  }, [visible, selectedMonth, selectedDay, selectedYear, years, daysInMonthCount]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const snapTo = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    ref: React.RefObject<ScrollView | null>,
    maxIndex: number,
    apply: (i: number) => void
  ) => {
    const offset = e.nativeEvent.contentOffset.y;
    // convert offset to zero-based item index by removing the top padding
    const rawIndex = Math.round((offset - sidePadding) / ITEM_HEIGHT);
    const index = clamp(rawIndex, 0, maxIndex);
    apply(index);
    // scroll to the actual offset (index * ITEM_HEIGHT + sidePadding)
    ref.current?.scrollTo({ y: index * ITEM_HEIGHT + sidePadding, animated: true });
  };

  // new: tap-to-select handlers for visible items
  const selectMonth = (i: number) => {
    setSelectedMonth(i);
    monthRef.current?.scrollTo?.({ y: i * ITEM_HEIGHT + sidePadding, animated: true });
    // days will update via useEffect
  };

  const selectDay = (i: number) => {
    const max = Math.max(1, daysInMonthCount);
    const idx = clamp(i, 0, max - 1);
    setSelectedDay(idx);
    dayRef.current?.scrollTo?.({ y: idx * ITEM_HEIGHT + sidePadding, animated: true });
  };

  const selectYear = (i: number) => {
    setSelectedYear(i);
    yearRef.current?.scrollTo?.({ y: i * ITEM_HEIGHT + sidePadding, animated: true });
    // days may update via useEffect (clamp handled there)
  };

  const confirm = () => {
    const y = years[selectedYear];
    const m = selectedMonth;
    const d = Math.min(selectedDay + 1, getDaysInMonth(y, m));
    const result = new Date(y, m, d);
    // Avoid timezone-related off-by-one by setting to midday local time
    result.setHours(12, 0, 0, 0);
    onConfirm(result);
    onClose();
  };

  const containerHeight = ITEM_HEIGHT * VISIBLE_COUNT;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      <View style={[styles.modal, { height: Math.max(250, containerHeight + 160) }]}>
        <Text style={styles.header}>Select Date</Text>

        <View style={[styles.wheelsContainer, { height: containerHeight }]}>
          {/* MONTHS */}
          <ScrollView
            ref={monthRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            snapToAlignment="center"
            // smoother deceleration + more frequent scroll events for fluid snapping
            decelerationRate={0.9}
            scrollEventThrottle={8}
            onMomentumScrollEnd={(e) => snapTo(e, monthRef, months.length - 1, setSelectedMonth)}
            contentContainerStyle={{
                paddingTop: sidePadding,
                paddingBottom: sidePadding,
            }}
              style={{ flex: 1 }}
          >
            {months.map((m, i) => {
              const active = i === selectedMonth;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.7}
                  onPress={() => selectMonth(i)}
                  style={styles.item}
                >
                  <Text style={[styles.itemText, active && styles.itemTextActive]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* DAYS */}
          <ScrollView
            ref={dayRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            snapToAlignment="center"
            decelerationRate={0.9}
            scrollEventThrottle={8}
            onMomentumScrollEnd={(e) => snapTo(e, dayRef, Math.max(0, daysInMonthCount - 1), setSelectedDay)}
            contentContainerStyle={{
                paddingTop: sidePadding,
                paddingBottom: sidePadding,
            }}
              style={{ flex: 1 }}
          >
            {Array.from({ length: daysInMonthCount }).map((_, i) => {
              const active = i === selectedDay;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.7}
                  onPress={() => selectDay(i)}
                  style={styles.item}
                >
                  <Text style={[styles.itemText, active && styles.itemTextActive]}>{i + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* YEARS */}
          <ScrollView
            ref={yearRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            snapToAlignment="center"
            decelerationRate={0.9}
            scrollEventThrottle={8}
            onMomentumScrollEnd={(e) => snapTo(e, yearRef, Math.max(0, years.length - 1), setSelectedYear)}
            contentContainerStyle={{
                paddingTop: sidePadding,
                paddingBottom: sidePadding,
            }}
              style={{ flex: 1 }}
          >
            {years.map((y, i) => {
              const active = i === selectedYear;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.7}
                  onPress={() => selectYear(i)}
                  style={styles.item}
                >
                  <Text style={[styles.itemText, active && styles.itemTextActive]}>{y}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: colors.black,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
  },
  header: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 18,
    marginBottom: 12,
  },
  wheelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 18,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  itemText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.darkText,
    opacity: 0.6,
  },
  itemTextActive: {
    color: colors.primary,
    fontSize: 18,
    opacity: 1,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: borderRadius.small,
  },
  confirmText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});