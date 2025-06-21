import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { componentPrompt } from "./prompts/componentPrompt";
import { logicPrompt } from "./prompts/logicPrompt";
import { templatePrompt } from "./prompts/templatePrompt";
import { promises as fs } from "fs";
import chalk from "chalk";
import { extractAngularComponentMetadata } from "./ast/utilities";

dotenv.config();

const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4",
});

async function runConversion() {
  console.log(chalk.green.bold("🚀 Starting Angular to React conversion..."));

  const componentPath = "src/input/todo-header/todo-header.component.txt";
  const templatePath = "src/input/todo-header/todo-header.component.html";

  const angularCode = await fs.readFile(componentPath, "utf-8");
  const htmlTemplate = await fs.readFile(templatePath, "utf-8");

  const metaData = extractAngularComponentMetadata(angularCode);
  console.log(chalk.yellow("🔍 Extracted Angular Metadata:"), metaData);

  // Step 1: Convert Component Metadata
  const componentPromptInput = await componentPrompt.format({ angularCode });
  const componentResponse = await model.call([{ role: "user", content: componentPromptInput }]);

  // Step 2: Convert Class Logic
  const logicPromptInput = await logicPrompt.format({ classCode: angularCode });
  const logicResponse = await model.call([{ role: "user", content: logicPromptInput }]);

  // Step 3: Convert Template HTML to JSX
  const templatePromptInput = await templatePrompt.format({ templateHtml: htmlTemplate });
  const templateResponse = await model.call([{ role: "user", content: templatePromptInput }]);

  // Step 4: Combine everything for preview (optional)
  const combinedPreview = `
${componentResponse.content}

// Logic
${logicResponse.content}

// JSX
return (
${templateResponse.content}
);
`;

  // Create output directory
  const outputDir = "src/output/todo-header";
  await fs.mkdir(outputDir, { recursive: true });

  // Save individual parts
  await fs.writeFile(`${outputDir}/TodoHeaderComponent.tsx`, String(componentResponse.content));
  await fs.writeFile(`${outputDir}/TodoHeaderLogic.tsx`, String(logicResponse.content));
  await fs.writeFile(`${outputDir}/TodoHeaderJSX.tsx`, String(templateResponse.content));
  await fs.writeFile(`${outputDir}/TodoHeaderCombinedPreview.tsx`, combinedPreview);

  console.log(chalk.green.bold("✅ React conversion complete."));
  console.log(chalk.cyan(`📝 Output written to: ${outputDir}`));
}

runConversion();
