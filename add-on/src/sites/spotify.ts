class SpotifyPlayer extends Player {
    buttons: Element;

    constructor() {
        super("spotify");
    }

    init(): void {
        //console.log("init");
        let main = document.getElementById('main');
        let nowPlayingBarLeft: Element = document.querySelector('.now-playing-bar__left');

        if (nowPlayingBarLeft == null) {
            this.waitForElement(main, (el) => {
                return el.nodeName == 'DIV' && el.classList.contains('Root');
            }, () => {
                this.addMainObserver(document.getElementsByClassName('now-playing-bar__left')[0] as Element);
            });
        } else {
            this.addMainObserver(nowPlayingBarLeft);
        }
    }

    addMainObserver(nowPlayingBarLeft: Element) {
        //console.log("Main observer");
        this.buttons = document.querySelector('#main .player-controls__buttons');

        let updateButton = (button: Element) => {
            if (button.classList.contains('spoticon-play-16')) {
                if (this.info.status != "Paused") {
                    this.setPaused();
                }
            } else if (button.classList.contains('spoticon-pause-16')) {
                if (this.info.status != "Playing") {
                    this.setPlaying();
                }
            } else if (button.classList.contains('spoticon-skip-forward-16')) {
                this.set({
                    can_go_next: !button.classList.contains('control-button--disabled')
                });
            } else if (button.classList.contains('spoticon-skip-back-16')) {
                this.set({
                    can_go_previous: !button.classList.contains('control-button--disabled')
                });
            }
        };

        let buttonsObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == 'attributes') {
                    updateButton(mutation.target as Element);
                }
            });
        });

        buttonsObserver.observe(this.buttons, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });

        [...this.buttons.children].forEach(updateButton);

        let nowPlaying = nowPlayingBarLeft.querySelector('.now-playing');
        if (nowPlaying == null) {
            this.waitForElement(nowPlayingBarLeft, (el) => {
                return el.nodeName == 'DIV' && el.classList.contains('now-playing');
            }, this.addNowPlayingObserver.bind(this));
        } else {
            this.addNowPlayingObserver(nowPlaying as Element);
        }
    }

    addNowPlayingObserver(el: Element) {
        //console.log("Now playing observer");
        let observer = new MutationObserver((mutations) => {
            let updateArtists = false;
            mutations.forEach((mutation) => {
                if (mutation.type == 'characterData') {
                    if (mutation.target.parentElement.matches('.track-info__name a')) {
                        this.set({
                            title: mutation.target.textContent
                        });
                    }
                    if (mutation.target.parentElement.matches('.track-info__artists a')) {
                        updateArtists = true;
                    }
                } else if (mutation.type == 'attributes') {
                    let target = mutation.target as Element;
                    if (target.classList.contains('cover-art-image-loaded')) {
                        let style = window.getComputedStyle(target, null);
                        this.set({
                            art_url: style.backgroundImage.slice(4, -1).replace(/"/g, "")
                        });
                    }
                }
            });
            if (updateArtists) {
                this.set({
                    artists: [...el.querySelectorAll('div.track-info > div.track-info__artists a')].map(x => x.textContent)
                });
            }
        });

        observer.observe(el, {
            characterData: true,
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });

        this.set({
            title: el.querySelector('.track-info__name a').textContent,
            artists: [...el.querySelectorAll('div.track-info > div.track-info__artists a')].map(x => x.textContent)
        });
    }

    play(): void {
        let button = (this.buttons.querySelector('.spoticon-play-16') as HTMLElement);
        if (button) button.click();
    }
    pause(): void {
        let button = (this.buttons.querySelector('.spoticon-pause-16') as HTMLElement);
        if (button) button.click();
    }
    playPause(): void {
        let button = ((this.buttons.querySelector('.spoticon-pause-16') || this.buttons.querySelector('.spoticon-play-16')) as HTMLElement);
        if (button) button.click();
    }
    next(): void {
        let button = (this.buttons.querySelector('.spoticon-skip-forward-16') as HTMLElement);
        if (button) button.click();
    }
    previous(): void {
        let button = (this.buttons.querySelector('.spoticon-skip-back-16') as HTMLElement);
        if (button) button.click();
    }
}

{
    let player = new SpotifyPlayer();
    player.init();
}
