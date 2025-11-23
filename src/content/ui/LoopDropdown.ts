type TimeInputGroup = {
  hours: HTMLInputElement;
  minutes: HTMLInputElement;
  seconds: HTMLInputElement;
};

export interface LoopDropdownOptions {
  onStartLoop: (payload: { startTime: number; endTime: number }) => void;
  onStopLoop: () => void;
  getVideoDuration?: () => number | null;
}

export class LoopDropdown {
  readonly element: HTMLDivElement;

  private startInputs: TimeInputGroup;

  private endInputs: TimeInputGroup;

  private visible = false;

  constructor(private readonly options: LoopDropdownOptions) {
    this.element = document.createElement('div');
    this.element.className = 'yl-loop-dropdown';

    const form = document.createElement('form');
    form.className = 'yl-loop-form';

    this.startInputs = this.createTimeInputs();
    this.endInputs = this.createTimeInputs();

    const actions = document.createElement('div');
    actions.className = 'yl-loop-actions';

    const startButton = document.createElement('button');
    startButton.type = 'submit';
    startButton.textContent = 'Start Loop';

    const stopButton = document.createElement('button');
    stopButton.type = 'button';
    stopButton.textContent = 'Stop Loop';
    stopButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.options.onStopLoop();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleFormSubmit();
    });

    const startField = this.buildField('Start', this.startInputs);
    const endField = this.buildField('End', this.endInputs);

    actions.append(startButton, stopButton);
    form.append(startField, endField, actions);
    this.element.appendChild(form);

    form.addEventListener('keydown', (event) => {
      // Prevent YouTube player from hijacking numeric key presses.
      event.stopPropagation();
    });
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.element.classList.toggle('is-visible', visible);
  }

  toggle(): void {
    this.setVisible(!this.visible);
  }

  setTimes(startTime: number | null, endTime: number | null): void {
    this.applySecondsToInputs(this.startInputs, startTime);
    this.applySecondsToInputs(this.endInputs, endTime);
  }

  private createTimeInputs(): TimeInputGroup {
    const hours = this.createNumberInput('Hours');
    const minutes = this.createNumberInput('Minutes', 59);
    const seconds = this.createNumberInput('Seconds', 59);
    return { hours, minutes, seconds };
  }

  private buildField(label: string, inputs: TimeInputGroup): HTMLLabelElement {
    const wrapper = document.createElement('label');
    wrapper.textContent = label;
    const field = document.createElement('div');
    field.className = 'yl-loop-field';

    const minutesLabel = document.createElement('span');
    minutesLabel.textContent = 'min';
    const secondsLabel = document.createElement('span');
    secondsLabel.textContent = 'sec';

    const hoursLabel = document.createElement('span');
    hoursLabel.textContent = 'hr';

    field.append(inputs.hours, hoursLabel, inputs.minutes, minutesLabel, inputs.seconds, secondsLabel);
    wrapper.appendChild(field);
    return wrapper;
  }

  private createNumberInput(placeholder: string, max?: number): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = placeholder;
    input.className = 'yl-loop-input';
    input.min = '0';
    input.inputMode = 'numeric';
    if (max != null) {
      input.max = String(max);
      if (max <= 59) {
        input.maxLength = 2;
      }
    }
    if (!input.maxLength || input.maxLength < 0) {
      input.maxLength = 3;
    }
    return input;
  }

  private applySecondsToInputs(target: TimeInputGroup, secondsValue: number | null): void {
    if (secondsValue == null) {
      target.hours.value = '';
      target.minutes.value = '';
      target.seconds.value = '';
      return;
    }
    const hours = Math.floor(secondsValue / 3600);
    const minutes = Math.floor((secondsValue % 3600) / 60);
    const seconds = secondsValue % 60;
    target.hours.value = String(hours);
    target.minutes.value = String(minutes);
    target.seconds.value = String(seconds).padStart(2, '0');
  }

  private parseTime(inputs: TimeInputGroup): number | null {
    const hours = this.parseInput(inputs.hours, 'Hours');
    const minutes = this.parseInput(inputs.minutes, 'Minutes', 59);
    const seconds = this.parseInput(inputs.seconds, 'Seconds', 59);
    if (hours == null || minutes == null || seconds == null) {
      return null;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  private parseInput(input: HTMLInputElement, label: string, max?: number): number | null {
    if (input.value.trim() === '') {
      input.value = '0';
    }
    const value = Number.parseInt(input.value, 10);
    if (Number.isNaN(value) || value < 0 || (max != null && value > max)) {
      input.setCustomValidity(
        max != null ? `${label} must be between 0 and ${max}` : `${label} must be 0 or greater`
      );
      input.reportValidity();
      input.setCustomValidity('');
      return null;
    }
    return value;
  }

  private handleFormSubmit(): void {
    const startSeconds = this.parseTime(this.startInputs);
    const endSeconds = this.parseTime(this.endInputs);
    if (startSeconds == null || endSeconds == null) {
      return;
    }

    if (startSeconds >= endSeconds) {
      this.endInputs.seconds.setCustomValidity('End time must be after start time.');
      this.endInputs.seconds.reportValidity();
      this.endInputs.seconds.setCustomValidity('');
      return;
    }

    const duration = this.options.getVideoDuration?.();
    if (duration != null && Number.isFinite(duration)) {
      if (endSeconds > duration) {
        this.endInputs.seconds.setCustomValidity(
          `End time must be within video length (${this.formatDuration(duration)})`
        );
        this.endInputs.seconds.reportValidity();
        this.endInputs.seconds.setCustomValidity('');
        return;
      }
      if (startSeconds >= duration) {
        this.startInputs.seconds.setCustomValidity(
          `Start time must be within video length (${this.formatDuration(duration)})`
        );
        this.startInputs.seconds.reportValidity();
        this.startInputs.seconds.setCustomValidity('');
        return;
      }
    }

    this.options.onStartLoop({ startTime: startSeconds, endTime: endSeconds });
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  }
}
