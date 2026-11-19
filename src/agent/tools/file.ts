import { tool } from "ai";
import { z } from "zod";
import fs from "node:fs/promises";
import nodePath from "node:path";

export const readFile = tool({
  description:
    "Read the full contents of a file at the given path, always use this to read a file",
  inputSchema: z.object({
    path: z
      .string()
      .describe("The realtive or absolutepath to the file to read"),
  }),
  execute: async ({ path }) => {
    try {
      const content = await fs.readFile(path, "utf8");
      return content;
    } catch (e) {
      return `There was an error reading the file, here is the native error from node.js: ${e}`;
    }
  },
});

export const writeFile = tool({
  description:
    "Write content to a file at the given path. Create the file if it does not exist and overwrite it if it does exist",
  inputSchema: z.object({
    path: z
      .string()
      .describe("The realtive or absolutepath to the file to write"),
    content: z.string().describe("The content to write to the file"),
  }),
  execute: async ({ path, content }) => {
    try {
      const dir = nodePath.dirname(path);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path, content, "utf8");
      return `Succesfully wrote ${content.length} characters to ${path}. You should verify by listing files`;
    } catch (e) {
      return `There was an error writing to the file, here is the native error from node.js: ${e}`;
    }
  },
});

export const listFiles = tool({
  description: "List all the files and directories in the specified directory",
  inputSchema: z.object({
    directory: z
      .string()
      .describe("The directory to list files and directories in")
      .default("."),
  }),
  execute: async ({ directory }) => {
    try {
      const entries = fs.readdir(directory, { withFileTypes: true });
      const items = (await entries).map((entry) => {
        const type = entry.isDirectory() ? "[dir]]" : "[file]";
        return `${type} ${entry.name}`;
      });
      return items.length > 0
        ? items.join("\n")
        : `Directory ${directory} is empty`;
    } catch (e) {
      return `There was an error listing files, here is the native error from node.js: ${e}`;
    }
  },
});

export const deleteFile = tool({
  description:
    "Delete a file at the specified path. Use with caution as this is irreversible",
  inputSchema: z.object({
    path: z
      .string()
      .describe("The realtive or absolutepath to the file to delete"),
  }),
  execute: async ({ path }) => {
    try {
      await fs.unlink(path);
      return `Succesfully deleted ${path}`;
    } catch (e) {
      return `There was an error deleting the file, here is the native error from node.js: ${e}`;
    }
  },
});
