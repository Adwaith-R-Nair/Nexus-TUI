export type ChatRequest = {
    prompt: string;
    apiKey: string;
};

export type ChatResponse = {
    text: string;
};

export type ChatFunction = (request: ChatRequest) => Promise<ChatResponse>;