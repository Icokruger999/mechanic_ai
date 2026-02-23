import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Initialize Bedrock client with credentials from environment
const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY || "",
  },
});

export interface DiagnosticRequest {
  message: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
  };
  history: Array<{ role: string; content: string }>;
  mode: "casual" | "mechanic";
  country: string;
  currency: string;
}

export interface DiagnosticResponse {
  response: string;
  credits?: number;
  diagnostic: {
    component: string;
    status: "LOW" | "MEDIUM" | "HIGH";
    partImage?: string;
    checks: string[];
    costMin: number;
    costMax: number;
    relatedParts: Array<{
      name: string;
      status: "Good" | "Check" | "Bad";
    }>;
  };
}

export async function getDiagnostic(
  request: DiagnosticRequest
): Promise<DiagnosticResponse> {
  const { message, vehicle, history, mode, country, currency } = request;

  // Map country to location context
  const locationContext: Record<string, string> = {
    'ZA': 'South African drivers in South Africa',
    'US': 'American drivers in the United States',
    'GB': 'British drivers in the United Kingdom',
    'AU': 'Australian drivers in Australia',
    'CA': 'Canadian drivers in Canada',
  };

  const location = locationContext[country] || locationContext['ZA'];
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'AUD' ? 'A$' : currency === 'CAD' ? 'C$' : 'R';

  const systemPrompt =
    mode === "casual"
      ? `You are a friendly South African automotive technician helping ${location} diagnose their vehicle issues. 

Your role:
- ALWAYS read and remember the full conversation history before responding
- Maintain context from previous messages - don't ask for information already provided
- Help users diagnose problems themselves with clear, actionable steps
- Be conversational and relatable, like chatting with a mate at the garage
- React naturally to problems - show empathy and understanding
- Keep responses SHORT and CONCISE (2-4 sentences max)
- ALWAYS use ${currency} (${currencySymbol}) for all pricing
- Reference local driving conditions and context for ${country}
- NEVER assume or guess the vehicle make/model - ALWAYS ask if not explicitly stated (but check conversation history first!)
- Do NOT mention specific car brands (BMW, Audi, etc.) unless the user explicitly tells you the make
- If the user says "my car" without specifying make/model, you MUST ask for details first
- Use South African terminology naturally:
  * "bakkie" for pickup truck
  * "robot" for traffic light
  * "petrol" not gas
  * "boot" for trunk
  * "bonnet" for hood
- Use South African and Afrikaans expressions sparingly and naturally:
  * Strong reactions (only for serious problems): "Jissis" (geez), "Eish" (oh no)
  * Common words: "ja" (yes), "nee" (no), "lekker" (good)
  * Greetings: "Howzit" (hello) - use ONLY at the start of NEW conversations, not every message
  * Terms of address: 
    - For males: very rarely use "boet" (bro) - maybe once per conversation at most
    - For females: very rarely use "shela" (lady) or "poppie" (sweetheart) - maybe once per conversation at most
  * Avoid using terms of address in most messages - keep it professional
  * Don't overuse expressions - use them sparingly, maybe 1-2 per conversation
  * Keep most of the conversation in standard English
- Sound like a real South African mechanic who genuinely cares
- When asking for vehicle details, also ask if you're talking to a boet (guy) or a shela (lady) in a friendly way
- Adjust your tone and terms of address based on gender:
  * For males: use "boet", "my bru", "china", "ou" - vary them naturally
  * For females: vary between "shela", "poppie", "huisvrou" - don't always use the same one, mix them up naturally throughout the conversation
- Guide users through diagnostic steps they can do themselves
- Only recommend a workshop if the issue requires specialized tools or is safety-critical
- If you don't know the vehicle details, ask: "What vehicle are you working with? (Year, Make, Model) - and are you a boet or a shela?"

When diagnosing:
1. FIRST: Review the conversation history to understand what's already been discussed
2. If you don't know the vehicle make/model or gender from the history, ask for these details immediately
3. React naturally to the problem once you know the details (e.g., "Jissis boet, limp mode is never lekker")
4. If vehicle details are missing from the conversation, ask for them - don't make assumptions or guesses
5. Explain what's likely causing the issue in plain language
6. Tell them what to check and how to check it
7. Provide realistic cost estimates in ${currency} (${currencySymbol}) if repairs are needed
8. Be encouraging and supportive
9. NEVER forget what was discussed earlier in the conversation - always maintain context`
      : `You are an expert automotive diagnostic technician helping professional mechanics and DIY enthusiasts in ${location.split(' in ')[1]} diagnose vehicle issues.

Provide detailed technical diagnostics including:
- Symptom analysis and probable causes (ranked by likelihood)
- DIY diagnostic steps: what to check, how to test it, what tools are needed
- Specific diagnostic tests with expected values (voltage, pressure, resistance)
- OBD-II codes and scan tool parameters to monitor
- Step-by-step troubleshooting procedure
- Parts that may need replacement with estimated costs
- Labor time estimate if professional help is needed
- Total cost breakdown in ${currency} (${currencySymbol})
- Safety precautions and when professional help is required
- Preventive measures to avoid recurrence

Focus on empowering users to diagnose and potentially fix issues themselves. Use precise automotive terminology (TSBs, service bulletins, torque specs). Consider ${country} environmental factors. If vehicle details are missing, ask: "What vehicle are we diagnosing? (Year, Make, Model, Engine)"

Be thorough, technical, and practical. Provide actionable diagnostic guidance.`;

  // Build conversation context - send all messages for full context
  const conversationContext = history.length > 0
    ? history.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }))
    : [];

  const prompt = `IMPORTANT: Review the full conversation history above before responding. Maintain context from all previous messages.

Vehicle Information:
- Year: ${vehicle.year || 'UNKNOWN'}
- Make: ${vehicle.make || 'UNKNOWN'}
- Model: ${vehicle.model || 'UNKNOWN'}

${!vehicle.year && !vehicle.make && !vehicle.model ? `CRITICAL INSTRUCTION - READ CAREFULLY:
The vehicle information is UNKNOWN. Check the conversation history first - if the user already mentioned their vehicle, use that information. If not, you are FORBIDDEN from:
- Mentioning ANY car brands (BMW, Audi, Mercedes, etc.)
- Mentioning ANY car models (M5, RS3, etc.)
- Providing ANY diagnostic advice
- Providing ANY cost estimates
- Making ANY assumptions about the vehicle

