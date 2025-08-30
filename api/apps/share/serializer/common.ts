class MessageSerializer {
  message: string;

  constructor(messageObject: Partial<MessageSerializer>) {
    Object.assign(this, messageObject);
  }

  static create(message: string): MessageSerializer {
    return new MessageSerializer({ message });
  }
}

export { MessageSerializer };
