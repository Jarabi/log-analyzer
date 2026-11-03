# Log Analyzer

A small Node.js project for parsing and inspecting application logs from plain text files. It reads log entries, validates them against a supported format, ignores blank lines, and reports how many lines were skipped because they were malformed.

## What it does

- Parses log lines in the format:
  `YYYY-MM-DD HH:mm:ss LEVEL [source] message`
- Ignores empty lines
- Skips malformed records without crashing
- Prints the parsed entries and the number of skipped lines
- Includes sample logs and tests for parser behavior

Example valid line:

```text
2026-11-02 14:03:21 ERROR [auth] Login failed for user 42
```

## Project structure

```text
.
├── README.md
├── package.json
├── sample/
│   ├── app.log
│   ├── messy.log
│   └── system.log
├── src/
│   ├── generateLogs.js
│   ├── main.js
│   ├── parser.js
│   └── reader.js
└── test/
    ├── parser.test.js
    └── reader.test.js
```

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

```bash
npm install
```

## Usage

Run the analyzer against a log file:

```bash
node src/main.js sample/app.log
```

Example output:

```text
Parsed 6 entries, skipped 0 lines
[
  {
    timestamp: '2026-11-02 14:03:15',
    level: 'INFO',
    source: 'server',
    message: 'Server started on port 3000'
  },
  ...
]
```

## Supported log format

The parser accepts lines that match this pattern:

```text
<timestamp> <LEVEL> [<source>] <message>
```

Where:

- `timestamp` must be in `YYYY-MM-DD HH:mm:ss` format
- `LEVEL` is one of `DEBUG`, `INFO`, `WARN`, or `ERROR`
- `source` is a bracketed value such as `auth`, `db`, `server`, or `api`
- `message` is the remaining text after the source field

## Generating sample logs

The project includes a utility that creates random log data:

```bash
node src/generateLogs.js 50
```

This writes output to `sample/system.log`.

## Testing

Run the test suite with:

```bash
npm test
```

The tests cover:

- valid log parsing
- malformed line rejection
- skipping bad lines while keeping valid entries

## Notes

- Blank lines are ignored automatically.
- Malformed lines are counted via the `skipped` value returned by `readLogFile()`.
- The main entry point is designed to work as a simple log parser CLI.
