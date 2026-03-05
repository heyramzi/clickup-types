/**
 * Output Formatting
 *
 * Dual-mode output: tables for TTY, JSON for pipes and AI agents.
 * Respects --json flag and NO_COLOR environment variable.
 */

export function isTTY(): boolean {
	return process.stdout.isTTY === true;
}

export function useJson(opts: { json?: boolean }): boolean {
	return opts.json === true || !isTTY();
}

// ── Color helpers (respects NO_COLOR) ─────────────────

const noColor = !!process.env.NO_COLOR;

const RESET = noColor ? "" : "\x1b[0m";
const BOLD = noColor ? "" : "\x1b[1m";
const DIM = noColor ? "" : "\x1b[2m";
const GREEN = noColor ? "" : "\x1b[32m";
const YELLOW = noColor ? "" : "\x1b[33m";
const CYAN = noColor ? "" : "\x1b[36m";
const RED = noColor ? "" : "\x1b[31m";
const MAGENTA = noColor ? "" : "\x1b[35m";

export const color = {
	bold: (s: string) => `${BOLD}${s}${RESET}`,
	dim: (s: string) => `${DIM}${s}${RESET}`,
	green: (s: string) => `${GREEN}${s}${RESET}`,
	yellow: (s: string) => `${YELLOW}${s}${RESET}`,
	cyan: (s: string) => `${CYAN}${s}${RESET}`,
	red: (s: string) => `${RED}${s}${RESET}`,
	magenta: (s: string) => `${MAGENTA}${s}${RESET}`,
};

// ── JSON output ───────────────────────────────────────

export function printJson(data: unknown): void {
	console.log(JSON.stringify(data, null, 2));
}

// ── Table output ──────────────────────────────────────

export interface Column<T> {
	key: keyof T | ((row: T) => string);
	label: string;
	maxWidth?: number;
	align?: "left" | "right";
}

function getValue<T>(row: T, col: Column<T>): string {
	if (typeof col.key === "function") {
		return col.key(row);
	}
	const val = row[col.key];
	if (val === null || val === undefined) return "";
	return String(val);
}

function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return str.slice(0, max - 1) + "\u2026";
}

export function printTable<T>(rows: T[], columns: Column<T>[]): void {
	if (rows.length === 0) {
		console.log(color.dim("  No results."));
		return;
	}

	// Compute column widths
	const widths = columns.map((col) => {
		const headerLen = col.label.length;
		const maxDataLen = rows.reduce((max, row) => Math.max(max, getValue(row, col).length), 0);
		const natural = Math.max(headerLen, maxDataLen);
		return col.maxWidth ? Math.min(natural, col.maxWidth) : Math.min(natural, 60);
	});

	// Print header
	const header = columns.map((col, i) => color.bold(col.label.padEnd(widths[i]))).join("  ");
	console.log(header);
	console.log(columns.map((_, i) => color.dim("─".repeat(widths[i]))).join("  "));

	// Print rows
	for (const row of rows) {
		const line = columns
			.map((col, i) => {
				const val = truncate(getValue(row, col), widths[i]);
				return col.align === "right" ? val.padStart(widths[i]) : val.padEnd(widths[i]);
			})
			.join("  ");
		console.log(line);
	}
}

// ── Detail view ───────────────────────────────────────

export function printKeyValue(pairs: Array<[string, string | null | undefined]>): void {
	const maxKeyLen = pairs.reduce((max, [key]) => Math.max(max, key.length), 0);
	for (const [key, value] of pairs) {
		const label = color.bold(key.padEnd(maxKeyLen));
		console.log(`  ${label}  ${value ?? color.dim("—")}`);
	}
}

// ── Progress output (always to stderr) ────────────────

export function progress(msg: string): void {
	if (isTTY()) {
		process.stderr.write(`${color.dim(msg)}\n`);
	}
}

// ── Error output ──────────────────────────────────────

export function printError(msg: string): void {
	process.stderr.write(`${color.red("Error:")} ${msg}\n`);
}

// ── Success output ────────────────────────────────────

export function printSuccess(msg: string): void {
	console.log(`${color.green("✓")} ${msg}`);
}
