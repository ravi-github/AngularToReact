import { PromptTemplate } from "@langchain/core/prompts";

export const componentPrompt = PromptTemplate.fromTemplate(`
Given the Angular @Component decorator and its metadata, extract:
- Component name
- List of Angular Material imports
- Template file name
- Style file name

Then convert this to a basic React functional component skeleton using MUI.

Angular code:
{angularCode}
`);
