import React from "react";
import { Link } from "react-router-dom";
import eulaText from "../EULA.md?raw";

export default function EulaPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">利用規約・EULA</h1>
      <div className="prose prose-sm dark:prose-invert">
        {/* MarkdownをHTMLとして表示 */}
        <div dangerouslySetInnerHTML={{ __html: marked.parse(eulaText) }} />
      </div>
      <div className="mt-8">
        <Link to="/" className="text-blue-600 hover:underline">トップに戻る</Link>
      </div>
    </div>
  );
}
