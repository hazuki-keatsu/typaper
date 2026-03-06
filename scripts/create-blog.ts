import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.resolve(__dirname, "../src/data/templates/post.md");
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/blog/new-post.md");
const OUTPUT_SLUG = "new-post";

function getTitle(args: string[]) {
	const titleFlagIndex = args.findIndex(arg => arg === "--title" || arg === "-t");

	if (titleFlagIndex !== -1) {
		return args[titleFlagIndex + 1]?.trim() ?? "";
	}

	return args.join(" ").trim();
}

async function main() {
	const title = getTitle(process.argv.slice(2));

	if (!title) {
		console.error("Missing title. Use --title \"Post Title\" or pass the title directly.");
		process.exitCode = 1;
		return;
	}

	const template = await readFile(TEMPLATE_PATH, "utf8");
	const content = template
		.replaceAll("{Title}", title)
		.replaceAll("{Time}", new Date().toISOString())
		.replaceAll("{Slug}", OUTPUT_SLUG);

	try {
		await writeFile(OUTPUT_PATH, content, { flag: "wx" });
		console.log(`Created ${OUTPUT_PATH}`);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") {
			console.error(`File already exists: ${OUTPUT_PATH}`);
			process.exitCode = 1;
			return;
		}

		throw error;
	}
}

void main();
