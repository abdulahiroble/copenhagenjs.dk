const { graphql } = require("graphql");
import { getEvents, memGetEvents, EventDetails } from "../models/events.js";

export const filterEventStatus = (eventStatus, events) => {
  const now = Date.now();
  switch (eventStatus) {
    case "UPCOMING":
      return events.filter(event => now < event.date.getTime());
      break;
    case "PAST":
      return events.filter(event => now > event.date.getTime());
      break;
    default:
      throw new Error(`status "${eventStatus}" does not exist`);
  }
};

export const events = (parent, { first, last, status }) => {
  const events: EventDetails[] = status
    ? filterEventStatus(status, getEvents())
    : getEvents();

  if (first) {
    return events.slice(0, first);
  }
  if (last) {
    return events.slice(events.length - last, events.length);
  }
  return events;
};

export const event = (parent, { slug }: { slug: string }): EventDetails => {
  const events = memGetEvents();
  const event = events.find(event => event.slug === slug);
  if (event === undefined) {
    throw new Error("Could not find event!");
  }
  return event;
};

export const searchEvents = async (parent, { query }) => {
  const { schema } = require("../schema.js");
  const data = await graphql(
    schema,
    `
      {
        events {
          title
          markdown
          content
          link
          date
          type
        }
      }
    `
  );
  return data.data.events.filter(e => {
    if (e.title.toLowerCase().includes(query.toLowerCase())) return true;
    if (e.markdown.toLowerCase().includes(query.toLowerCase())) return true;
    return false;
  });
};
