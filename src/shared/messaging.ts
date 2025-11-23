export type Message =
  | { type: 'loop:update'; payload: { videoId: string } }
  | { type: 'loop:clear' };

export type MessageHandler = (message: Message, sender: chrome.runtime.MessageSender) => void;

export const sendMessage = (message: Message): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
};
