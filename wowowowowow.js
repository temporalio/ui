import { readFileSync } from 'fs';

const files = [
  'events.canceled.json',
  'events.completed.json',
  'events.failed.json',
  'events.running.json',
  'events.terminated.json',
  'events.timed-out.json',
];

const result = {};

for (const file of files) {
  const content = readFileSync('./src/fixtures/' + file, 'utf-8');
  const events = JSON.parse(content);
  for (const event of events) {
    result[event.eventType] = event;
  }
}

console.log(JSON.stringify(Object.keys(result)));
