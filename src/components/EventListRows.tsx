import { For } from "solid-js";
import { EventItem } from "~/utils/api";
const statusColors = {
  DELIVERED: "#2ed573",
  SENT: "#ffd700",
  BOUNCED: "#ff546b",
  COMPLAINED: "#ff546b",
  OPENED: "#9d89fe",
  CLICKED: "#f460ff",
};
const EventListRows = (props: { items: EventItem[] | undefined }) => {
  return (
    <tbody>
      <For each={props.items}>
        {(item) => {
          const eventDate = new Date(item.updatedAt ?? item.createdAt);
          return (
            <tr>
              <td>
                <span
                  class="rounded-full text-center text-sm dark:text-white px-3 py-[2px] capitalize block"
                  style={{
                    "background-color": statusColors[item.status] + "66",
                  }}
                >
                  {item.status.toLowerCase()}
                </span>
              </td>
              <td>{item.emailTo[0]}</td>
              <td>{item.subject}</td>
              <td>
                <time datetime={eventDate.toString()}>
                  {eventDate.toLocaleString()}
                </time>
              </td>
            </tr>
          );
        }}
      </For>
    </tbody>
  );
};

export default EventListRows;
