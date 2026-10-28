import React from "react";
import { Pressable, Text, View } from "react-native";
import { Category } from "../types";
import { getCategoryColor } from "../utils/categoryColors";
import { CategoryIconView } from "./CategoryIconView";

interface CategoryChooserGridProps {
  categories: Category[];
  selectedCategory: string;
  isLight: boolean;
  onSelect: (category: Category) => void;
}

export const CategoryChooserGrid: React.FC<CategoryChooserGridProps> = ({
  categories,
  selectedCategory,
  isLight,
  onSelect,
}) => (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      gap: 10,
      width: "100%",
    }}
  >
    {categories.map((category) => {
      const isSelected =
        selectedCategory.toLowerCase() === category.name.toLowerCase();
      const categoryColor = category.color || getCategoryColor(category.name);

      return (
        <Pressable
          key={category.id || category.name}
          onPress={() => onSelect(category)}
          style={{
            width: "22.5%",
            aspectRatio: 0.92,
            backgroundColor: isSelected
              ? isLight
                ? "#F0F4FF"
                : "#1E293B"
              : isLight
                ? "#F3F4F6"
                : "#161B22",
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected
              ? isLight
                ? "#012E4F"
                : "#38BDF8"
              : isLight
                ? "#E5E7EB"
                : "#30363D",
          }}
          accessibilityRole="button"
          accessibilityLabel={`Select ${category.name} category`}
          accessibilityState={{ selected: isSelected }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <CategoryIconView
              iconName={category.icon || category.name}
              color={categoryColor}
              size={22}
              containerSize={34}
              borderRadius={10}
              customBg={isLight ? "#FFFFFF" : "#1E293B"}
              customColor={categoryColor}
              isLight={isLight}
            />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: isSelected
                ? isLight
                  ? "#012E4F"
                  : "#FFFFFF"
                : isLight
                  ? "#4B5563"
                  : "#9CA3AF",
              fontWeight: isSelected ? "700" : "500",
              fontSize: 12.5,
              textAlign: "center",
            }}
          >
            {category.name}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
