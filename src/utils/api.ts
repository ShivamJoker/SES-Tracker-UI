import { fetchAuthSession } from "aws-amplify/auth";
import toast from "solid-toast";
import Wretch from "wretch";

export const API = Wretch(
  "https://nhgi6ryfpi.execute-api.us-east-1.amazonaws.com",
);

export const getAPIWithAuth = async () => {
  const authRes = await fetchAuthSession();
  return API.auth(`Bearer ${authRes.tokens?.accessToken.toString()}`);
};

type Paginate<T> = {
  items: T[];
  nextToken: null | string;
};
export type EventRes = Paginate<EventItem>;

export type EventItem = {
  subject: string;
  status: string;
  createdAt: string;
  emailTo: string[];
  reason?: string;
  bounceType?: string;
  messageId: string;
  updatedAt?: string;
};

export type SupressionListRes = Paginate<SupressionItem>;

export type SupressionItem = {
  PK: string;
  SK: string;
  bouncedRecipients: BouncedRecipient[];
  bounceSubType: string;
  bounceType: string;
  createdAt: string;
  emailTo: string[];
  feedbackId: string;
  GSI1PK: string;
  GSI1SK: string;
  messageId: string;
  remoteMtaIp: string;
  reportingMTA: string;
  status: string;
  subject: string;
  timestamp: string;
};

export type BouncedRecipient = {
  action: string;
  diagnosticCode: string;
  emailAddress: string;
  status: string;
};

export const getEvents = async (queryParams: string) => {
  const authRes = await fetchAuthSession();
  return API.auth(`Bearer ${authRes.tokens?.accessToken.toString()}`)
    .url("/events?" + queryParams)
    .get()
    .notFound(() => {
      toast.error(
        "No items found for this status and date range.\nTry selecting a bigger range and removing status filter.",
      );
    })
    .json<EventRes>();
};
