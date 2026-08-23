import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type SelectOption = {
  id: number;
  label: string;
};

type Props = {
  label: string;
  value: number | null;
  placeholder: string;
  options: SelectOption[];
  onChange: (id: number) => void;
};

export function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.id === value);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>{label}</Text>

            {options.length === 0 ? (
              <Text style={styles.empty}>No options available.</Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.option, item.id === value && styles.selectedOption]}
                    onPress={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </Pressable>
                )}
              />
            )}

            <Pressable style={styles.cancel} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 7 },
  field: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: { fontSize: 16, color: '#111827', flex: 1 },
  placeholder: { color: '#8a8f98' },
  arrow: { fontSize: 18, color: '#6b7280', marginLeft: 10 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 12 },
  empty: { color: '#6b7280', paddingVertical: 20, textAlign: 'center' },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedOption: { backgroundColor: '#eff6ff' },
  optionText: { fontSize: 16, color: '#111827' },
  cancel: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelText: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
});
