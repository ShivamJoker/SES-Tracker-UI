import Input from "~/components/Input";
import { getAPIWithAuth } from "~/utils/api";

import { SendEmailCommandInput } from "@aws-sdk/client-sesv2";
import Button from "~/components/Button";
import { createSignal } from "solid-js";
import toast from "solid-toast";
import { WretchError } from "wretch/resolver";
type Form = {
  from: string;
  mailto: string;
  subject: string;
  content: string;
};

const NewMail = () => {
  const [isLoading, setIsLoading] = createSignal(false);
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const { subject, from, content, mailto } = Object.fromEntries(
        formData.entries(),
      ) as Form;

      setIsLoading(true);
      const api = await getAPIWithAuth();
      const body: SendEmailCommandInput = {
        FromEmailAddress: from,
        ConfigurationSetName: "default",
        Destination: { ToAddresses: [mailto] },
        Content: {
          Simple: {
            Body: { Html: { Data: content } },
            Subject: { Data: subject },
          },
        },
      };

      const res = await api
        .url("/mail")
        .errorType("json")
        .json(body)
        .post()
        .json<{ messageId: string }>();

      toast.success(`Email sent, with message id: ${res.messageId}`);
    } catch (error) {
      const err = error as WretchError;
      console.log(err.json.error);
      toast.error(err.json.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit} class="w-[700px] p-2 flex flex-col gap-2">
        <h1>Send a New Email with SES</h1>
        <Input
          label="From Email"
          name="from"
          placeholder="hannah@your-domain.com"
          type="email"
          required
        />
        <Input
          label="Destination / To"
          name="mailto"
          placeholder="pie@example.com"
          type="email"
          required
        />
        <Input
          label="Subject"
          name="subject"
          required
          placeholder="A simple subject goes a long way"
        />
        <div>
          <label for="content">Email Text</label>
          <textarea
            placeholder="A good email body which doesn't land in Spam"
            id="content"
            name="content"
            rows={10}
          />
        </div>
        <Button title="Send" type="submit" isLoading={isLoading()} />
      </form>
    </section>
  );
};

export default NewMail;
