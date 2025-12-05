import TintIcon from "@/components/Icon";
import { borderRadius, colors, fonts } from "@/theme/theme";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Course {
    id: string;
    code: string;
    title: string;
    instructor: string;
    lessons: number;
    duration: string;
    color: string;
    icon: string;
}

const Courses = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const [courses] = useState<Course[]>([
        {
            id: "1",
            code: "MTH 101",
            title: "Introduction to Mathematics",
            instructor: "Dr. Sarah Johnson",
            lessons: 24,
            duration: "12h 30m",
            color: "#FF6B6B",
            icon: "calculator",
        },
        {
            id: "2",
            code: "EET 221",
            title: "Electricity & Magnetism",
            instructor: "Prof. Michael Chen",
            lessons: 18,
            duration: "10h 15m",
            color: "#4ECDC4",
            icon: "bulb",
        },
        {
            id: "3",
            code: "CSC 201",
            title: "Data Structures & Algorithms",
            instructor: "Engr. David Smith",
            lessons: 32,
            duration: "18h 45m",
            color: "#FFD93D",
            icon: "laptop",
        },
        {
            id: "4",
            code: "PHY 102",
            title: "General Physics II",
            instructor: "Dr. Emily Davis",
            lessons: 20,
            duration: "14h 00m",
            color: "#A78BFA",
            icon: "atom",
        },
        {
            id: "5",
            code: "CHM 101",
            title: "General Chemistry I",
            instructor: "Prof. James Wilson",
            lessons: 22,
            duration: "13h 20m",
            color: "#F472B6",
            icon: "flask",
        },
        {
            id: "6",
            code: "GST 101",
            title: "Use of English",
            instructor: "Mrs. Linda Brown",
            lessons: 15,
            duration: "8h 30m",
            color: "#60A5FA",
            icon: "book-alt",
        },
    ]);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCourseItem = ({ item }: { item: Course }) => (
        <Pressable style={styles.courseItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <TintIcon name={item.icon} size={24} color={colors.text} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <View style={styles.codeBadge}>
                        <Text style={[styles.codeText, { color: item.color }]}>{item.code}</Text>
                    </View>
                    <Text style={styles.duration}>{item.duration}</Text>
                </View>

                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.instructor}>by {item.instructor}</Text>

                <View style={styles.footerRow}>
                    <View style={styles.lessonBadge}>
                        <TintIcon name="play" size={12} color={colors.darkText} />
                        <Text style={styles.lessonText}>{item.lessons} Lessons</Text>
                    </View>
                    <Pressable style={styles.startButton}>
                        <Text style={styles.startButtonText}>Start</Text>
                        <TintIcon name="angle-small-right" size={16} color={colors.text} />
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Courses</Text>
                    <Text style={styles.headerSubtitle}>Master your subjects</Text>
                </View>
                <Pressable style={styles.filterButton}>
                    <TintIcon name="filter" size={20} color={colors.text} />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <TintIcon name="search" size={20} color={colors.darkText} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses (e.g. MTH 101)"
                        placeholderTextColor={colors.darkText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Course List */}
            <FlatList
                data={filteredCourses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No courses found</Text>
                        <Text style={styles.emptySubtext}>Try searching for a different code or title</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default Courses;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "700",
        color: colors.text,
        fontFamily: fonts.bold,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.darkText,
        fontFamily: fonts.regular,
        marginTop: 4,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.lightBunker,
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.regular,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    courseItem: {
        flexDirection: "row",
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        padding: 16,
        marginBottom: 16,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    codeBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    codeText: {
        fontSize: 12,
        fontFamily: fonts.bold,
    },
    duration: {
        fontSize: 12,
        color: colors.darkText,
        fontFamily: fonts.regular,
    },
    courseTitle: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 4,
    },
    instructor: {
        fontSize: 14,
        color: colors.darkText,
        fontFamily: fonts.regular,
        marginBottom: 12,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    lessonBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    lessonText: {
        fontSize: 12,
        color: colors.darkText,
        fontFamily: fonts.regular,
    },
    startButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    startButtonText: {
        fontSize: 12,
        color: colors.text,
        fontFamily: fonts.bold,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.darkText,
    },
});
