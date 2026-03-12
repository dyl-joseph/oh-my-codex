#!/usr/bin/env node

const argv = process.argv.slice(2);
const first = (argv[0] || "").toLowerCase();
const provider =
	first === "claude" || first === "gemini"
		? first
		: process.env.OMX_ASK_PROVIDER || "";
const prompt = (
	first === "claude" || first === "gemini" ? argv.slice(1) : argv
).join(" ");

const stdout = process.env.OMX_ASK_STUB_STDOUT ?? `OUT:${provider}:${prompt}\n`;
const stderr = process.env.OMX_ASK_STUB_STDERR ?? "";
const exitCode = Number.parseInt(process.env.OMX_ASK_STUB_EXIT_CODE ?? "0", 10);

if (stdout.length > 0) process.stdout.write(stdout);
if (stderr.length > 0) process.stderr.write(stderr);
process.exit(Number.isFinite(exitCode) ? exitCode : 0);
