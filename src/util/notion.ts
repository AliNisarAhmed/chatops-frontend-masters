import { Client } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
const notion = new Client({ auth: process.env.NOTION_SECRET });

export async function notionApi(endpoint: string, body: {}) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.NOTION_SECRET}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch((err) => console.error(err));

  if (!res || !res.ok) {
    console.error(res);
  }

  const data = await res?.json();
  return data;
}

export async function getNewitems(): Promise<NewItem[]> {
  const notionData = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID ?? "",
    filter: {
      property: "Status",
      status: {
        equals: "Not started",
      },
    },
    page_size: 100,
  });

  console.log("Notion Query results: ", JSON.stringify(notionData.results, null, 4));

  const openItems = notionData.results.map((item: any) => {
    return {
      opinion: item.properties.Project.title[0].text.content,
      spiceLevel: item.properties.spiceLevel.select.name,
      status: item.properties.Status.status.name,
    };
  });

  return openItems;
}

export async function saveItem(item: NewItem) {
  const res = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID || "",
    },
    properties: {
      title: {
        title: [{ text: { content: item.opinion } }],
      },
      spiceLevel: {
        select: {
          name: item.spiceLevel,
        },
      },
      submitter: {
        rich_text: [{ text: { content: `@${item.submitter} on Slack` } }],
      },
    },
  });

  console.log("Notion API Response: ", res);
}
