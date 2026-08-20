import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../constants/colors";

export const FilterModal = ({
  visible,
  onClose,
  searchCategory,
  setSearchCategory,
  filterCategory,
  setFilterCategory,
  getDateDisplay,
  onDatePress,
  allCategories,
}: any) => {
  const filteredCategories = allCategories.filter((cat: string) =>
    cat.toLowerCase().includes(searchCategory.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={[styles.modal, { backgroundColor: COLORS.card }]}>
          <Text style={styles.modalTitle}>Filter</Text>

          <Text style={styles.filterLabel}>Date Range</Text>
          <TouchableOpacity style={styles.filterBox} onPress={onDatePress}>
            <Text style={{ color: COLORS.white }}>{getDateDisplay()}</Text>
          </TouchableOpacity>

          <Text style={styles.filterLabel}>Search Category</Text>
          <View style={styles.searchBox}>
            <Icon name="search" size={16} color={COLORS.gray} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={COLORS.gray}
              value={searchCategory}
              onChangeText={setSearchCategory}
              style={styles.searchInput}
            />
          </View>

          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView style={styles.categoryScroll}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {filteredCategories.map((cat: string) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFilterCategory(cat)}
                  style={[
                    styles.catBtn,
                    filterCategory === cat && {
                      backgroundColor: COLORS.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catBtnText,
                      filterCategory === cat && { color: "white" },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterBtnRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.smallBtn, { backgroundColor: COLORS.gray }]}
            >
              <Text style={styles.smallBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSearchCategory("");
                onClose();
              }}
              style={[styles.smallBtn, { backgroundColor: COLORS.primary }]}
            >
              <Text style={[styles.smallBtnText, { color: "white" }]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { width: "90%", padding: 16, borderRadius: 20, maxHeight: "80%" },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  filterLabel: {
    color: COLORS.gray,
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
  },
  filterBox: { backgroundColor: "#2A2A2A", padding: 12, borderRadius: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, padding: 10, color: COLORS.white, fontSize: 14 },
  categoryScroll: { maxHeight: 220, marginBottom: 10 },
  catBtn: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 4,
  },
  catBtnText: { color: COLORS.white, fontSize: 13 },
  filterBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  smallBtnText: { fontWeight: "bold", fontSize: 14 },
});
