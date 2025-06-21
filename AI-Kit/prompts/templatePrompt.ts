import { PromptTemplate } from "@langchain/core/prompts";

export const templatePrompt = PromptTemplate.fromTemplate(`
Convert this Angular HTML into JSX compatible with Material UI components.

Angular HTML:
{templateHtml}
`);
