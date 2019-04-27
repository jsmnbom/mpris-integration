type PlaybackStatus = "Playing" | "Paused" | "Stopped"

class PlayerInfo {
    constructor(
        public status: PlaybackStatus,
        public title: string,
        public artists: string[],
        public art_url: string | null,
        public can_go_next: boolean,
        public can_go_previous: boolean,
        public can_play: boolean,
        public can_pause: boolean) {
    }
}

abstract class Player {
    public info: PlayerInfo;
    port: browser.runtime.Port;
    constructor(portName: string) {
        this.info = new PlayerInfo("Stopped", "", [], null, false, false, false, false);
        this.port = browser.runtime.connect(null, { name: portName });
        this.port.onMessage.addListener((command: Command) => {
            switch (command.command) {
                case "Play":
                    this.play();
                    break;
                case "Pause":
                    this.pause()
                    break;
                case "PlayPause":
                    this.playPause();
                    break;
                case "Next":
                    this.next();
                    break;
                case "Previous":
                    this.previous();
                    break;
                default:
                    console.warn("Received command that shouldn't be handled in add-on content script land.", command);
            }
        });
    }

    sendInfo(): void {
        this.port.postMessage(this.info);
    }

    public set(values: {
        status?: PlaybackStatus,
        title?: string,
        artists?: string[],
        art_url?: string | null,
        can_go_next?: boolean,
        can_go_previous?: boolean,
        can_play?: boolean,
        can_pause?: boolean
    }) {
        //console.log("PlayerInfo.set", values);
        Object.assign(this.info, values);
        this.sendInfo();
    }

    public setPlaying() {
        if (this.info.status != "Playing") {
            this.set({
                can_pause: true,
                can_play: false,
                status: "Playing"
            });
        }
    }

    public setPaused() {
        if (this.info.status != "Paused") {
            this.set({
                can_pause: false,
                can_play: true,
                status: "Paused"
            });
        }
    }

    waitForElement(target: Element, check: (addedElement: Element) => boolean, callback: (addedElement: Element) => void) {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (check(node as Element)) {
                            observer.disconnect();
                            callback(node as Element)
                        }
                    });
                }
            });
        });

        observer.observe(target, {
            childList: true
        });
    }

    abstract play(): void;
    abstract pause(): void;
    abstract playPause(): void;
    abstract next(): void;
    abstract previous(): void;
}