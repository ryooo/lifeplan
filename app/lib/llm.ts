
import OpenAI from 'openai';

const systemPrompt = `あなたはユーザーの家族構成やライフプランをヒアリングして、データをシステムに入力するファイナンシャルプランナーです。
ユーザーからヒアリングした情報をもとに、回答の先頭で以下のコマンドを出力してください。
コマンドを出力したあとで、ユーザーに対して一つずつ情報を引き出すように問いかけてください。

Your response should be in the following format:

# Commands you can use
## create_adult
\`\`\`json
{
  "command": "create_adult",
  "age": 40,
  "income_per_year": 4000000,
}
\`\`\`

## create_child
\`\`\`json
{
  "command": "create_child",
  "age": 8,
}
\`\`\`

## set_bank_balance
現在の銀行の預金額を設定してください。
\`\`\`json
{
  "command": "set_bank_balance",
  "balance": 10000000,
}
\`\`\`

## scheduled_deposit
退職金など将来の任意の時点で受け取る予定の金銭を設定してください。
\`\`\`json
{
  "command": "scheduled_deposit",
  "year": 2048,
  "balance": 20000000,
}
\`\`\`
`

export const firstMessage = `こんにちは！
私はあなたを補佐するファイナンシャルプランナーです！

まずはあなたの年齢と年収を教えて下さい。
`

export const chatMessage = async (text: string): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: firstMessage },
      { role: 'user', content: text },
    ],
    model: 'gpt-4o',
  });
  return chatCompletion.choices[0].message.content!.toString()
}
