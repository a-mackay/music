from dataclasses import dataclass
from datetime import timedelta
import json
from mutagen.id3 import ID3
from mutagen.mp3 import MP3
import os
import sys
from typing import Dict, List, Optional


@dataclass
class MusicFileType:
    type_id: str
    file_extension: str


MP3_TYPE = MusicFileType("mp3", ".mp3")


ALL_MUSIC_FILE_TYPES = [
    MP3_TYPE,
]


ALBUM_SUFFIXES = [
    " (320)",
    " (MP3.320)",
    " (MP3.V0)",
    " (MP3.128)",
    " (MP3.185)",
    " (MP3.192)",
    " (MP3.256)",
    " (MP3.V2)",
    " (MP3.Various)",
    " (MP3.Bad)",
    " (V0)",
    " (64)",
    " (128)",
    " (160)",
    " (192)",
    " (256)",
    " (VBR)",
]


@dataclass
class Album:
    artist: str
    name: str
    year: int
    genre: str
    total_duration_in_seconds: int

    def to_dict(self) -> Dict:
        return {
            "artist": self.artist,
            "name": self.name,
            "year": self.year,
            "genre": self.genre,
            "totalDurationInSeconds": self.total_duration_in_seconds,
        }


def main() -> None:
    path = path_from_args()
    albums = parse_albums(path)
    album_dicts = list(map(lambda album: album.to_dict(), albums))

    # Group the albums by artist:
    albums_by_artist = {}
    for album_dict in album_dicts:
        artist = album_dict["artist"]
        if artist in albums_by_artist:
            artist_albums = albums_by_artist[artist]
            artist_albums.append(album_dict)
        else:
            albums_by_artist[artist] = [album_dict]

    # Sort the albums by name:
    albums_by_artist = {artist: sorted(album_list, key=lambda album: album["name"]) for artist, album_list in albums_by_artist.items()}

    json_str = (json.dumps(albums_by_artist, sort_keys=True, indent=4))
    print(json_str)


def path_from_args() -> str:
    args = sys.argv
    if len(args) < 2:
        raise Exception("Missing folder path argument")
    else:
        return args[1]


def parse_albums(path: str) -> List[Album]:
    albums = []
    for artist in os.listdir(path):
        if not is_hidden(artist):
            artist_path = path + "/" + artist
            for album_name in os.listdir(artist_path):
                if not is_hidden(album_name):
                    album_path = artist_path + "/" + album_name

                    album = Album(
                        artist=format_artist(artist),
                        name=format_album(album_name),
                        year=year_of_first_song(album_path),
                        genre=genre_of_first_song(album_path),
                        total_duration_in_seconds=total_duration_in_seconds_of_songs_in_directory(album_path),
                    )
                    albums.append(album)
    return albums


def first_song(album_path: str) -> str:
    songs = [file for file in os.listdir(album_path) if is_song(file)]
    songs.sort()
    if len(songs) < 1:
        raise Exception(f"Found no songs in {album_path}")
    else:
        first_song = songs[0]
        song_path = album_path + "/" + first_song
        return song_path


def genre_of_first_song(album_path: str) -> str:
    id3 = ID3(first_song(album_path))
    genre = "Unknown"
    try:
        genre = str(id3["TCON"].text[0]).strip()
    except:
        pass

    if len(genre) == 0:
        raise Exception(f"No genre found in {album_path}")
    else:
        return genre


def year_of_first_song(album_path: str) -> int:
    id3 = ID3(first_song(album_path))
    year = str(id3["TDRC"].text[0])
    if "-" in year:
        # probably looks like "2008-00-00"
        year = year.split("-")[0]
    return int(year)


def total_duration_in_seconds_of_songs_in_directory(path: str) -> int:
    songs = [entry for entry in os.listdir(path) if is_song(entry)]
    durations = map(
        lambda song: duration_of_song_in_seconds(path + "/" + song),
        songs
    )
    return sum(durations)


def duration_of_song_in_seconds(song_path: str) -> int:
    file_type = music_file_type(song_path)
    if (file_type == MP3_TYPE):
        mp3 = MP3(song_path)
        return int(mp3.info.length)
    else:
        raise Exception(f"Did not expect music file type {file_type}")


def music_file_type(song_path: str) -> MusicFileType:
    matching_types = [file_type for file_type in ALL_MUSIC_FILE_TYPES if song_path.endswith(file_type.file_extension)]
    if len(matching_types) != 1:
        raise Exception(f"Expected only one music file type to match {song_path}")
    else:
        return matching_types[0]


def is_song(filename: str) -> bool:
    ends_with_song_file_extension = map(
        lambda file_type: filename.endswith(file_type.file_extension),
        ALL_MUSIC_FILE_TYPES
    )
    return any(ends_with_song_file_extension)


def is_hidden(file_or_directory_name: str) -> bool:
    return file_or_directory_name.startswith(".")


def format_artist(artist: str) -> str:
    if artist.endswith(", The"):
        return "The " + artist[:-4]
    else:
        return artist


def format_album(album_name: str) -> str:
    matching_suffix = None
    try:
        matching_suffix = [suffix for suffix in ALBUM_SUFFIXES if album_name.endswith(suffix)][0]
    except:
        pass

    if matching_suffix is None:
        return album_name
    else:
        suffix_length = len(matching_suffix)
        return album_name[:-suffix_length]


if __name__ == "__main__":
    main()