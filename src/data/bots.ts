export type Bot = {
    id: number;
    name: string;
    description: string;
    status: "公開中" | "下書き";
    systemPrompt: string;
  };
  
  export const bots: Bot[] = [
    {
      id: 1,
      name: "カスタマーサポートBot",
      description: "お客様からの質問に回答するAI Botです。",
      status: "公開中",
      systemPrompt:
        "あなたは丁寧なカスタマーサポート担当です。お客様の質問に分かりやすく回答してください。",
    },
    {
      id: 2,
      name: "社内質問Bot",
      description: "社内ルールや業務手順について回答します。",
      status: "下書き",
      systemPrompt:
        "あなたは社内業務を案内するアシスタントです。社員の質問に簡潔に回答してください。",
    },
    {
      id: 3,
      name: "採用案内Bot",
      description: "求人や採用情報について回答します。",
      status: "公開中",
      systemPrompt:
        "あなたは採用担当者です。応募者からの質問に親切に回答してください。",
    },
  ];