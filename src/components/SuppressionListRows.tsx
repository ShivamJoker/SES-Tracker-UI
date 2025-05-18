import { For } from "solid-js";
import { EventItem, SupressionItem } from "~/utils/api";

const EventListRows = (props: { items: SupressionItem[] | undefined }) => {
  return (
    <tbody>
      <For each={props.items}>
        {(item) => {
          const eventDate = new Date(item.createdAt);
          return (
            <tr>
              <td>{item.status}</td>
              <td>{item.bounceType}</td>
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
