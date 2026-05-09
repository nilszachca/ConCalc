import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  concreteSlab,
  drywall,
  flooring,
  framingStuds,
} from "./utils/calculations";
import { searchBuildingCode } from "./utils/codeLookup";

const calculators = [
  {
    id: "concrete",
    title: "Concrete Slab",
    description: "Estimate cubic yards for a slab.",
    fields: [
      ["length", "Length (ft)", "20"],
      ["width", "Width (ft)", "12"],
      ["thickness", "Thickness (in)", "4"],
      ["waste", "Waste %", "10"],
    ],
  },
  {
    id: "drywall",
    title: "Drywall",
    description: "Estimate 4x8 drywall sheets.",
    fields: [
      ["length", "Room length (ft)", "12"],
      ["width", "Room width (ft)", "10"],
      ["height", "Wall height (ft)", "8"],
      ["waste", "Waste %", "12"],
    ],
  },
  {
    id: "flooring",
    title: "Flooring",
    description: "Estimate square feet including waste.",
    fields: [
      ["length", "Length (ft)", "20"],
      ["width", "Width (ft)", "12"],
      ["waste", "Waste %", "8"],
    ],
  },
  {
    id: "framing",
    title: "Framing Studs",
    description: "Estimate studs and plates for a wall.",
    fields: [
      ["length", "Wall length (ft)", "16"],
      ["height", "Wall height (ft)", "8"],
      ["spacing", "Stud spacing (in)", "16"],
    ],
  },
];

function parse(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function ResultCard({ result }) {
  if (!result) return null;
  const rows = Array.isArray(result) ? result : [result];

  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>Result</Text>
      {rows.map((item, index) => (
        <View key={`${item.name}-${index}`} style={styles.resultRow}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultValue}>
            {item.quantity} {item.unit}
          </Text>
        </View>
      ))}
    </View>
  );
}