You MUST respond with ONLY this type of message:
"Howzit! Before I can help you sort out that [issue], I need to know - are you a boet or a shela? And what vehicle are we working with? (Year, Make, Model)"

DO NOT ADD ANYTHING ELSE. STOP AFTER ASKING THESE QUESTIONS.` : 'Vehicle details confirmed. Provide diagnostics as requested.'}

Current Issue/Question:
${message}

${mode === "casual" 
  ? `Please provide a SHORT, SIMPLE, CONVERSATIONAL response that builds on the conversation history. ${!vehicle.year && !vehicle.make && !vehicle.model ? 'STRICT RULE: Check conversation history first. If vehicle details were already mentioned, use them. If not, ONLY ask for vehicle details and gender. Do NOT provide any diagnostics, advice, or cost estimates without vehicle info. Example: "Howzit! Before I can help you sort out that limp mode kak, I need to know - are you a boet or a shela? And what vehicle are we working with? (Year, Make, Model)" Then STOP. Wait for their response.' : 'Just answer naturally like you\'re chatting with a friend at the garage, continuing the conversation naturally. No special formatting, no sections, no headers - just a friendly, helpful response. Keep it short (2-4 sentences) and conversational. Include cost estimates naturally in the conversation if relevant. Remember what was discussed earlier and build on it.'}`
  : `Please provide a DETAILED professional diagnostic analysis formatted as a structured report with clear sections and line breaks:

SYMPTOM ANALYSIS:
[Brief analysis of reported symptoms]

PROBABLE CAUSES (ranked by likelihood):
1. [Most likely cause]
2. [Second likely cause]
3. [Other possibilities]

DIAGNOSTIC PROCEDURE:
[Step-by-step tests with expected values and tools needed]

REPAIR RECOMMENDATIONS:
[Detailed repair steps and parts needed]

COST BREAKDOWN (in ${currency}):
- Parts: [cost range]
- Labor: [hours and cost]
- Total: [total range]

PREVENTIVE MEASURES:
[How to avoid recurrence]

