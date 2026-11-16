import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import type {
  EvalData,
  SingleTurnResult,
  MultiTurnEvalData,
  MultiTurnResult,
} from "./types.ts";
import { buildMessages } from "./utils.ts";

const TOOL_DEFINITIONS: any = {
  readFile: {
    description: "Read the contents of a file at the specified path",
    parameters: z.object({
      path: z.string().describe("the path of the file that you want to read"),
    }),
  },
  writeFile: {
    description: "Write given content to a file at the specified path",
    parameters: z.object({
      path: z.string().describe("the path of the file that you want to read"),
      content: z
        .string()
        .describe("the content that you want to write to the file"),
    }),
  },
  listFiles: {
    description: "List all the files in the directory",
    parameters: z.object({
      path: z.string().describe("the path of the file that you want to read"),
    }),
  },
  deleteFile: {
    description: "Delete a file at the specified path",
    parameters: z.object({
      path: z.string().describe("the path of the file that you want to delete"),
    }),
  },
  runCommand: {
    description: "Execute a shell command and return its output",
    parameters: z.object({
      path: z.string().describe("the shell command that you want to run"),
    }),
  },
};

export const singleTurnExecutorWithMocks = async (data: EvalData) => {
  const messages = buildMessages(data);
  const tools: ToolSet = {};
  for (const toolName of data.tools) {
    const def = TOOL_DEFINITIONS[toolName as any];

    if (def) {
      tools[toolName] = tool({
        description: def.description,
        inputSchema: def.parameters,
      });
    }
  }
  const { toolCalls } = await generateText({
    model: openai(data.config?.model ?? "gpt-5-mini"),
    messages,
    tools,
    stopWhen: stepCountIs(1),
    temperature: data.config?.temperature ?? undefined,
  });

  const calls = toolCalls.map((tc) => ({
    toolName: tc.toolName,
    args: "args" in tc ? tc.args : tc,
  }));

  const toolNames = toolCalls.map((tc) => tc.toolName);

  return {
    toolCalls,
    toolNames,
    selectedAny: toolCalls.length > 0,
  };
};
