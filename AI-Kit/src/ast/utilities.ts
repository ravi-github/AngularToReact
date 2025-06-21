import { Project, SyntaxKind, PropertyAssignment } from "ts-morph";

export type AngularComponentMetadata = {
  className?: string;
  selector?: string;
  templateUrl?: string;
  styleUrl?: string;
  importedModules: string[];
  methodNames: string[];
};

export function extractAngularComponentMetadata(angularCode: string): any {
  const project = new Project();
  const sourceFile = project.createSourceFile("source.ts", angularCode);

  const allClasses = sourceFile.getClasses();
  const componentInstance = allClasses[0];
  const className = componentInstance?.getName(); 

  let selector: string | undefined;
  let templateUrl: string | undefined;
  let styleUrl: string | undefined;
  let importedModules: string[] = [];

  const decorator = componentInstance?.getDecorator("Component");
  const arg = decorator?.getArguments()[0];

  if (arg && arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
    const obj = arg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

    const getStringProp = (name: string) => 
      obj.getProperty(name)
        ?.getFirstDescendantByKind(SyntaxKind.StringLiteral)
        ?.getLiteralValue();

    const getArrayProp = (name: string) =>
      obj.getProperty(name)
        ?.getFirstDescendantByKind(SyntaxKind.ArrayLiteralExpression)
        ?.getElements()
        .map(e => e.getText()) ?? [];

    selector = getStringProp("selector");
    templateUrl = getStringProp("templateUrl");
    styleUrl = getStringProp("styleUrl");
    importedModules = getArrayProp("imports");
  }

  const methodNames = componentInstance?.getMethods().map(m => m.getName()) ?? [];

  return {
    className,
    selector,
    templateUrl,
    styleUrl,
    importedModules,
    methodNames
  };
}
