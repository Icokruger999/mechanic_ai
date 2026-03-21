import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY || "",
  },
});

interface DiagnosticInput {
  message: string;
  vehicle: { year: string; make: string; model: string };
  history: Array<{ role: string; content: string }>;
  mode: string;
  country: string;
  currency: string;
}

const currencySymbols: Record<string, string> = {
  ZAR: "R",
  USD: "$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
};

export async function getDiagnostic(input: DiagnosticInput) {
  const { message, vehicle, history, mode, country, currency } = input;
  const symbol = currencySymbols[currency] || currency;

  const vehicleDesc = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(" ") || "unspecified vehicle";

  const systemPrompt =
    mode === "mechanic"
      ? `You are a professional automotive mechanic AI. Provide detailed diagnostic reports with structured sections using UPPERCASE HEADERS followed by a colon (e.g. "SYMPTOMS:", "ROOT CAUSE:", "REPAIR RECOMMENDATIONS:", "ESTIMATED COSTS:"). Use ${symbol} for costs based on ${country} pricing. Be thorough and technical. Vehicle: ${vehicleDesc}.`
      : `You are a friendly, knowledgeable car mechanic AI assistant. Give helpful, conversational advice about car problems. Use ${symbol} for any cost estimates based on ${country} pricing. Vehicle: ${vehicleDesc}.`;

  const conversationHistory = history.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: message },
  ];

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const command = new InvokeModelCommand({
    modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const aiResponse = responseBody.content[0].text;

  // Parse diagnostic info from the response
  const diagnostic = parseDiagnostic(aiResponse, currency);

  return { response: aiResponse, diagnostic };
}

function decodeEntities(str: string) {
  return str.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function parseDiagnostic(text: string, currency: string) {
  // Extract component name from context
  const componentPatterns = [
    /(?:issue with|problem with|diagnos\w+ (?:the|your)?)\s+(\w[\w\s]{2,30})/i,
    /^(?:COMPONENT|SYSTEM|AREA):\s*(.+)$/m,
  ];
  let component = "General";
  for (const p of componentPatterns) {
    const m = text.match(p);
    if (m) { component = m[1].trim().substring(0, 30); break; }
  }

  // Extract cost range
  const symbol = currencySymbols[currency] || "";
  const costPattern = new RegExp(
    `(?:${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|${currency})\\s*([\\d,]+)\\s*(?:-|to|–)\\s*(?:${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|${currency})?\\s*([\\d,]+)`,
    "i"
  );
  const costMatch = text.match(costPattern);
  const costMin = costMatch ? parseInt(costMatch[1].replace(/,/g, "")) : 500;
  const costMax = costMatch ? parseInt(costMatch[2].replace(/,/g, "")) : 2000;

  // Determine severity
  const highWords = /urgent|critical|dangerous|immediate|severe|safety/i;
  const medWords = /moderate|should|recommend|worn|degraded/i;
  const status = highWords.test(text) ? "High" : medWords.test(text) ? "Medium" : "Low";

  // Extract check items
  const checks: string[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const bullet = trimmed.match(/^(?:[-*>•\u2022]|\d+[.)]|â€¢)\s*(.+)/);
    if (bullet && checks.length < 8) {
      const clean = bullet[1].trim()
        .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
        .replace(/&#39;|&#x27;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
      if (clean.length > 5) checks.push(clean.replace(/^â€¢\s*/, '').replace(/^•\s*/, ''));
    }
  }
  if (checks.length === 0) checks.push("Visual inspection", "Component test", "System scan");

  // Build related parts
  const partKeywords = [
    "Engine", "Transmission", "Brakes", "Battery", "Alternator", "Starter",
    "Radiator", "Thermostat", "Suspension", "Steering", "Exhaust", "Clutch",
    "Turbo", "Turbocharger", "Fuel Pump", "Spark Plugs", "Oil Filter", "Air Filter",
    "Intercooler", "Wastegate", "Boost", "ECU", "Injector", "Timing Belt",
    "Timing Chain", "Water Pump", "Compressor", "Catalytic Converter", "Gearbox",
    "Differential", "CV Joint", "Wheel Bearing", "Shock Absorber", "Strut",
    "Control Arm", "Tie Rod", "Brake Pad", "Brake Disc", "Rotor", "Caliper",
    "Head Gasket", "Valve", "Piston", "Crankshaft", "Camshaft", "Sensor",
    "Oxygen Sensor", "MAF Sensor", "Coolant", "Oil Pump", "Power Steering",
  ];
  const seen = new Set<string>();
  const relatedParts = partKeywords
    .filter((p) => {
      const key = p.toLowerCase();
      if (seen.has(key) || !text.toLowerCase().includes(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10)
    .map((name) => ({
      name,
      status: highWords.test(text) && text.toLowerCase().indexOf(name.toLowerCase()) !== -1
        ? "Bad"
        : medWords.test(text) ? "Check" : "Good",
    }));

  if (relatedParts.length === 0) {
    relatedParts.push({ name: component, status: status === "High" ? "Bad" : "Check" });
  }

  return { component: decodeEntities(component), status, costMin, costMax, checks, relatedParts };
}
