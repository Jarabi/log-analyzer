# Log Analyzer

A Node.js command-line tool for parsing application logs, categorizing entries, storing them in SQLite, and searching or summarizing the imported data.

## Features

- Parses log lines in the format `YYYY-MM-DD HH:mm:ss LEVEL [source] message`
- Ignores blank lines and counts malformed non-empty lines
- Categorizes parsed entries as `payment`, `network`, `database`, `cache`, `performance`, `http`, `auth`, `system`, or `uncategorized`
- Stores entries in a local SQLite database
- Shows totals by log level and category
- Searches log messages with optional level, source, category, and date filters

## Requirements

- Node.js 22.12 or later
- npm

## Install

```bash
npm install
```

## CLI usage

Run the CLI with Node:

```bash
node src/cli.js <command>
```

### Import a log file

```bash
node src/cli.js import sample/app.log
```

The command parses the file and reports how many entries were imported and how many lines were skipped. **Import replaces all existing entries** in the database; it does not append to them.

### Show statistics

```bash
node src/cli.js stats
```

Displays the total number of entries and counts grouped by level and category.

### Search entries

Search messages by a term:

```bash
node src/cli.js search timeout
```

Apply optional filters together:

```bash
node src/cli.js search --level ERROR --source api --category network \
  --since "2026-11-02 14:00" --until 2026-11-03 --limit 10
```

Search options:

| Option | Description |
| --- | --- |
| `-l, --level <level>` | Filter by `DEBUG`, `INFO`, `WARN`, or `ERROR` |
| `-s, --source <source>` | Match a source exactly, such as `auth`, `db`, or `api` |
| `-c, --category <category>` | Match a category exactly |
| `-d, --since <date>` | Inclusive lower timestamp bound |
| `-u, --until <date>` | Exclusive upper timestamp bound |
| `-n, --limit <number>` | Maximum results to display; defaults to `20` |

The search term is optional; without it, the other filters (or no filters) can be used to list entries. Date filters accept `YYYY-MM-DD`, `YYYY-MM-DD HH:mm`, or `YYYY-MM-DD HH:mm:ss`. Results are shown newest first. For an inclusive full-day range, use the day after the desired end date as `--until`.

Use `node src/cli.js --help` or `node src/cli.js <command> --help` for CLI help.

## Log format

Each non-empty line must match:

```text
<timestamp> <LEVEL> [<source>] <message>
```

For example:

```text
2026-11-02 14:03:21 ERROR [auth] Login failed for user 42
```

The timestamp must use `YYYY-MM-DD HH:mm:ss`; supported levels are `DEBUG`, `INFO`, `WARN`, and `ERROR`. The source is any non-empty value inside square brackets. The message may contain any remaining text. Non-matching lines are skipped.

## Database

The CLI creates `logs.db` in the current working directory when needed. Imported rows include the timestamp, level, source, category, and message. To use a different database location, run the CLI from the directory where you want `logs.db` created.

## Sample logs

The `sample/` directory contains `app.log`, `big.log`, `messy.log`, and `system.log`. For example:

```bash
node src/cli.js import sample/messy.log
node src/cli.js stats
```

## Generate sample logs

Generate a specified number of random entries in `sample/system.log`:

```bash
node src/generateLogs.js 50
```

## Tests

Run the test suite with:

```bash
npm test
```
