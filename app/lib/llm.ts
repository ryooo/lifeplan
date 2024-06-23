import OpenAI from 'openai';
import {ChatMessages} from "@/app/lib/chat";
import ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam;

const commandsPrompt = `## createAdult
大人の家族を追加するときに使用してください。
\`\`\`json
{
  "command": "createAdult",
  "age": 40,
  "incomePerYearJpy": 400
}
\`\`\`

## createChild
\`\`\`json
{
  "command": "createChild",
  "age": 8
}
\`\`\`

## setBankBalance
現在の銀行の預金額を設定してください。
\`\`\`json
{
  "command": "setBankBalance",
  "balanceJpy": 1000
}
\`\`\`

## setManagedAssetBalance
現在の銀行預金以外の運用資産残高を設定してください。
\`\`\`json
{
  "command": "setBankBalance",
  "balanceJpy": 1000
}
\`\`\`

## scheduledDeposit
退職金など将来の任意の時点で受け取る予定の金銭を設定してください。（このコマンドは積極的にユーザーにヒアリングせず、ユーザーから修正の要望があったときに使ってください）
\`\`\`json
{
  "command": "scheduledDeposit",
  "year": 2048,
  "balanceJpy": 2000
}
\`\`\`

## updateFamilyExpence
家族の生活費を修正する場合に、生活費の月額を設定してください。（このコマンドは積極的にユーザーにヒアリングせず、ユーザーから修正の要望があったときに使ってください）
\`\`\`json
{
  "command": "updateFamilyExpence",
  "balanceJpy": 20
}
\`\`\`

## updateFamilyPension
家族の年金を修正する場合に、家族の年金の月額を設定してください。（このコマンドは積極的にユーザーにヒアリングせず、ユーザーから修正の要望があったときに使ってください）
\`\`\`json
{
  "command": "updateFamilyPension",
  "balanceJpy": 20
}
\`\`\`
`

const systemPrompt = `あなたはユーザーの家族構成やライフプランをヒアリングして、データをシステムに入力するファイナンシャルプランナーです。
ユーザーからヒアリングした情報をもとに、回答の先頭で以下のコマンドを出力してください。
コマンドを出力したあとで、ユーザーに対して一つずつ情報を引き出すように問いかけてください。

※ コマンドに入力するすべての金額の数値は1万円単位で設定すること。（例：400万円の場合は400を設定）（これはユーザーに伝えないこと）

Your response should be in the following format:

# Commands you can use
${commandsPrompt}
`

export const firstMessage = `こんにちは！
私はあなたを補佐するファイナンシャルプランナーです！

まずはあなたの年齢と年収を教えて下さい。
`

export const chatMessage = async (text: string, history: ChatMessages, familyCondition: string, prompt: string): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const messages: ChatCompletionMessageParam[] = [
    {role: 'system', content: systemPrompt},
  ]
  if (familyCondition !== '') {
    messages.push(
      {
        role: 'system',
        content: `ここまでのヒアリングでシステムに入力されている家族の状況は以下のとおりです。\n${familyCondition}`
      }
    )
  }
  if (prompt !== '') {
    messages.push(
      {
        role: 'system',
        content: prompt
      }
    )
  }
  if (history.length > 0) {
    messages.push(
      {
        role: 'system',
        content: `ユーザーとのここまでの会話は以下のとおりです。`
      }
    )
    for (const historyMessage of history) {
      messages.push(
        {
          role: historyMessage.speaker === 'you' ? "user" : "assistant",
          content: historyMessage.message,
        }
      )
    }
  }
  messages.push(
    {role: 'user', content: text}
  )

  const chatCompletion = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4o',
  });
  return chatCompletion.choices[0].message.content!.toString()
}

export const fixJson = async (json: string): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `ユーザーから壊れたjson文字列が送られます。jsonが保有する情報を損なわないように注意しつつ、JSON.parseで正常にパース可能な正しいjson文字列に修正し、修正後のjson文字列のみを出力すること。\nなお、jsonは以下のいずれかのコマンドであること。\n${commandsPrompt}`
      },
      {role: 'user', content: json},
    ],
    model: 'gpt-4o',
  });
  return chatCompletion.choices[0].message.content!.toString()
}
