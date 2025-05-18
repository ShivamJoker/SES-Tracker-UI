import { createResource, createSignal, For, onMount } from "solid-js";
import { effect } from "solid-js/web";
import Button from "~/components/Button";
import { EventItem, getEvents } from "~/utils/api";
import { formatDate } from "~/utils/date-time";
import { clientOnly } from "@solidjs/start";

const EventListRows = clientOnly(() => import("../components/EventListRows"));

const Events = () => {
  const [events, setEvents] = createSignal<EventItem[]>([]);
  const [status, setStatus] = createSignal<string>("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [dateRange, setDateRange] = createSignal<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });

  effect(() => {
    console.log(dateRange());
  });

  const fetchEvents = () => {
    setIsLoading(true);
    const { from, to } = dateRange();
    getEvents(
      `from=${from?.toISOString()}&to=${to?.toISOString()}&status=${status()}`,
    )
      .then((res) => {
        setEvents(res.items);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  onMount(() => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    setDateRange({
      from: fromDate,
      to: new Date(),
    });

    fetchEvents();
    console.log(formatDate(new Date()));
  });

  return (
    <section class="">
      <h1>Your SES Email Activity</h1>
      <p>
        Try filtering by status (opened, clicked), or by date for granular
        results. Just enter your preferred date and time, and start
        investigating!
      </p>
      <div class="flex gap-2 ml-auto">
        <div>
          <label for="from">From:</label>
          <input
            type="datetime-local"
            id="from"
            name="from-time"
            value={formatDate(dateRange().from)}
            onChange={(e) =>
              setDateRange((prv) => ({
                ...prv,
                from: e.currentTarget.valueAsDate as Date,
              }))
            }
          />
        </div>

        <div>
          <label for="to">To:</label>
          <input
            type="datetime-local"
            id="to"
            name="to-time"
            value={formatDate(dateRange().to)}
            onChange={(e) =>
              setDateRange((prv) => ({
                ...prv,
                to: e.currentTarget.valueAsDate as Date,
              }))
            }
          />
        </div>

        <div>
          <label for="status">Status:</label>
          <select
            onChange={(e) => {
              setStatus(e.currentTarget.value);
            }}
            value={status()}
            id="status"
          >
            <option value="">NONE</option>
            <option>DELIVERED</option>
            <option>BOUNCED </option>
            <option>DELIVERY_DELAYED</option>
            <option>UNSUBSCRIBED</option>
            <option>RENDERING_FAILED</option>
            <option>COMPLAINED</option>
            <option>REJECTED</option>
            <option>SENT</option>
            <option>CLICKED</option>
          </select>
        </div>
        <div class="self-end w-24">
          <Button
            title="Search"
            onClick={fetchEvents}
            isLoading={isLoading()}
          />
        </div>
      </div>
      <table>
        <thead class="sticky -top-12">
          <tr>
            <th>Status</th>
            <th>Recipient</th>
            <th>Subject</th>
            <th>Event Date</th>
          </tr>
        </thead>
        <EventListRows items={events()} />
      </table>
    </section>
  );
};

export default Events;
