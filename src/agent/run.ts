import "dotenv/config";
import { generateText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "./tools/index.ts";
import { SYSTEM_PROMPT } from "./system/prompt.ts";
import type { AgentCallbacks } from "../types.ts";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";

const MODEL_NAME = "gpt-5-mini";

Laminar.initialize({
  projectApiKey: process.env.LAMINAR_API_KEY,
});

export const runAgent = async (
  userMessage: string,
  conversationHistory: ModelMessage[],
  callback: AgentCallbacks,
): Promise<any> => {
  const { text } = await generateText({
    model: openai(MODEL_NAME),
    prompt: userMessage,
    system: SYSTEM_PROMPT,
    tools,
    experimental_telemetry: {
      isEnabled: true,
      tracer: getTracer(),
    },
  });

  await Laminar.flush();
  console.log("done");
};
