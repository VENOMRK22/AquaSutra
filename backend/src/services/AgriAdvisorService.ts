import Groq from 'groq-sdk';

export interface CropAdviceInput {
    cropName: string;
    sowingDate: string;
    area: number;
    soilType: string;
    irrigationMethod: string;
    location?: string;
    observations?: string;
    currentStage?: string; // New Input
}

export interface AdvisoryResponse {
    growthStage: {
        stage: string;
        description: string;
        progressPercent: number; // 0-100
    };
    healthCheck: {
        status: 'Good' | 'Attention Needed' | 'Critical';
        symptoms: string[];
        advice: string;
    };
    waterSchedule: {
        frequency: string;
        amount: string;
        nextWatering: string;
        tip: string;
    };
    schedule: {
        date: string; // YYYY-MM-DD
        task: string;
        type: 'Fertilizer' | 'Pesticide' | 'Irrigation' | 'Harvest';
        details: string;
    }[];
    nextSteps: {
        title: string;
        description: string;
    };
}

export class AgriAdvisorService {
    private static groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_1
    });

    static async generateAdvice(input: CropAdviceInput): Promise<AdvisoryResponse> {
        // Calculate days since sowing
        const daysSinceSowing = Math.floor((new Date().getTime() - new Date(input.sowingDate).getTime()) / (1000 * 3600 * 24));

        // Calculate realistic progress based on typical crop cycles
        const typicalCycleDays: Record<string, number> = {
            'wheat': 120, 'rice': 130, 'cotton': 180, 'sugarcane': 365,
            'tomato': 90, 'onion': 150, 'potato': 100, 'maize': 100,
            'soybean': 100, 'groundnut': 120, 'chilli': 150, 'brinjal': 140
        };

        const cropCycle = typicalCycleDays[input.cropName.toLowerCase()] || 120;
        const calculatedProgress = Math.min(100, Math.round((daysSinceSowing / cropCycle) * 100));

        // Stage-specific water needs multiplier
        const stageWaterNeeds: Record<string, string> = {
            'Seedling': 'Light, frequent watering',
            'Vegetative': 'Moderate watering, ensure soil stays moist',
            'Flowering': 'Critical water stage - increase frequency by 30%',
            'Fruiting': 'High water demand - consistent moisture essential',
            'Maturation': 'Reduce watering gradually to harden crop'
        };

        const waterGuidance = stageWaterNeeds[input.currentStage || 'Vegetative'];

        const prompt = `
        You are an EXPERT AGRONOMIST AI specializing in Indian farming conditions.

        **CROP DETAILS:**
        - Crop Name: ${input.cropName}
        - Sowing Date: ${input.sowingDate} (${daysSinceSowing} days ago)
        - User-Observed Stage: ${input.currentStage || "Unknown"}
        - Area: ${input.area} acres
        - Soil Type: ${input.soilType}
        - Irrigation Method: ${input.irrigationMethod}
        - Farmer Observations: ${input.observations || "None provided"}
        - Today's Date: ${new Date().toISOString().split('T')[0]}

        **CRITICAL RULES - FOLLOW EXACTLY:**
        1. **progressPercent**: Calculate based on ${daysSinceSowing} days elapsed out of typical ${cropCycle}-day cycle for ${input.cropName}. Suggested: ~${calculatedProgress}%. Adjust for user's observed stage.
        
        2. **growthStage.stage**: Use the EXACT crop-appropriate stage name:
           - Wheat/Rice: Germination → Tillering → Stem Extension → Heading → Grain Filling → Maturity
           - Tomato/Chilli/Brinjal: Seedling → Vegetative → Flowering → Fruit Setting → Ripening
           - Cotton: Germination → Squaring → Flowering → Boll Formation → Boll Opening
           - General: Seedling → Vegetative → Flowering → Fruiting → Maturation
        
        3. **waterSchedule**: MUST vary based on:
           - Soil Type: ${input.soilType} (Sandy = more frequent, Clay = less frequent)
           - Irrigation: ${input.irrigationMethod} (Drip = lower amount, Flood = higher amount)
           - Stage: ${input.currentStage} (${waterGuidance})
           - Give SPECIFIC amounts like "40mm per week" or "2 hours drip daily"
        
        4. **schedule**: Give 3-5 REAL tasks with ACTUAL dates (YYYY-MM-DD format) starting from today.
           - Include crop-specific fertilizers (e.g., NPK ratio for ${input.cropName})
           - Include pest/disease prevention relevant to ${input.cropName} in India
        
        5. **nextSteps**: Describe the NEXT growth phase SPECIFIC to ${input.cropName}.

        **OUTPUT FORMAT (STRICT JSON):**
        {
            "growthStage": { 
                "stage": "<Crop-specific stage name>", 
                "description": "<2-3 sentences describing current state of ${input.cropName}>", 
                "progressPercent": <number 0-100 based on calculation>
            },
            "healthCheck": { 
                "status": "Good" | "Attention Needed" | "Critical", 
                "symptoms": ["<any issues based on observations>"], 
                "advice": "<specific health tip for ${input.cropName}>"
            },
            "waterSchedule": { 
                "frequency": "<e.g., Every 3 days>", 
                "amount": "<e.g., 30mm or 1.5 hours drip>", 
                "nextWatering": "<Tomorrow/Today/In 2 days>", 
                "tip": "<Soil-specific tip for ${input.soilType}>"
            },
            "schedule": [
                { "date": "YYYY-MM-DD", "task": "<task name>", "type": "Fertilizer" | "Pesticide" | "Irrigation" | "Harvest", "details": "<dosage/action>" }
            ],
            "nextSteps": { 
                "title": "<Next growth phase for ${input.cropName}>", 
                "description": "<What farmer should prepare for>"
            }
        }
        `;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert Indian Agronomist AI. Output strictly valid JSON." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("No response from AI");

            return JSON.parse(content) as AdvisoryResponse;

        } catch (error) {
            console.error("AI Advisor Error:", error);
            // Fallback mock response if AI fails
            return this.getFallbackAdvice(input);
        }
    }

    private static getFallbackAdvice(input: CropAdviceInput): AdvisoryResponse {
        return {
            growthStage: { stage: "Active Growth", description: "Vegetative stage", progressPercent: 30 },
            healthCheck: { status: "Good", symptoms: [], advice: "Monitor for pests." },
            waterSchedule: { frequency: "Every 5 days", amount: "Standard", nextWatering: "Check soil", tip: "Ensure drainage" },
            schedule: [],
            nextSteps: { title: "Monitor Growth", description: "Keep checking leaves for color changes." }
        };
    }
}
