import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDateTime(value: string, includeTime = true) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const dateText = `${pad(date.getDate())} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  if (!includeTime) return dateText;

  return `${dateText}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateTimeField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date(value));
  const [visibleMonth, setVisibleMonth] = useState(new Date(new Date(value).getFullYear(), new Date(value).getMonth(), 1));
  const [hour, setHour] = useState(pad(new Date(value).getHours()));
  const [minute, setMinute] = useState(pad(new Date(value).getMinutes()));

  const openPicker = () => {
    const current = new Date(value);
    const safe = Number.isNaN(current.getTime()) ? new Date() : current;

    setDraft(new Date(safe));
    setVisibleMonth(new Date(safe.getFullYear(), safe.getMonth(), 1));
    setHour(pad(safe.getHours()));
    setMinute(pad(safe.getMinutes()));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) {
      const current = new Date(value);
      if (!Number.isNaN(current.getTime())) {
        setDraft(current);
        setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
        setHour(pad(current.getHours()));
        setMinute(pad(current.getMinutes()));
      }
    }
  }, [value, open]);

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<number | null> = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [visibleMonth]);

  const chooseDay = (day: number) => {
    const next = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
      Number(hour),
      Number(minute),
      0,
      0
    );
    setDraft(next);
  };

  const save = () => {
    const h = Number(hour);
    const m = Number(minute);

    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      return;
    }

    const next = new Date(draft);
    next.setHours(h, m, 0, 0);

    onChange(next.toISOString());
    setOpen(false);
  };

  const selectedDay = draft.getDate();
  const selectedMonth = draft.getMonth();
  const selectedYear = draft.getFullYear();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={styles.value}>{formatDateTime(value)}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Select {label}</Text>

            <View style={styles.monthRow}>
              <Pressable
                style={styles.monthButton}
                onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
              >
                <Text style={styles.monthButtonText}>‹</Text>
              </Pressable>

              <Text style={styles.monthTitle}>
                {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </Text>

              <Pressable
                style={styles.monthButton}
                onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
              >
                <Text style={styles.monthButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map(day => <Text key={day} style={styles.weekDay}>{day}</Text>)}
            </View>

            <ScrollView>
              <View style={styles.grid}>
                {days.map((day, index) => {
                  const selected =
                    day !== null &&
                    selectedYear === visibleMonth.getFullYear() &&
                    selectedMonth === visibleMonth.getMonth() &&
                    selectedDay === day;

                  return (
                    <Pressable
                      key={`${day ?? 'empty'}-${index}`}
                      disabled={day === null}
                      style={[styles.day, selected && styles.selectedDay]}
                      onPress={() => day !== null && chooseDay(day)}
                    >
                      <Text style={[styles.dayText, selected && styles.selectedDayText]}>
                        {day ?? ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.timeLabel}>Time (24-hour)</Text>
              <View style={styles.timeRow}>
                <TextInput
                  value={hour}
                  onChangeText={text => setHour(text.replace(/\D/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  style={styles.timeInput}
                  placeholder="HH"
                />
                <Text style={styles.colon}>:</Text>
                <TextInput
                  value={minute}
                  onChangeText={text => setMinute(text.replace(/\D/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  style={styles.timeInput}
                  placeholder="MM"
                />
              </View>

              <Text style={styles.preview}>Selected: {formatDateTime(draft.toISOString())}</Text>
              <Text style={styles.help}>Choose a date and time, then press Done. Cancel leaves the previous value unchanged.</Text>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={styles.cancel} onPress={() => setOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.save} onPress={save}>
                <Text style={styles.saveText}>Done</Text>
              </Pressable>
            </View>
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
    minHeight: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    backgroundColor: '#fff', justifyContent: 'center', paddingHorizontal: 14,
  },
  value: { fontSize: 16, color: '#111827' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal: { maxHeight: '92%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 12 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  monthButtonText: { fontSize: 26, color: '#2563eb' },
  monthTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  weekRow: { flexDirection: 'row', marginTop: 12, marginBottom: 4 },
  weekDay: { width: '14.2857%', textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  selectedDay: { backgroundColor: '#2563eb', borderRadius: 20 },
  dayText: { color: '#111827', fontSize: 15 },
  selectedDayText: { color: '#fff', fontWeight: '800' },
  timeLabel: { marginTop: 12, fontWeight: '700', color: '#374151' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  timeInput: { width: 70, height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, textAlign: 'center', fontSize: 20, backgroundColor: '#fff' },
  colon: { fontSize: 22, fontWeight: '800', marginHorizontal: 8 },
  preview: { color: '#374151', fontWeight: '700', textAlign: 'center', marginTop: 12 },
  help: { color: '#6b7280', fontSize: 12, lineHeight: 18, marginTop: 7 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancel: { flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 10, backgroundColor: '#f3f4f6' },
  cancelText: { color: '#374151', fontWeight: '700' },
  save: { flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 10, backgroundColor: '#2563eb' },
  saveText: { color: '#fff', fontWeight: '700' },
});