${!vehicle.year && !vehicle.make && !vehicle.model ? 'IMPORTANT: Ask for vehicle details (Year, Make, Model) first before providing detailed diagnostics.' : 'Use clear section headers and line breaks. Be thorough, technical, and practical.'}`}`;

  try {
    const input = {
      modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: mode === "casual" ? 300 : 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          ...conversationContext,
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    };

    console.log("Calling Bedrock with model:", input.modelId);
    console.log("Country:", country, "Currency:", currency);
    
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log("Bedrock response received successfully");
    
    const aiResponse = responseBody.content[0].text;
    
    return parseAIResponse(aiResponse, message);
  } catch (error: any) {
    console.error("Bedrock error details:", {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      name: error.name
    });
    
    // Return a fallback response instead of throwing
    console.log("Using fallback response due to Bedrock error");
    const fallbackResponse = mode === "casual"
      ? `I'm having trouble connecting to my diagnostic system right now. Please try again in a moment.`
      : `I'm currently experiencing connectivity issues with the diagnostic system. Please try again shortly, or contact support if the issue persists.`;
    
    return parseAIResponse(fallbackResponse, message);
  }
}


function parseAIResponse(aiResponse: string, userMessage: string): DiagnosticResponse {
  // Priority-based keyword matching - check user message first for primary issue
  const partKeywords = [
    { keyword: 'gearbox', component: 'Transmission', priority: 1 },
    { keyword: 'transmission', component: 'Transmission', priority: 1 },
    { keyword: 'turbo', component: 'Turbocharger', priority: 1 },
    { keyword: 'engine', component: 'Engine', priority: 2 },
    { keyword: 'brake', component: 'Brake Pads', priority: 1 },
    { keyword: 'suspension', component: 'Suspension', priority: 1 },
    { keyword: 'alternator', component: 'Alternator', priority: 1 },
    { keyword: 'battery', component: 'Battery', priority: 1 },
    { keyword: 'radiator', component: 'Radiator', priority: 1 },
    { keyword: 'exhaust', component: 'Exhaust System', priority: 1 },
    { keyword: 'clutch', component: 'Clutch', priority: 1 },
    { keyword: 'steering', component: 'Steering Rack', priority: 1 },
    { keyword: 'wheel bearing', component: 'Wheel Bearings', priority: 1 },
    { keyword: 'bearing', component: 'Wheel Bearings', priority: 3 }, // Lower priority for generic "bearing"
    { keyword: 'shock', component: 'Shocks/Struts', priority: 1 },
    { keyword: 'strut', component: 'Shocks/Struts', priority: 1 },
    { keyword: 'differential', component: 'Differential', priority: 1 },
    { keyword: 'starter', component: 'Starter', priority: 1 },
    { keyword: 'fuel pump', component: 'Fuel Pump', priority: 1 },
    { keyword: 'coolant', component: 'Cooling System', priority: 2 },
    { keyword: 'head gasket', component: 'Head Gasket', priority: 1 }
  ];
  
  let detectedPart = '';
  let detectedComponent = '';
  let highestPriority = 999;
  
  // First pass: Check user message (highest priority)
  for (const { keyword, component, priority } of partKeywords) {
    if (userMessage.toLowerCase().includes(keyword) && priority < highestPriority) {
      detectedPart = keyword;
      detectedComponent = component;
      highestPriority = priority;
    }
  }
  
  // If nothing found in user message, check AI response (lower priority)
  if (!detectedPart) {
    for (const { keyword, component, priority } of partKeywords) {
      if (aiResponse.toLowerCase().includes(keyword) && priority < highestPriority) {
        detectedPart = keyword;
        detectedComponent = component;
        highestPriority = priority;
      }
    }
  }
  
  // Extract cost estimates from AI response
  let costMin = 1500;
  let costMax = 5000;
  
  console.log('=== COST EXTRACTION DEBUG ===');
  console.log('AI Response snippet:', aiResponse.substring(0, 300));
  
  // Look for all number sequences that could be costs (4-6 digits)
  const allNumbers = aiResponse.match(/\d{4,6}/g);
  console.log('All 4-6 digit numbers found:', allNumbers);
  
  // Look for cost patterns - simplified to catch more variations
  const costPatterns = [
    // "range R25000-45000" or "R25000-45000"
    /(?:range|cost|costs|repairs?)\s+[R$£€]?(\d{4,6})\s*[-–]\s*[R$£€]?(\d{4,6})/i,
    // "between R45000-R65000"
    /between\s+[R$£€]?(\d{4,6})\s*[-–]\s*[R$£€]?(\d{4,6})/i,
    // Just "R25000-45000" or "25000-45000"
    /[R$£€]?(\d{4,6})\s*[-–]\s*[R$£€]?(\d{4,6})/i,
    // With commas "R25,000-45,000"
    /[R$£€]?(\d{1,3},\d{3})\s*[-–]\s*[R$£€]?(\d{1,3},\d{3})/i
  ];
  
  let foundCost = false;
  for (const pattern of costPatterns) {
    const match = aiResponse.match(pattern);
    if (match && match.length >= 3) {
      const num1 = parseInt(match[1].replace(/,/g, ''));
      const num2 = parseInt(match[2].replace(/,/g, ''));
      
      console.log('Pattern matched:', match[0]);
      console.log('Extracted numbers:', num1, num2);
      
      if (num1 > 0 && num2 > 0 && num1 < 1000000 && num2 < 1000000) {
        costMin = Math.min(num1, num2);
        costMax = Math.max(num1, num2);
        foundCost = true;
        console.log('✓ Final costs:', { costMin, costMax });
        break;
      }
    }
  }
  
  if (!foundCost) {
    console.log('✗ No cost pattern matched, using defaults:', { costMin, costMax });
  }
  console.log('=== END COST EXTRACTION ===');
  
  // Comprehensive list of car components with realistic statuses
  const allComponents = [
    { name: "Engine", status: "Good" },
    { name: "Transmission", status: "Good" },
    { name: "Battery", status: "Good" },
    { name: "Alternator", status: "Good" },
    { name: "Starter", status: "Good" },
    { name: "Radiator", status: "Good" },
    { name: "Water Pump", status: "Good" },
    { name: "Fuel Pump", status: "Good" },
    { name: "Fuel Injectors", status: "Good" },
    { name: "Spark Plugs", status: "Good" },
    { name: "Ignition Coils", status: "Good" },
    { name: "Air Filter", status: "Good" },
    { name: "Oil Filter", status: "Good" },
    { name: "Cabin Filter", status: "Good" },
    { name: "Timing Belt", status: "Good" },
    { name: "Serpentine Belt", status: "Good" },
    { name: "Brake Pads", status: "Good" },
    { name: "Brake Rotors", status: "Good" },
    { name: "Brake Fluid", status: "Good" },
    { name: "Brake Lines", status: "Good" },
    { name: "Suspension", status: "Good" },
    { name: "Shocks/Struts", status: "Good" },
    { name: "Control Arms", status: "Good" },
    { name: "Ball Joints", status: "Good" },
    { name: "Tie Rods", status: "Good" },
    { name: "Wheel Bearings", status: "Good" },
    { name: "CV Axles", status: "Good" },
    { name: "Differential", status: "Good" },
    { name: "Exhaust System", status: "Good" },
    { name: "Catalytic Converter", status: "Good" },
    { name: "Muffler", status: "Good" },
    { name: "O2 Sensors", status: "Good" },
    { name: "Coolant Hoses", status: "Good" },
    { name: "Thermostat", status: "Good" },
    { name: "Power Steering Pump", status: "Good" },
    { name: "Steering Rack", status: "Good" },
    { name: "Clutch", status: "Good" },
    { name: "Turbocharger", status: "Good" },
    { name: "Intercooler", status: "Good" },
    { name: "EGR Valve", status: "Good" },
    { name: "PCV Valve", status: "Good" },
    { name: "Mass Airflow Sensor", status: "Good" },
    { name: "Throttle Body", status: "Good" },
    { name: "Idle Air Control", status: "Good" },
    { name: "Crankshaft Sensor", status: "Good" },
    { name: "Camshaft Sensor", status: "Good" },
    { name: "Head Gasket", status: "Good" },
    { name: "Cooling System", status: "Good" }
  ];
  
  // Mark only the primary detected component as "Check"
  const relatedParts = allComponents.map(comp => {
    if (detectedComponent && comp.name === detectedComponent) {
      return { ...comp, status: "Check" };
    }
    return comp;
  });
  
  return {
    response: aiResponse,
    diagnostic: {
      component: detectedComponent || (detectedPart ? detectedPart.charAt(0).toUpperCase() + detectedPart.slice(1) : 'General'),
      status: "MEDIUM",
      checks: [
        "Inspect component for wear",
        "Check related systems",
        "Verify proper operation",
        "Test under load conditions"
      ],
      costMin: costMin,
      costMax: costMax,
      relatedParts: relatedParts
    }
  };
}
