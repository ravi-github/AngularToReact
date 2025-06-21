import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { componentPrompt } from "./app/prompts/componentPrompt.js";
import { logicPrompt } from "./app/prompts/logicPrompt.js";
import { templatePrompt } from "./app/prompts/templatePrompt.js";
import * as fs from "fs/promises";

dotenv.config();

const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4",
});

async function runConversion() {
  const angularCode = await fs.readFile("src/app/components/todo-list/todo-header/todo-header.component.ts", "utf-8");
  const html = await fs.readFile("src/app/components/todo-list/todo-header/todo-header.component.html", "utf-8");
  
  // Step 1: Convert @Component Metadata
  const componentChain = await componentPrompt.format({ angularCode });
  const componentResult = await model.call([{ role: "user", content: componentChain }]);

  // Step 2: Convert Class Logic
  const logicChain = await logicPrompt.format({ classCode: angularCode });
  const logicResult = await model.call([{ role: "user", content: logicChain }]);

  // Step 3: Convert HTML to JSX
  const templateChain = await templatePrompt.format({ templateHtml: html });
  const templateResult = await model.call([{ role: "user", content: templateChain }]);

  // Step 4: Combine Output
  const finalReactCode = `
${componentResult.content}

// Logic
${logicResult.content}

// JSX
return (
${templateResult.content}
)
`;

  await fs.writeFile("output/TodoHeader.tsx", finalReactCode);
  console.log("✅ React conversion complete: output/TodoHeader.tsx");
}

runConversion();
