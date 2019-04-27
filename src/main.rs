use byteorder::{NativeEndian, ReadBytesExt, WriteBytesExt};
use glib;
use mpris_player::{Metadata, MprisPlayer, PlaybackStatus};
use serde::{Deserialize, Serialize};
use std::io::{self, Read, Write};
use std::str;
use std::sync::Arc;
use std::thread;

#[derive(Serialize, Deserialize)]
#[serde(remote = "PlaybackStatus")]
enum PlaybackStatusDef {
    Playing,
    Paused,
    Stopped,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "command", content = "data")]
enum Command {
    Play,
    Pause,
    PlayPause,
    Next,
    Previous,
    Raise,
    Update {
        #[serde(with = "PlaybackStatusDef")]
        status: PlaybackStatus,
        title: String,
        artists: Vec<String>,
        art_url: Option<String>,
        can_go_next: bool,
        can_go_previous: bool,
        can_play: bool,
        can_pause: bool,
    },
}

#[derive(Debug, Clone)]
struct Player {
    mpris: Arc<MprisPlayer>,
}

impl Player {
    fn new() -> Self {
        let mpris = MprisPlayer::new(
            "Firefox".to_string(),
            "Firefox media integration".to_string(),
            "firefox".to_string(),
        );

        // Reset metadata
        mpris.set_can_raise(false);
        mpris.set_can_seek(false);
        mpris.set_can_go_next(false);
        mpris.set_can_go_previous(false);
        mpris.set_can_play(false);
        mpris.set_can_pause(false);
        mpris.set_can_set_fullscreen(false);
        mpris.set_maximum_rate(1.0);

        // Connect signals
        mpris.connect_play(move || {
            write(Command::Play).expect("Could not write Play.");
        });

        mpris.connect_pause(move || {
            write(Command::Pause).expect("Could not write Pause.");
        });

        mpris.connect_play_pause(move || {
            write(Command::PlayPause).expect("Could not write PlayPause.");
        });

        mpris.connect_previous(move || {
            write(Command::Previous).expect("Could not write Previous.");
        });

        mpris.connect_next(move || {
            write(Command::Next).expect("Could not write Next.");
        });

        mpris.connect_raise(move || {
            write(Command::Raise).expect("Could not write Raise.");
        });

        Player { mpris }
    }
}

fn read() -> Result<Option<Command>, Box<std::error::Error>> {
    // Read length of message
    let length = io::stdin().read_u32::<NativeEndian>();

    // We need to check if the read was ok, since
    // firefox passes weird data on startup sometimes.
    match length {
        Ok(length) => {
            // Read the message
            let mut buf = vec![0u8; length as usize];
            io::stdin().read_exact(&mut buf)?;

            // Turn into string and unserialize it
            Ok(Some(serde_json::from_str(str::from_utf8(&buf)?)?))
        }
        Err(_) => Ok(None)
    }
}

fn write(data: Command) -> Result<(), Box<std::error::Error>> {
    // Serialize into bytes
    let buf = serde_json::to_string(&data)?.into_bytes();

    // Send u32 length first
    io::stdout().write_u32::<NativeEndian>(buf.len() as u32)?;
    // then the data
    io::stdout().write_all(&buf)?;
    // and lastly flush the stream
    io::stdout().flush()?;

    Ok(())
}

fn main() -> Result<(), Box<std::error::Error>> {
    // Aquire the main context so we can schedule stuff
    glib::MainContext::default().acquire();

    let player = Player::new();

    // Communication between stdin thread and main
    let (tx, rx) = glib::MainContext::channel(glib::PRIORITY_DEFAULT);

    thread::spawn(move || loop {
        let command = read().expect("Reading from stdin failed.");
        if let Some(c) = command {
            tx.send(c).expect("Couldn't send data to channel");
        }
    });

    rx.attach(None, move |command| {
        match command {
            Command::Update {
                status,
                title,
                artists,
                art_url,
                can_go_next,
                can_go_previous,
                can_play,
                can_pause,
            } => {
                let mut metadata = Metadata::new();
                metadata.title = Some(title);
                metadata.artist = Some(artists);
                metadata.art_url = art_url;
                //metadata.album = Some("Album".into());
                metadata.length = Some(0);
                metadata.track_number = Some(0);

                player.mpris.set_metadata(metadata);
                player.mpris.set_playback_status(status);
                player.mpris.set_can_go_next(can_go_next);
                player.mpris.set_can_go_previous(can_go_previous);
                player.mpris.set_can_pause(can_pause);
                player.mpris.set_can_play(can_play);
            }
            _ => eprintln!("Received command that shouldn't be handled in native land."),
        }

        // Tell glib not to remove our callback
        glib::Continue(true)
    });

    // Run main loop so we don't immediately quit and scheduling works
    glib::MainLoop::new(None, false).run();
    Ok(())
}
