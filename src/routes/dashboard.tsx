import { createResource, createSignal, For, onMount } from "solid-js";
import { getEvents } from "~/utils/api";
import "chartjs-adapter-date-fns";
import Chart from "chart.js/auto";
import { effect, isServer } from "solid-js/web";
import { eachHourOfInterval, isSameHour, startOfHour } from "date-fns";

const Dashboard = () => {
  const [events, { refetch }] = createResource(getEvents, {
    ssrLoadFrom: "initial",
  });

  const [eventsCount, setEventsCount] = createSignal({
    DELIVERED: 0,
    SENT: 0,
    BOUNCED: 0,
    COMPLAINED: 0,
    OPENED: 0,
    CLICKED: 0,
  });

  let chartCanvas!: HTMLCanvasElement;

  onMount(() => {
    if (!events()?.items) {
      refetch();
    }
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    effect(() => {
      if (!events()?.items) return;

      const from = fromDate;
      const to = new Date();

      const allowedStatuses = [
        "DELIVERED",
        "SENT",
        "BOUNCED",
        "COMPLAINED",
        "OPENED",
        "CLICKED",
      ] as const;

      const groupData: Record<
        string,
        Record<string, number>
      > = Object.fromEntries(
        allowedStatuses.map((status) => [status, {}]),
      ) as Record<string, Record<string, number>>;

      const validHours = new Set(
        eachHourOfInterval({ start: from, end: to }).map((d) =>
          d.toISOString(),
        ),
      );

      const items = events()?.items ?? [];
      const uniqueHours = new Set<string>();
      for (const event of items) {
        const rawDate = event.updatedAt ?? event.createdAt;
        if (!rawDate) continue;

        const date = new Date(rawDate);
        if (isNaN(date.getTime())) continue;

        const hour = startOfHour(date).toISOString();
        const status = event.status;

        if (
          !allowedStatuses.includes(status as (typeof allowedStatuses)[number])
        )
          continue;
        if (!validHours.has(hour)) continue;
        setEventsCount((ev) => {
          const _ev = { ...ev };
          //@ts-ignore
          _ev[status]++;
          return _ev;
        });
        uniqueHours.add(hour);
        groupData[status][hour] = (groupData[status][hour] ?? 0) + 1;
      }

      try {
        new Chart(chartCanvas, {
          type: "bar",
          data: {
            labels: [...uniqueHours],

            datasets: [
              {
                label: "SENT",
                data: Object.values(groupData.SENT),
              },
              {
                label: "DELIVERED",
                data: Object.values(groupData.DELIVERED),
              },

              {
                label: "BOUNCED",
                data: Object.values(groupData.BOUNCED),
              },

              {
                label: "COMPLAINED",
                data: Object.values(groupData.COMPLAINED),
              },
              {
                label: "OPENED",
                data: Object.values(groupData.OPENED),
              },
              {
                label: "CLICKED",
                data: Object.values(groupData.CLICKED),
              },
            ],
          },
          options: {
            scales: {
              x: {
                type: "timeseries",
                // stacked: true,
                // time: { displayFormats: { hour: "hh / dd" } },
              },
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    });
  });

  return (
    <section class="w-[800px]">
      <h1>Planning to send some emails today?</h1>
      <p>
        It's always a good day for sending emails. More emails, more visibility.
        <br />
        "I don't want more visibility", said no one ever.
        <br />1 - Who you are sending to, 2 - The subject, 3 - Something in the
        body
      </p>
      <p>
        So, send that email you have been whipping up. It's as smooth as 1, 2,
        3.
      </p>
      <div class="max-w-[130px] mt-4">
        <a href="/new-mail">
          <button>Send Now {"  "}&rarr;</button>
        </a>
      </div>
      <h2 class="my-4">Events from past week</h2>
      <canvas ref={chartCanvas} />
      <h2 class="my-4">How many emails did you send last week?</h2>
      <p>
        During this period, you had{" "}
        <strong>{eventsCount().BOUNCED} bounces</strong>,{" "}
        <strong>{eventsCount().COMPLAINED} complaints</strong>,{" "}
        <strong>{eventsCount().OPENED} opens</strong>, and{" "}
        <strong>{eventsCount().CLICKED} clicks</strong>.
        <br />
        Not bad, eh?
      </p>
      <table>
        <thead>
          <tr>
            <th>Event Type </th>
            <th>Total Events</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sent</td>
            <td>{eventsCount().SENT}</td>
          </tr>
          <tr>
            <td>Delivered</td>
            <td>{eventsCount().DELIVERED}</td>
          </tr>
          <tr>
            <td>Bounced</td>
            <td>{eventsCount().BOUNCED}</td>
          </tr>
          <tr>
            <td>Complained</td>
            <td>{eventsCount().COMPLAINED}</td>
          </tr>
          <tr>
            <td>Opened</td>
            <td>{eventsCount().OPENED}</td>
          </tr>
          <tr>
            <td>Clicked</td>
            <td>{eventsCount().CLICKED}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default Dashboard;
