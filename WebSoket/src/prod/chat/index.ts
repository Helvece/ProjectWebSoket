export class FormaterChat {
  _format: string;
  constructor(format: string) {
    this._format = format;
  }
  format(parameters: { [key: string]: string } = {}): Promise<string> {
    return new Promise((resolve) => {
      let message = this._format;
      for (const [key, value] of Object.entries(parameters)) {
        message = message.replace(`{${key}}`, value);
      }
      resolve(message);
    });
  }
}

export class LegacyFormaterChat extends FormaterChat {
  constructor() {
    super("[{time}][{name}] -> {message}");
  }
}
