class YoutubePlayer extends Player {
    video: HTMLVideoElement;

    constructor() {
        super("youtube");
    }

    init(): void {
        //console.log('init');

        let pageManager = document.getElementById('page-manager');
        let watchFlexy = document.getElementsByTagName('ytd-watch-flexy')[0];

        if (watchFlexy == null) {
            this.waitForElement(pageManager, (el) => {
                return el.nodeName == 'YTD-WATCH-FLEXY';
            }, this.addWatchFlexyObserver.bind(this))
        } else {
            this.addWatchFlexyObserver(watchFlexy);
        }
    }

    addWatchFlexyObserver(watchFlexy: Element) {
        let infoContents = document.getElementById('info-contents');
        let infoRenderer = infoContents.querySelector('ytd-video-primary-info-renderer');
        if (infoRenderer == null) {
            this.waitForElement(infoContents, (el) => {
                return el.nodeName == 'YTD-VIDEO-PRIMARY-INFO-RENDERER';
            }, this.addTitleObserver.bind(this))
        } else {
            this.addTitleObserver(infoRenderer);
        }
        
        // TODO: Implement next and previous
        //console.log(watchFlexy.querySelector('.ytp-left-controls'));

        let videoContainer = watchFlexy.querySelector('ytd-player > div');
        let video = videoContainer.querySelector('video') as HTMLVideoElement;
        //console.log('videoContainer', videoContainer);

        if (video == null) {
            this.waitForElement(videoContainer, (el) => {
                return el.id == 'movie_player';
            }, () => {
                this.attachVideoEvents(videoContainer.querySelector('video') as HTMLVideoElement)
            });
        } else {
            this.attachVideoEvents(video);
        }
    }

    attachVideoEvents(video: HTMLVideoElement) {
        this.video = video;

        this.video.addEventListener('play', () => {
            this.setPlaying();
        });
        this.video.addEventListener('pause', () => {
            this.setPaused();
        });

        if (this.video.paused) {
            this.setPaused();
        } else {
            this.setPlaying();
        }
    }

    addTitleObserver(infoRenderer: Element) {
        let titleElement = infoRenderer.querySelector('h1.title > yt-formatted-string');

        let titleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == 'childList') {
                    if (mutation.addedNodes.length > 0
                        && mutation.addedNodes[0].nodeName == '#text') {
                        this.set({
                            title: mutation.target.textContent
                        });
                    }
                }
            });
        });

        titleObserver.observe(titleElement, {
            childList: true,
        });

        this.set({
            title: titleElement.textContent
        });
    }

    play(): void {
        if (this.video.paused) this.video.play();
    }
    pause(): void {
        if (!this.video.paused) this.video.pause();
    }
    playPause(): void {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    next(): void {
        console.warn('NYI: youtube next')
    }
    previous(): void {
        console.warn('NYI: youtube previous')
    }
}

{
    let player = new YoutubePlayer();
    player.init();
}