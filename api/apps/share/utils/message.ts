import { MessagesType, MessageResponseType } from '../interfaces';

/**
 * Create message response.
 *
 * @param {string} message - The message.
 * @returns {{
 * message: string
 * errorCode: string
 * }} - The message object.
 */
export const createMessage = (message: string, errorCode?: string): MessageResponseType => {
  return Object.assign({ message }, errorCode ? { errorCode } : {});
};

/**
 * Create messages response.
 *
 * @param {string | string[]} messages - The list messages.
 * @returns {{
 * messages: string[]
 * }} - The messages object.
 */
export const createMessages = (messages: string | string[]): MessagesType => {
  return { messages: Array.isArray(messages) ? messages : [messages] };
};
