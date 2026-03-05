import { program } from "../src/index.js";

program.parseAsync(process.argv).catch((err: Error) => {
	process.stderr.write(`Error: ${err.message}\n`);
	process.exit(1);
});
