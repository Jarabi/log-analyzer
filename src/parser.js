const LINE_REGEX = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (DEBUG|INFO|WARN|ERROR) \[([^\]]+)\] (.*)$/;

export function parseLine(line) {
    const match = LINE_REGEX.exec(line.trim());
    if (!match) return null; // malformed line

    const [, timestamp, level, source, message] = match;
    return { timestamp, level, source, message };
}