function CalculatorPanel({ calculator }) {
  const initialValues = useMemo(
    () => Object.fromEntries(calculator.fields.map(([key, , value]) => [key, value])),
    [calculator]
  );
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState(null);

  function calculate() {
    if (calculator.id === "concrete") {
      setResult(
        concreteSlab(
          parse(values.length),
          parse(values.width),
          parse(values.thickness),
          parse(values.waste)
        )
      );
    }

    if (calculator.id === "drywall") {
      setResult(
        drywall(
          parse(values.length),
          parse(values.width),
          parse(values.height),
          4,
          8,
          parse(values.waste)
        )
      );
    }

    if (calculator.id === "flooring") {
      setResult(flooring(parse(values.length), parse(values.width), parse(values.waste)));
    }

    if (calculator.id === "framing") {
      setResult(framingStuds(parse(values.length), parse(values.height), parse(values.spacing)));
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{calculator.title}</Text>
      <Text style={styles.cardDescription}>{calculator.description}</Text>
      {calculator.fields.map(([key, label]) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={values[key]}
            onChangeText={(text) => setValues((current) => ({ ...current, [key]: text }))}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.primaryButton} onPress={calculate}>
        <Text style={styles.primaryButtonText}>Calculate</Text>
      </TouchableOpacity>
      <ResultCard result={result} />
    </View>
  );
}

function CodeLookupPanel() {
  const [state, setState] = useState("CA");
  const [topic, setTopic] = useState("electrical");
  const [lookup, setLookup] = useState(null);

  function runLookup() {
    setLookup(searchBuildingCode(state, topic));
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Local Code Lookup</Text>
      <Text style={styles.cardDescription}>
        Starter reference data only. Always verify requirements with your local authority having jurisdiction.
      </Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>State</Text>
        <TextInput style={styles.input} value={state} onChangeText={setState} autoCapitalize="characters" />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Topic</Text>
        <TextInput style={styles.input} value={topic} onChangeText={setTopic} autoCapitalize="none" />
      </View>
      <TouchableOpacity style={styles.secondaryButton} onPress={runLookup}>
        <Text style={styles.secondaryButtonText}>Search Codes</Text>
      </TouchableOpacity>
      {lookup?.error ? <Text style={styles.errorText}>{lookup.error}</Text> : null}
      {lookup?.details ? (
        <View style={styles.codeBox}>
          <Text style={styles.resultTitle}>{lookup.state} - {lookup.topic}</Text>
          {Object.entries(lookup.details).map(([key, value]) => (
            <Text key={key} style={styles.codeLine}>• {key.replaceAll("_", " ")}: {value}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  const [activeCalculator, setActiveCalculator] = useState(calculators[0]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>Construction Material Calculator</Text>
          <Text style={styles.heading}>ConCalc</Text>
          <Text style={styles.subheading}>
            Estimate common construction materials and check starter local code notes from your phone.
          </Text>

          <View style={styles.tabWrap}>
            {calculators.map((calculator) => (
              <TouchableOpacity
                key={calculator.id}
                style={[
                  styles.tab,
                  activeCalculator.id === calculator.id ? styles.activeTab : null,
                ]}
                onPress={() => setActiveCalculator(calculator)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeCalculator.id === calculator.id ? styles.activeTabText : null,
                  ]}
                >
                  {calculator.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CalculatorPanel calculator={activeCalculator} />
          <CodeLookupPanel />

          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Next features</Text>
            <Text style={styles.footerText}>Saved results, project folders, and a real community board can be added after the calculator screens are stable.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  eyebrow: { color: "#93c5fd", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  heading: { color: "#f8fafc", fontSize: 42, fontWeight: "900", marginTop: 6 },
  subheading: { color: "#cbd5e1", fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 20 },
  tabWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  tab: { backgroundColor: "#1e293b", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#334155" },
  activeTab: { backgroundColor: "#2563eb", borderColor: "#60a5fa" },
  tabText: { color: "#cbd5e1", fontWeight: "700" },
  activeTabText: { color: "#ffffff" },
  card: { backgroundColor: "#111827", borderRadius: 24, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: "#334155" },
  cardTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  cardDescription: { color: "#94a3b8", marginTop: 6, marginBottom: 14, lineHeight: 21 },
  inputGroup: { marginBottom: 12 },
  label: { color: "#e2e8f0", fontWeight: "700", marginBottom: 6 },
  input: { backgroundColor: "#020617", color: "#f8fafc", borderWidth: 1, borderColor: "#334155", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  primaryButton: { backgroundColor: "#22c55e", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 4 },
  primaryButtonText: { color: "#052e16", fontWeight: "900", fontSize: 16 },
  secondaryButton: { backgroundColor: "#38bdf8", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 4 },
  secondaryButtonText: { color: "#082f49", fontWeight: "900", fontSize: 16 },
  resultCard: { backgroundColor: "#0f172a", borderRadius: 18, padding: 14, marginTop: 14, borderWidth: 1, borderColor: "#1e40af" },
  resultTitle: { color: "#bfdbfe", fontWeight: "900", fontSize: 17, marginBottom: 8 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 6 },
  resultName: { color: "#e2e8f0", fontWeight: "700", flex: 1 },
  resultValue: { color: "#f8fafc", fontWeight: "900", flex: 1, textAlign: "right" },
  errorText: { color: "#fecaca", marginTop: 12, fontWeight: "700" },
  codeBox: { backgroundColor: "#0f172a", borderRadius: 18, padding: 14, marginTop: 14, borderWidth: 1, borderColor: "#334155" },
  codeLine: { color: "#e2e8f0", lineHeight: 22, marginBottom: 6 },
  footerCard: { backgroundColor: "#172554", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#1d4ed8" },
  footerTitle: { color: "#dbeafe", fontWeight: "900", fontSize: 18, marginBottom: 6 },
  footerText: { color: "#bfdbfe", lineHeight: 21 },
});
