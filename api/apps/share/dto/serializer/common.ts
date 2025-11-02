class MessageSerializer {
  messages: string[];

  constructor(messageObject: Partial<MessageSerializer>) {
    Object.assign(this, messageObject);
  }

  static create(message: string): MessageSerializer {
    return new MessageSerializer({ messages: [message] });
  }
}

export { MessageSerializer };
