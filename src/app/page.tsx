import { readFileSync } from "node:fs";
import path from "node:path";

type Article = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  published: boolean;
};

function loadWelcome(): Article {
  const file = path.join(process.cwd(), "content/articles/welcome.json");
  return JSON.parse(readFileSync(file, "utf8")) as Article;
}

export default function HomePage() {
  const article = loadWelcome();
  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", fontFamily: "system-ui" }}>
      <h1>{article.title}</h1>
      <p>{article.summary}</p>
      <p>{article.body}</p>
      <p>
        <a href="/admin/">Edit content</a>
      </p>
    </main>
  );
}
