import { PromptTemplate } from "@langchain/core/prompts";

export const logicPrompt = PromptTemplate.fromTemplate(`
Convert the Angular TypeScript class logic into React using functional components and hooks.

Only include event handlers and injected service logic.

Class:
{classCode}
`);
