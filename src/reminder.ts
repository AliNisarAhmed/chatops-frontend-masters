import { type Handler, schedule } from "@netlify/functions";
import { getNewitems } from "./util/notion";
import { blocks, slackApi } from "./util/slack";

const postNewNotionItemsToSlack: Handler = async () => {
  const items = (await getNewitems()) as NewItem[];

  await slackApi("chat.postMessage", {
    channel: process.env.SLACK_CHANNEL_ID,
    blocks: [
      blocks.section({
        text: [
          "Here are the opinions waiting judgement: ",
          "",
          ...items.map((item) => `- ${item.opinion}: ${item.spiceLevel}`),
          "",
          `See all items: <https://notion.com/${process.env.NOTION_DATABASE_ID}|in Notion>`,
        ].join("\n"),
      }),
    ],
  });

  return {
    statusCode: 200,
    body: "",
  };
};

export const handler = schedule("* * * * *", postNewNotionItemsToSlack);
