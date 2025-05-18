import { createResource, createSignal, For, onMount } from "solid-js";
import { effect } from "solid-js/web";
import Button from "~/components/Button";
import {
  EventItem,
  getAPIWithAuth,
  getEvents,
  SupressionItem,
  SupressionListRes,
} from "~/utils/api";
import { formatDate } from "~/utils/date-time";
import { clientOnly } from "@solidjs/start";

const SuppressionListRows = clientOnly(
  () => import("../components/SuppressionListRows"),
);

const Supression = () => {
  const [items, setItems] = createSignal<SupressionItem[]>([]);
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

  const fetchEvents = async () => {
    setIsLoading(true);
    const { from, to } = dateRange();
    try {
      const api = await getAPIWithAuth();

      const res = await api
        .url("/suppression-list")
        .get()
        .json<SupressionListRes>();

      setItems(res.items);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
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
      <h1>Supressed Users / Emails</h1>
      <p>
        It's a list that you maintain from your side, to prevent sending
        unsolicited emails.
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
            <th>Reason</th>
            <th>Bounce type</th>
            <th>Recipient</th>
            <th>Subject</th>
            <th>Event Date</th>
          </tr>
        </thead>
        <SuppressionListRows items={items()} />
      </table>
    </section>
  );
};

export default Supression;
